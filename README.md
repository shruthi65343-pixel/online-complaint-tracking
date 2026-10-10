# ResolveTrack — Smart Multi-Category Complaint Reporting and Tracking System

ResolveTrack is a centralized, privacy-first grievance reporting and transparent resolution workflow web application built on the MERN stack. It empowers citizens and students to report grievances across seven specialized domains, dynamically adapts forms to collect category-specific data, supports privacy-aware geolocation with browser consent, generates cryptographic tracking references, and enables administrators to manage workflows, review complaint aging, update statuses, and communicate transparently.

---

## 1. System Architecture & Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js v22, Express.js, Mongoose, JWT (JSON Web Tokens), bcryptjs, Morgan
- **Database**: Local MongoDB (`mongodb://127.0.0.1:27017/resolvetrack`)
- **Security & Privacy Framework**:
  - Role-Based Access Control (`user`, `admin`)
  - Cryptographic tracking reference generation (`RT-YYYY-XXXXXXXX`)
  - 6-digit verification PIN protection for sensitive harassment & personal safety reports
  - Public redaction of precise GPS coordinates and residential addresses
  - Segregation of public remarks (citizen-visible) and internal notes (admin-confidential)

---

## 2. Complaint Categories

ResolveTrack supports seven domain-specific categories with dynamic form attributes:

1. **Harassment and Personal Safety** *(Confidential Shield Tier)*:
   - Incident type, narrative, approximate date/time, optional location, internal counseling support checkbox, safe contact preference.
   - Public descriptions are protected behind authentication or a 6-digit verification PIN.
2. **Education and Examination**:
   - Institution, college/department, course/program, subject/exam code, exam session, marks/evaluation explanation, roll/receipt reference.
3. **Electricity and Public Utilities**:
   - Utility fault type, nature of problem, affected feeder/address, consumer account number, urgency level, evidence attachment.
4. **Government and Public Services**:
   - Department, service token/reference number, application date, service center location, grievance narrative.
5. **Municipal and Environmental Issues**:
   - Municipal issue type (drainage, potholes, garbage, waterlogging, sanitation), affected ward/area, urgency, photo evidence.
6. **Technical Issues**:
   - Device/portal/service, error type, hardware asset/serial number, description.
7. **Other**:
   - General civic or administrative grievances with custom context.

---

## 3. Privacy-Aware Geolocation (3 Modes)

Citizens are provided three distinct location options:
1. **Use Current Location**: Invokes the browser's Geolocation API **only upon explicit user click**. Captures latitude, longitude, and accuracy with clear permission indicators. Allows user to remove or re-detect coordinates anytime.
2. **Manual Address / Landmark**: Allows typing an affected address, street, or landmark when GPS is unavailable.
3. **Continue Without Location**: Permits full complaint lodging without location metadata (recommended for examinations and sensitive personal cases).

> **Privacy Redaction**: Exact GPS coordinates and residential numbers are never exposed in public tracking queries; only generalized area context is visible to third parties.

---

## 4. Innovation Highlights

- **Transparent Milestone Timeline**: Every status update records the action, timestamp, responsible officer, and public remarks.
- **Complaint Aging Engine & SLA Alerts**: Automatically calculates days and hours since submission. Highlights unresolved tickets older than 3 days (warning) and 7 days (critical SLA alert) on the admin console.
- **Duplicate Area Warning**: Intelligently analyzes recent reports in the same category within the same locality to warn users of existing active tickets without disclosing private reporter details.
- **Clarification Loop for "Awaiting Information"**: When an administrator requests clarification, complainants can submit follow-up details directly via the tracking interface, automatically transitioning the status back to "Under Review".

---

## 5. Folder Structure

```
resolvetrack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, profile
│   │   │   ├── complaintController.js# Submit, track, user list, clarification
│   │   │   └── adminController.js    # Stats, triage, status/priority updates, notes
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verification & admin role check
│   │   ├── models/
│   │   │   ├── User.js               # User & Admin Mongoose schema
│   │   │   └── Complaint.js          # Multi-category schema with aging virtuals
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── complaintRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── seed.js                   # Realistic database seeder
│   │   └── server.js                 # Express server entry point
│   ├── test-suite.js                 # 14-point automated test script
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── PriorityBadge.jsx
│   │   │   ├── TimelineView.jsx
│   │   │   └── LocationPicker.jsx    # 3-choice privacy location component
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # State management for auth & admin
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Hero, quick search, categories, test credentials
│   │   │   ├── CategorySelectPage.jsx# Interactive category cards
│   │   │   ├── ComplaintFormPage.jsx # Multi-step dynamic form wizard
│   │   │   ├── ConfirmationPage.jsx  # Tracking ID, PIN, duplicate alerts
│   │   │   ├── TrackingPage.jsx      # Audit timeline & sensitive PIN unlock
│   │   │   ├── UserDashboardPage.jsx # Authenticated citizen grievance hub
│   │   │   ├── LoginPage.jsx         # Citizen sign in and registration
│   │   │   ├── AdminLoginPage.jsx    # Dedicated officer authentication
│   │   │   └── AdminDashboardPage.jsx# Officer triage & SLA management console
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with auth interceptor
│   │   ├── utils/
│   │   │   └── categories.js         # Domain constants and icons
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── .env.example
│   ├── .env
│   └── package.json
└── README.md
```

---

## 6. Local Setup and Execution Instructions

### Prerequisites
- Node.js (v18 or higher; tested on v22)
- Local MongoDB running on `mongodb://127.0.0.1:27017`

### Step 1: Clone / Navigate to Project Directory
```powershell
cd C:\Users\Shruthi\.gemini\antigravity\scratch\resolvetrack
```

### Step 2: Configure Environment Variables
Create `.env` in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/resolvetrack
JWT_SECRET=resolvetrack_super_secure_jwt_secret_key_2026_xyz
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create `.env` in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Seed the Database
Run the database seeder to initialize the Administrator account, citizen test accounts, and sample grievances across categories:
```powershell
cd backend
npm run seed
```

### Step 4: Start the Backend Server
```powershell
cd backend
npm start
# Server listens on http://localhost:5000
```

### Step 5: Start the Frontend Application
In a separate terminal:
```powershell
cd frontend
npm run dev
# Vite runs on http://localhost:5173
```

---

## 7. Pre-Configured Test Accounts (Seed Data)

| Role | Email | Password | Department / Notes |
|---|---|---|---|
| **Chief Admin** | `admin@resolvetrack.gov` | `Admin@ResolveTrack2026` | Central Grievance Redressal Bureau |
| **Citizen** | `shruthi.citizen@example.com` | `Citizen@12345` | Citizen profile with active civic tickets |
| **Student** | `aravind.student@example.com` | `Student@12345` | Student profile with exam re-evaluation |

### Sample Tracking IDs for Instant Testing:
- `RT-2026-ED8102` — Education & Examination (Delayed re-evaluation)
- `RT-2026-EL3091` — Electricity (Transformer sparking with GPS coordinates)
- `RT-2026-HS9921` — Harassment & Personal Safety (Confidential — Verification PIN: `839104`)
- `RT-2026-MN4512` — Municipal & Civic (Sewage overflow — Status: *Awaiting Information*)
- `RT-2026-GV1094` — Government Public Services (Domicile delay — Status: *Resolved*)

---

## 8. Backend REST API Documentation

### Public / Authentication Endpoints
- `POST /api/auth/register` — Register a new citizen account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve profile of authenticated user
- `POST /api/auth/logout` — Logout user session

### Complaint Endpoints
- `POST /api/complaints` — Lodge complaint (optionally authenticated or guest)
- `GET /api/complaints/track/:trackingId` — Track complaint; accepts `verificationCode` query param or header
- `POST /api/complaints/:id/provide-info` — Submit complainant clarification for *Awaiting Information*
- `GET /api/complaints/my` — Retrieve authenticated citizen's personal complaints

### Administrator Endpoints (Protected by JWT & `role === 'admin'`)
- `GET /api/admin/stats` — Overall KPI metrics, status counts, aging tickets, category breakdown
- `GET /api/admin/complaints` — Filtered list with pagination, search, status, category, priority
- `GET /api/admin/complaints/:id` — Full details including internal notes and audit history
- `PATCH /api/admin/complaints/:id/status` — Transition status, record public remark, log officer action
- `PATCH /api/admin/complaints/:id/priority` — Update priority level (`Low`, `Medium`, `High`, `Urgent`)
- `POST /api/admin/complaints/:id/remarks` — Append internal notes or public announcements

---

## 9. Automated Test Verification

An automated 14-assertion test suite is included in `backend/test-suite.js`. Run it via:
```powershell
node backend/test-suite.js
```
Verified criteria:
1. Health check availability
2. Submitting examination re-evaluation complaint
3. Submitting electricity complaint with GPS coordinates and physical address
4. Submitting harassment complaint generating 6-digit verification PIN
5. Redaction of sensitive details on public unauthenticated lookup
6. Harassment complaint unlocking with verification PIN
7. Handling nonexistent tracking IDs with 404
8. Validating missing inputs with 400
9. Seeded administrator login and JWT validation
10. Denying unauthorized access to admin endpoints (403 Forbidden)
11. Administrator status update with remarks and internal notes
12. Complainant tracking timeline reflection of status and public remarks
13. Scrubbing internal administrator notes from public view
14. User data isolation on `/api/complaints/my`

---

## 10. Completed Features & Known Limitations

### Completed Features:
- Real working MERN stack application connected to local MongoDB.
- Dynamic tailored form fields for all 7 complaint categories.
- 3-option privacy-aware location selector with explicit Geolocation API trigger and GPS coordinate redaction.
- Non-guessable tracking reference generation (`RT-YYYY-XXXXXXXX`).
- 6-digit verification PIN for confidential safety cases.
- Transparent milestone timeline with timestamps and officer accountability.
- SLA aging indicator calculating days/hours and highlighting tickets aged >3 and >7 days.
- Priority assignment (`Low`, `Medium`, `High`, `Urgent`).
- Duplicate detection warning based on category and locality.
- Interactive clarification loop allowing complainants to reply when status is *Awaiting Information*.
- Citizen dashboard with filtering, search, and grievance tracking.
- Officer console with metrics, table filters, inspection drawer, and audit logging.

### Known Limitations & Future Enhancements:
- **Map Visualizer**: Currently supports full GPS coordinate logging, address resolution, and reverse coordinates; interactive OpenStreetMap or Google Maps tile preview requires an external API key or Leaflet bundle.
- **SMS Gateway**: Simulated status notifications; production integration would hook into Twilio/Gupshup for automated citizen SMS alerts.
- **Binary Cloud Storage**: File attachments are currently encoded and verified within payload quotas (5MB limit); production would stream directly to S3 or Cloudinary.

---

## 11. Deploying to Vercel

The repository is configured for 1-click deployment on Vercel using `vercel.json` and `@vercel/node` serverless functions for Express:

1. **Import Project on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Sign in with GitHub and import `shruthi65343-pixel/online-complaint-tracking`.

2. **Configure Cloud Environment Variables**:
   In the Vercel project configuration, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (e.g. `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/resolvetrack?retryWrites=true&w=majority`)
   - `JWT_SECRET`: Any strong random secret (e.g. `resolvetrack_super_secure_jwt_secret_key_2026_xyz`)
   - `NODE_ENV`: `production`

3. **Deploy**:
   - Click **Deploy**. Vercel will build the React Vite frontend, mount the Express API under `/api`, and host the full-stack system on your production `.vercel.app` domain.

