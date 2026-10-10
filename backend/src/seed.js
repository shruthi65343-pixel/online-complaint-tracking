require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Complaint.deleteMany({});

    console.log('[Seed] Creating Seed Users...');

    const admin = await User.create({
      name: 'Dr. Evelyn Vance (Chief Admin)',
      email: 'admin@resolvetrack.gov',
      password: 'Admin@ResolveTrack2026',
      role: 'admin',
      phone: '+91 98765 43210',
      department: 'Central Public Grievance Redressal Bureau'
    });

    const citizenUser = await User.create({
      name: 'Shruthi Sundaram',
      email: 'shruthi.citizen@example.com',
      password: 'Citizen@12345',
      role: 'user',
      phone: '+91 98111 22334'
    });

    const studentUser = await User.create({
      name: 'Aravind Menon',
      email: 'aravind.student@example.com',
      password: 'Student@12345',
      role: 'user',
      phone: '+91 98222 33445'
    });

    console.log('[Seed] Users created:');
    console.log(`  Admin: admin@resolvetrack.gov / Admin@ResolveTrack2026`);
    console.log(`  User 1: shruthi.citizen@example.com / Citizen@12345`);
    console.log(`  User 2: aravind.student@example.com / Student@12345`);

    console.log('[Seed] Seeding sample complaints across categories...');

    const sampleComplaints = [
      {
        trackingId: 'RT-2026-ED8102',
        verificationCode: '482910',
        userId: studentUser._id,
        category: 'Education and Examination',
        title: 'Delayed Examination Re-evaluation for Cryptography & Network Security',
        description: 'Applied for answer booklet re-evaluation on 12th February 2026 following results declaration. The standard 21-day review deadline has lapsed without status or updated grade card release.',
        fullName: 'Aravind Menon',
        email: 'aravind.student@example.com',
        phone: '+91 98222 33445',
        isSensitive: false,
        categoryDetails: {
          institution: 'National Institute of Technology',
          collegeDepartment: 'Department of Computer Science & Engineering',
          courseProgram: 'B.Tech Computer Science (Semester 7)',
          subjectExam: 'CS-702 Cryptography & Network Security',
          examSessionDate: 'Winter Session 2025-2026',
          explanation: 'Score was marked 42 instead of expected passing grade. Re-evaluation fee paid under receipt #REC-8902.',
          examRollOrRefNumber: 'BT-CS-2022-094'
        },
        location: {
          locationProvided: false,
          locationType: 'none',
          locationContext: 'unspecified'
        },
        status: 'In Progress',
        priority: 'High',
        assignedOfficer: 'Exam Controller Directorate - Academic Wing',
        publicRemarks: 'Answer script recalled from central evaluation repository. Designated secondary reviewer appointed.',
        internalNotes: 'Evaluation coordinator contacted. Expedite within 48 hours to avoid convocation eligibility hold.',
        statusHistory: [
          {
            status: 'Submitted',
            action: 'Complaint Registered',
            remarks: 'Submitted online by student portal.',
            internalNotes: 'Auto-intake verification complete.',
            changedBy: 'Aravind Menon',
            changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'Under Review',
            action: 'Document Verification',
            remarks: 'Re-evaluation fee payment receipt validated with accounts division.',
            internalNotes: 'Payment verified: Ref #REC-8902.',
            changedBy: 'Dr. Evelyn Vance (Chief Admin)',
            changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'In Progress',
            action: 'Forwarded to Evaluator',
            remarks: 'Script handed over to Departmental Academic Review Board for re-grading.',
            internalNotes: 'Board chair informed. ETA for updated grade sheet is Thursday.',
            changedBy: 'Dr. Evelyn Vance (Chief Admin)',
            changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        trackingId: 'RT-2026-EL3091',
        verificationCode: '719302',
        userId: citizenUser._id,
        category: 'Electricity and Public Utilities',
        title: 'Frequent Voltage Fluctuations and Damaged Pole at 4th Cross Road',
        description: 'Severe electrical voltage surges causing tripping of main breakers and equipment failure. A concrete pole has tilted dangerously towards the pedestrian pathway after recent rainstorms.',
        fullName: 'Shruthi Sundaram',
        email: 'shruthi.citizen@example.com',
        phone: '+91 98111 22334',
        isSensitive: false,
        categoryDetails: {
          utilityType: 'Damaged Electric Pole & Distribution Transformer',
          problemNature: 'Dangerous pole tilt, sparking wires, and low voltage supply',
          affectedAddress: '4th Cross Road, Near Greenview Park, Sector 4',
          consumerNumber: 'DISCOM-8839201',
          urgencyLevel: 'Critical'
        },
        location: {
          locationProvided: true,
          locationType: 'current_gps',
          locationContext: 'incident_site',
          coordinates: {
            latitude: 12.9716,
            longitude: 77.5946,
            accuracy: 12
          },
          addressText: '4th Cross Road, Near Greenview Park, Sector 4, Bangalore',
          city: 'Bangalore',
          consentGranted: true
        },
        status: 'Under Review',
        priority: 'Urgent',
        assignedOfficer: 'Urban Electricity Emergency Response Wing',
        publicRemarks: 'Field inspection engineer dispatched to assess structural stability of the pole and transformer insulation.',
        internalNotes: 'High liability risk due to pedestrian pathway proximity. Instruct lineman unit to cordon area immediately.',
        statusHistory: [
          {
            status: 'Submitted',
            action: 'Complaint Registered',
            remarks: 'Grievance lodged with GPS verification.',
            internalNotes: 'Hazard level: High.',
            changedBy: 'Shruthi Sundaram',
            changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'Under Review',
            action: 'Initial Triage',
            remarks: 'Assigned to Sector 4 Substation engineering unit.',
            internalNotes: 'Notified supervisor Kumar.',
            changedBy: 'Dr. Evelyn Vance (Chief Admin)',
            changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        trackingId: 'RT-2026-HS9921',
        verificationCode: '839104',
        userId: null, // Submitted as confidential guest
        category: 'Harassment and Personal Safety',
        title: 'Verbal Intimidation and Hostile Misconduct in Campus Study Library',
        description: 'Repeated unauthorized stalking and hostile verbal intimidation by an unknown individual near the quiet study wing. Requested discreet safety escort and security camera footage audit.',
        fullName: 'Confidential Reporter',
        email: 'anonymous.safety@proton.me',
        phone: '',
        isSensitive: true,
        categoryDetails: {
          incidentType: 'Hostile Misconduct & Stalking',
          incidentDateTime: '2026-10-06 around 7:30 PM',
          incidentLocation: 'North Wing Library, 2nd Floor Reference Stacks',
          requestSupport: true,
          safeContactPreference: 'Email only (no phone calls or public inquiries)'
        },
        location: {
          locationProvided: false,
          locationType: 'none',
          locationContext: 'unspecified'
        },
        status: 'In Progress',
        priority: 'High',
        assignedOfficer: 'Campus Safety & Confidential Counseling Cell',
        publicRemarks: 'Confidential safety protocol activated. Campus security chief briefed for quiet perimeter surveillance.',
        internalNotes: 'HIGH CONFIDENTIALITY. Restrict details strictly to authorized women/safety cell officers. Do not disclose reporter identity or location in public records.',
        statusHistory: [
          {
            status: 'Submitted',
            action: 'Confidential Intake',
            remarks: 'Report lodged under strict protective privacy tier.',
            internalNotes: 'Encrypted intake record created.',
            changedBy: 'Intake Desk',
            changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'In Progress',
            action: 'Safety Protocol Active',
            remarks: 'CCTV footage review initiated for North Wing corridor between 19:00 - 20:00.',
            internalNotes: 'Officer Anita assigned. Contact reporter exclusively through secure channel.',
            changedBy: 'Dr. Evelyn Vance (Chief Admin)',
            changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        trackingId: 'RT-2026-MN4512',
        verificationCode: '194827',
        userId: citizenUser._id,
        category: 'Municipal and Environmental Issues',
        title: 'Overflowing Sewage Drain and Stagnant Waterlogging on Market Road',
        description: 'Blocked stormwater channel has caused foul-smelling blackwater overflow into commercial storefronts. Poses severe health risk and dengue mosquito breeding ground.',
        fullName: 'Shruthi Sundaram',
        email: 'shruthi.citizen@example.com',
        phone: '+91 98111 22334',
        isSensitive: false,
        categoryDetails: {
          municipalIssueType: 'Drainage & Waterlogging',
          affectedArea: 'Main Commercial Market Road, Ward 18',
          urgency: 'High'
        },
        location: {
          locationProvided: true,
          locationType: 'manual_address',
          locationContext: 'affected_address',
          addressText: 'Shop #14 to #28, Main Commercial Market Road, Ward 18',
          city: 'Bangalore',
          consentGranted: true
        },
        status: 'Awaiting Information',
        priority: 'Medium',
        assignedOfficer: 'Municipal Corporation Sanitation Division',
        publicRemarks: 'Sanitation supervisor visited. Please clarify if the blockage is originating from private building sump or the main municipal underground line.',
        internalNotes: 'Awaiting complainant clarification regarding property boundary before deploying heavy suction excavator.',
        statusHistory: [
          {
            status: 'Submitted',
            action: 'Complaint Registered',
            remarks: 'Logged with municipal ward tracking.',
            internalNotes: '',
            changedBy: 'Shruthi Sundaram',
            changedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'Awaiting Information',
            action: 'Clarification Requested',
            remarks: 'Sanitation supervisor visited. Please clarify if the blockage is originating from private building sump or the main municipal underground line.',
            internalNotes: 'Hold until complainant responds with specific pipe location.',
            changedBy: 'Dr. Evelyn Vance (Chief Admin)',
            changedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        trackingId: 'RT-2026-GV1094',
        verificationCode: '629401',
        userId: null,
        category: 'Government and Public Services',
        title: 'Delay in Processing Domicile Certificate at Taluk Civic Center',
        description: 'Applied for State Domicile Certificate over 45 days ago with complete documentation. System shows pending at Tahsildar approval stage without any remarks or query raised.',
        fullName: 'Ramesh Patel',
        email: 'ramesh.p@example.com',
        phone: '+91 99443 32211',
        isSensitive: false,
        categoryDetails: {
          department: 'Revenue & District Administration',
          serviceReferenceNumber: 'REV-DOM-2026-88910',
          applicationOrIncidentDate: '2026-08-25',
          serviceLocation: 'South Taluk E-Governance Service Center'
        },
        location: {
          locationProvided: true,
          locationType: 'manual_address',
          locationContext: 'affected_address',
          addressText: 'South Taluk Civic Office, Room 104',
          city: 'Bangalore',
          consentGranted: true
        },
        status: 'Resolved',
        priority: 'Medium',
        assignedOfficer: 'District E-Governance Grievance Cell',
        publicRemarks: 'Tahsildar digital signature affixed. Certificate dispatched via SMS download link and available on state DigiLocker portal.',
        internalNotes: 'Backlog in digital certificate key renewal resolved. Issued successfully.',
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'Submitted',
            action: 'Complaint Registered',
            remarks: 'Public service delay complaint lodged.',
            internalNotes: '',
            changedBy: 'Ramesh Patel',
            changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'In Progress',
            action: 'Escalated to Tahsildar',
            remarks: 'Escalation notice dispatched to Taluk Officer.',
            internalNotes: 'Escalated per Public Services Guarantee Act.',
            changedBy: 'Dr. Evelyn Vance (Chief Admin)',
            changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'Resolved',
            action: 'Certificate Dispatched',
            remarks: 'Tahsildar digital signature affixed. Certificate dispatched via SMS download link and available on state DigiLocker portal.',
            internalNotes: 'Case closed.',
            changedBy: 'Dr. Evelyn Vance (Chief Admin)',
            changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const item of sampleComplaints) {
      await Complaint.create(item);
    }

    console.log(`[Seed] Seeded ${sampleComplaints.length} realistic complaints with aging, categories, and audit history.`);
    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedData();
