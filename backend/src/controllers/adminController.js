const Complaint = require('../models/Complaint');

// GET /api/admin/stats - Overview metrics
const getAdminStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const submitted = await Complaint.countDocuments({ status: 'Submitted' });
    const underReview = await Complaint.countDocuments({ status: 'Under Review' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const awaitingInfo = await Complaint.countDocuments({ status: 'Awaiting Information' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const closed = await Complaint.countDocuments({ status: 'Closed' });
    const sensitive = await Complaint.countDocuments({ isSensitive: true });

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Priority breakdown
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Aged complaints calculation (Unresolved and older than 3 days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const agedOver3Days = await Complaint.countDocuments({
      status: { $nin: ['Resolved', 'Closed'] },
      createdAt: { $lt: threeDaysAgo }
    });

    const agedOver7Days = await Complaint.countDocuments({
      status: { $nin: ['Resolved', 'Closed'] },
      createdAt: { $lt: sevenDaysAgo }
    });

    return res.json({
      success: true,
      stats: {
        total,
        statusCounts: {
          submitted,
          underReview,
          inProgress,
          awaitingInfo,
          resolved,
          closed
        },
        sensitive,
        aged: {
          over3Days: agedOver3Days,
          over7Days: agedOver7Days
        },
        categoryStats,
        priorityStats
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch administrator statistics.',
      error: error.message
    });
  }
};

// GET /api/admin/complaints - Filtered & Paginated list
const getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, search, page = 1, limit = 50, sensitiveOnly } = req.query;

    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (priority && priority !== 'All') {
      filter.priority = priority;
    }
    if (sensitiveOnly === 'true') {
      filter.isSensitive = true;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { trackingId: searchRegex },
        { title: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
        { 'categoryDetails.institution': searchRegex },
        { 'categoryDetails.affectedAddress': searchRegex },
        { 'categoryDetails.department': searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json({
      success: true,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      complaints
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints list.',
      error: error.message
    });
  }
};

// GET /api/admin/complaints/:id - Detail view
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('userId', 'name email role phone');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    return res.json({
      success: true,
      complaint
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint details.',
      error: error.message
    });
  }
};

// PATCH /api/admin/complaints/:id/status - Update Status
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks, internalNotes, assignedOfficer } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'In Progress', 'Awaiting Information', 'Resolved', 'Closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    const oldStatus = complaint.status;
    complaint.status = status;

    if (remarks) {
      complaint.publicRemarks = remarks;
    }
    if (internalNotes) {
      complaint.internalNotes = internalNotes;
    }
    if (assignedOfficer) {
      complaint.assignedOfficer = assignedOfficer;
    }

    if (status === 'Resolved' || status === 'Closed') {
      complaint.resolvedAt = new Date();
    } else {
      complaint.resolvedAt = null;
    }

    // Append to transparent timeline
    complaint.statusHistory.push({
      status,
      action: `Status transition: ${oldStatus} -> ${status}`,
      remarks: remarks || `Status changed to ${status}`,
      internalNotes: internalNotes || '',
      changedBy: req.user ? `${req.user.name} (${req.user.role})` : 'Administrator',
      changedAt: new Date()
    });

    const updated = await complaint.save();

    return res.json({
      success: true,
      message: `Status updated to "${status}" successfully.`,
      complaint: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint status.',
      error: error.message
    });
  }
};

// PATCH /api/admin/complaints/:id/priority - Update Priority
const updateComplaintPriority = async (req, res) => {
  try {
    const { priority, remarks } = req.body;

    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    const oldPriority = complaint.priority;
    complaint.priority = priority;

    complaint.statusHistory.push({
      status: complaint.status,
      action: `Priority changed: ${oldPriority} -> ${priority}`,
      remarks: remarks || `Priority re-assessed to ${priority}`,
      internalNotes: `Priority update by ${req.user.name}`,
      changedBy: req.user.name,
      changedAt: new Date()
    });

    const updated = await complaint.save();

    return res.json({
      success: true,
      message: `Priority updated to ${priority}.`,
      complaint: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint priority.',
      error: error.message
    });
  }
};

// POST /api/admin/complaints/:id/remarks - Add comment / note
const addAdminRemark = async (req, res) => {
  try {
    const { message, isInternal } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    complaint.comments.push({
      author: req.user.name,
      authorRole: 'admin',
      message: message.trim(),
      isInternal: Boolean(isInternal),
      createdAt: new Date()
    });

    if (!isInternal) {
      complaint.publicRemarks = message.trim();
    } else {
      complaint.internalNotes = message.trim();
    }

    await complaint.save();

    return res.json({
      success: true,
      message: isInternal ? 'Internal note added.' : 'Public remark dispatched.',
      comments: complaint.comments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add remark.',
      error: error.message
    });
  }
};

module.exports = {
  getAdminStats,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintPriority,
  addAdminRemark
};
