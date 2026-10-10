const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Submitted', 'Under Review', 'In Progress', 'Awaiting Information', 'Resolved', 'Closed']
    },
    action: {
      type: String,
      default: 'Status Change'
    },
    remarks: {
      type: String,
      default: ''
    },
    internalNotes: {
      type: String,
      default: ''
    },
    changedBy: {
      type: String,
      default: 'System'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true
    },
    authorRole: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    message: {
      type: String,
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },
    // Verification PIN/code for tracking sensitive complaints or guest verification
    verificationCode: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Harassment and Personal Safety',
        'Education and Examination',
        'Electricity and Public Utilities',
        'Government and Public Services',
        'Municipal and Environmental Issues',
        'Technical Issues',
        'Other'
      ]
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    isSensitive: {
      type: Boolean,
      default: false
    },

    // Category-specific dynamic details
    categoryDetails: {
      // Education and Examination
      institution: { type: String, trim: true, default: '' },
      collegeDepartment: { type: String, trim: true, default: '' },
      courseProgram: { type: String, trim: true, default: '' },
      subjectExam: { type: String, trim: true, default: '' },
      examSessionDate: { type: String, trim: true, default: '' },
      explanation: { type: String, trim: true, default: '' },
      examRollOrRefNumber: { type: String, trim: true, default: '' },

      // Electricity and Public Utilities
      utilityType: { type: String, trim: true, default: '' },
      problemNature: { type: String, trim: true, default: '' },
      affectedAddress: { type: String, trim: true, default: '' },
      consumerNumber: { type: String, trim: true, default: '' },
      urgencyLevel: { type: String, trim: true, default: 'Medium' },
      evidencePhotoUrl: { type: String, trim: true, default: '' },

      // Harassment and Personal Safety
      incidentType: { type: String, trim: true, default: '' },
      incidentDateTime: { type: String, trim: true, default: '' },
      incidentLocation: { type: String, trim: true, default: '' },
      requestSupport: { type: Boolean, default: false },
      safeContactPreference: { type: String, trim: true, default: 'Email' },

      // Government and Public Services
      department: { type: String, trim: true, default: '' },
      serviceReferenceNumber: { type: String, trim: true, default: '' },
      applicationOrIncidentDate: { type: String, trim: true, default: '' },
      serviceLocation: { type: String, trim: true, default: '' },

      // Municipal and Environmental Issues
      municipalIssueType: { type: String, trim: true, default: '' },
      affectedArea: { type: String, trim: true, default: '' },
      urgency: { type: String, trim: true, default: 'Medium' },

      // Technical Issues
      deviceOrService: { type: String, trim: true, default: '' },
      technicalProblemType: { type: String, trim: true, default: '' },
      deviceModelOrRef: { type: String, trim: true, default: '' },

      // Other
      additionalNotes: { type: String, trim: true, default: '' }
    },

    // Privacy-aware Location
    location: {
      locationProvided: {
        type: Boolean,
        default: false
      },
      locationType: {
        type: String,
        enum: ['current_gps', 'manual_address', 'none'],
        default: 'none'
      },
      locationContext: {
        type: String,
        enum: ['user_current', 'incident_site', 'affected_address', 'unspecified'],
        default: 'unspecified'
      },
      coordinates: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        accuracy: { type: Number, default: null }
      },
      addressText: {
        type: String,
        trim: true,
        default: ''
      },
      city: {
        type: String,
        trim: true,
        default: ''
      },
      consentGranted: {
        type: Boolean,
        default: false
      }
    },

    // Status & Priority
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'In Progress', 'Awaiting Information', 'Resolved', 'Closed'],
      default: 'Submitted',
      index: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true
    },

    // Attachment
    attachment: {
      fileName: { type: String, default: '' },
      fileType: { type: String, default: '' },
      fileSize: { type: Number, default: 0 },
      fileData: { type: String, default: '' } // Base64 or mock URL
    },

    // Timeline / Status History
    statusHistory: [statusHistorySchema],

    // Interaction / Comments
    comments: [commentSchema],

    // Administrative remarks
    publicRemarks: {
      type: String,
      default: 'Your complaint has been registered and is queued for verification.'
    },
    internalNotes: {
      type: String,
      default: ''
    },
    assignedOfficer: {
      type: String,
      default: 'General Intake Desk'
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Virtual for calculating aging in hours and days
complaintSchema.virtual('agingDays').get(function () {
  const referenceDate = this.resolvedAt || new Date();
  const diffTime = Math.abs(referenceDate - this.createdAt);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

complaintSchema.virtual('agingHours').get(function () {
  const referenceDate = this.resolvedAt || new Date();
  const diffTime = Math.abs(referenceDate - this.createdAt);
  return Math.floor(diffTime / (1000 * 60 * 60));
});

complaintSchema.set('toJSON', { virtuals: true });
complaintSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Complaint', complaintSchema);
