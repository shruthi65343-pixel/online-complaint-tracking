const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintPriority,
  addAdminRemark
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/complaints', getAllComplaints);
router.get('/complaints/:id', getComplaintById);
router.patch('/complaints/:id/status', updateComplaintStatus);
router.patch('/complaints/:id/priority', updateComplaintPriority);
router.post('/complaints/:id/remarks', addAdminRemark);

module.exports = router;
