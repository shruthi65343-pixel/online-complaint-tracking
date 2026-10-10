const express = require('express');
const router = express.Router();
const {
  submitComplaint,
  trackComplaint,
  getMyComplaints,
  provideAdditionalInfo
} = require('../controllers/complaintController');
const { authenticate, authenticateOptional } = require('../middleware/auth');

// Public or optionally authenticated complaint submission
router.post('/', authenticateOptional, submitComplaint);

// Track complaint by tracking ID (privacy protected, optional auth or verification code header/query)
router.get('/track/:trackingId', authenticateOptional, trackComplaint);

// Complainant providing additional requested info
router.post('/:id/provide-info', authenticateOptional, provideAdditionalInfo);

// Authenticated user's complaints
router.get('/my', authenticate, getMyComplaints);

module.exports = router;
