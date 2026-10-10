const crypto = require('crypto');
const Complaint = require('../models/Complaint');

// Generate unique non-guessable tracking reference
const generateTrackingId = () => {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars
  return `RT-${year}-${randomChars}`;
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/complaints - Submit complaint
const submitComplaint = async (req, res) => {
  try {
    const {
      category,
      title,
      description,
      fullName,
      email,
      phone,
      categoryDetails = {},
      location = {},
      attachment = {},
      isSensitive: userSensitiveFlag
    } = req.body;

    if (!category || !title || !description || !fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: category, title, description, fullName, and email are mandatory.'
      });
    }

    const isHarassment = category === 'Harassment and Personal Safety';
    const isSensitive = isHarassment || Boolean(userSensitiveFlag);

    // Duplicate detection check
    // Check for similar active complaint in same category within the last 14 days
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const queryConditions = {
      category,
      createdAt: { $gte: twoWeeksAgo },
      status: { $nin: ['Resolved', 'Closed'] }
    };

    let possibleDuplicate = false;
    let duplicateNote = '';

    // Check by affected address or title similarity if provided
    const addressToMatch = categoryDetails.affectedAddress || categoryDetails.affectedArea || location.addressText;
    if (addressToMatch && addressToMatch.trim().length > 3) {
      const existingMatch = await Complaint.findOne({
        ...queryConditions,
        $or: [
          { 'categoryDetails.affectedAddress': new RegExp(addressToMatch.trim().substring(0, 15), 'i') },
          { 'categoryDetails.affectedArea': new RegExp(addressToMatch.trim().substring(0, 15), 'i') },
          { 'location.addressText': new RegExp(addressToMatch.trim().substring(0, 15), 'i') }
        ]
      });

      if (existingMatch) {
        possibleDuplicate = true;
        duplicateNote = `System notice: Similar active complaint registered in category "${category}" at/near similar location within the last 14 days.`;
      }
    }

    let trackingId;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      trackingId = generateTrackingId();
      const existing = await Complaint.findOne({ trackingId });
      if (!existing) isUnique = true;
      attempts++;
    }

    const verificationCode = generateVerificationCode();

    // Prepare initial timeline entry
    const initialStatusHistory = [
      {
        status: 'Submitted',
        action: 'Complaint Registered',
        remarks: 'Complaint lodged successfully. Waiting for assignment and intake assessment.',
        internalNotes: duplicateNote ? `[Duplicate Warning] ${duplicateNote}` : 'Initial intake.',
        changedBy: fullName || 'System Intake',
        changedAt: new Date()
      }
    ];

    const newComplaint = new Complaint({
      trackingId,
      verificationCode,
      userId: req.user ? req.user._id : null,
      category,
      title,
      description,
      fullName,
      email: email.toLowerCase(),
      phone: phone || '',
      isSensitive,
      categoryDetails,
      location: {
        locationProvided: Boolean(location.locationProvided),
        locationType: location.locationType || 'none',
        locationContext: location.locationContext || 'unspecified',
        coordinates: {
          latitude: location.coordinates?.latitude || null,
          longitude: location.coordinates?.longitude || null,
          accuracy: location.coordinates?.accuracy || null
        },
        addressText: location.addressText || '',
        city: location.city || '',
        consentGranted: Boolean(location.consentGranted)
      },
      attachment: {
        fileName: attachment.fileName || '',
        fileType: attachment.fileType || '',
        fileSize: attachment.fileSize || 0,
        fileData: attachment.fileData || ''
      },
      status: 'Submitted',
      priority: isHarassment ? 'High' : (categoryDetails.urgencyLevel === 'Critical' ? 'Urgent' : 'Medium'),
      statusHistory: initialStatusHistory,
      publicRemarks: 'Your complaint has been registered and is queued for verification.',
      internalNotes: duplicateNote ? `System Flag: Potential duplicate area report.` : ''
    });

    const savedComplaint = await newComplaint.save();

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      trackingId: savedComplaint.trackingId,
      verificationCode: savedComplaint.verificationCode,
      status: savedComplaint.status,
      category: savedComplaint.category,
      createdAt: savedComplaint.createdAt,
      possibleDuplicateWarning: possibleDuplicate ? duplicateNote : null
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint.',
      error: error.message
    });
  }
};

// GET /api/complaints/track/:trackingId - Track complaint with privacy protection
const trackComplaint = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const providedCode = req.query.verificationCode || req.headers['x-verification-code'];

    const complaint = await Complaint.findOne({ trackingId: trackingId.toUpperCase().trim() });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'No complaint found with this tracking reference.'
      });
    }

    const isAuthorUser = req.user && (
      (complaint.userId && complaint.userId.toString() === req.user._id.toString()) ||
      complaint.email.toLowerCase() === req.user.email.toLowerCase()
    );
    const isAdmin = req.user && req.user.role === 'admin';
    const isCodeVerified = providedCode && providedCode.toString().trim() === complaint.verificationCode;

    const isFullyAuthorized = isAdmin || isAuthorUser || isCodeVerified;

    // Filter public timeline (hide internalNotes from public view)
    const sanitizedTimeline = complaint.statusHistory.map((item) => ({
      _id: item._id,
      status: item.status,
      action: item.action,
      remarks: item.remarks,
      changedBy: item.changedBy,
      changedAt: item.changedAt
    }));

    // If sensitive complaint and NOT fully authorized
    if (complaint.isSensitive && !isFullyAuthorized) {
      return res.json({
        success: true,
        isSensitiveRestricted: true,
        trackingId: complaint.trackingId,
        category: complaint.category,
        status: complaint.status,
        priority: complaint.priority,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        publicRemarks: complaint.publicRemarks,
        timeline: sanitizedTimeline,
        message: 'This complaint is marked confidential. Enter the 6-digit Verification Code or log in with the reporter account to view full report details and responses.'
      });
    }

    // Public / Non-sensitive or Authorized response
    // For general public tracking, mask personal email and exact GPS coordinates to prevent stalker/data harvesting
    const maskedEmail = isFullyAuthorized
      ? complaint.email
      : complaint.email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length));

    const maskedFullName = isFullyAuthorized
      ? complaint.fullName
      : complaint.fullName.split(' ').map((p, i) => i === 0 ? p : p[0] + '***').join(' ');

    const sanitizedLocation = {
      locationProvided: complaint.location.locationProvided,
      locationType: complaint.location.locationType,
      locationContext: complaint.location.locationContext,
      city: complaint.location.city,
      addressText: isFullyAuthorized ? complaint.location.addressText : (complaint.location.addressText ? complaint.location.addressText.substring(0, 25) + '...' : ''),
      // Only authorized user or admin sees exact GPS coordinates
      coordinates: isFullyAuthorized ? complaint.location.coordinates : (complaint.location.locationProvided ? { note: 'Protected for privacy' } : null)
    };

    return res.json({
      success: true,
      isSensitiveRestricted: false,
      isFullyAuthorized,
      complaint: {
        id: complaint._id,
        trackingId: complaint.trackingId,
        category: complaint.category,
        title: complaint.title,
        description: complaint.description,
        fullName: maskedFullName,
        email: maskedEmail,
        isSensitive: complaint.isSensitive,
        categoryDetails: complaint.categoryDetails,
        location: sanitizedLocation,
        status: complaint.status,
        priority: complaint.priority,
        assignedOfficer: complaint.assignedOfficer,
        publicRemarks: complaint.publicRemarks,
        statusHistory: sanitizedTimeline,
        comments: complaint.comments.filter((c) => isFullyAuthorized ? true : !c.isInternal),
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        agingDays: complaint.agingDays,
        attachment: complaint.attachment?.fileName ? {
          fileName: complaint.attachment.fileName,
          fileType: complaint.attachment.fileType,
          fileSize: complaint.attachment.fileSize
        } : null
      }
    });
  } catch (error) {
    console.error('Error tracking complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint tracking data.',
      error: error.message
    });
  }
};

// GET /api/complaints/my - Authenticated user's complaints
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      $or: [
        { userId: req.user._id },
        { email: req.user.email.toLowerCase() }
      ]
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user complaints.',
      error: error.message
    });
  }
};

// POST /api/complaints/:id/provide-info - Complainant provides requested info
const provideAdditionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, verificationCode } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Information text cannot be empty.'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Check authorization: must be complaint owner, matching verification code, or matching email
    const isAuthor = req.user && (
      (complaint.userId && complaint.userId.toString() === req.user._id.toString()) ||
      complaint.email.toLowerCase() === req.user.email.toLowerCase()
    );
    const isCodeMatch = verificationCode && verificationCode.toString().trim() === complaint.verificationCode;

    if (!isAuthor && !isCodeMatch) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Please provide valid verification code or log in as reporter.'
      });
    }

    const authorName = req.user ? req.user.name : complaint.fullName;

    // Add comment
    complaint.comments.push({
      author: authorName,
      authorRole: 'user',
      message: message.trim(),
      isInternal: false,
      createdAt: new Date()
    });

    // If it was awaiting information, advance status to 'Under Review'
    if (complaint.status === 'Awaiting Information') {
      complaint.status = 'Under Review';
      complaint.statusHistory.push({
        status: 'Under Review',
        action: 'Information Provided by User',
        remarks: `Complainant submitted requested additional information: "${message.substring(0, 80)}..."`,
        internalNotes: 'User responded to information request.',
        changedBy: authorName,
        changedAt: new Date()
      });
    } else {
      complaint.statusHistory.push({
        status: complaint.status,
        action: 'Complainant Added Note',
        remarks: `Complainant update: "${message.substring(0, 80)}..."`,
        internalNotes: '',
        changedBy: authorName,
        changedAt: new Date()
      });
    }

    await complaint.save();

    return res.json({
      success: true,
      message: 'Additional information recorded successfully.',
      status: complaint.status,
      comments: complaint.comments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit additional information.',
      error: error.message
    });
  }
};

module.exports = {
  submitComplaint,
  trackComplaint,
  getMyComplaints,
  provideAdditionalInfo
};
