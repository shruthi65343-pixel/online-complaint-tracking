const API = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('====================================================');
  console.log(' ResolveTrack Automated End-to-End Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request(`${API}/health`);
    assert(health.status === 200 && health.data?.status === 'online', '1. Server Health Check online');

    // 2. Submit Examination Re-evaluation complaint
    const examPayload = {
      category: 'Education and Examination',
      title: 'Automated Test: Cryptography Re-evaluation Query',
      description: 'End-to-end verification of university grade audit flow.',
      fullName: 'Student Tester',
      email: 'student.tester@univ.edu',
      categoryDetails: {
        institution: 'Apex Engineering University',
        courseProgram: 'B.Tech CS',
        subjectExam: 'CS-701 Advanced Distributed Systems',
        examRollOrRefNumber: 'ROLL-2026-9901'
      },
      location: {
        locationProvided: false,
        locationType: 'none'
      }
    };
    const examRes = await request(`${API}/complaints`, { method: 'POST', body: examPayload });
    assert(examRes.status === 201 && examRes.data.trackingId.startsWith('RT-'), '2. Submit Examination complaint with unique tracking reference');
    const examTrackingId = examRes.data.trackingId;

    // 3. Submit Electricity complaint with location
    const elecPayload = {
      category: 'Electricity and Public Utilities',
      title: 'Automated Test: Sparks from Distribution Feeder',
      description: 'Dangerous sparking from pole transformer at junction.',
      fullName: 'Citizen Tester',
      email: 'citizen.tester@city.org',
      categoryDetails: {
        utilityType: 'Power Outage',
        problemNature: 'Sparking exposed wire',
        affectedAddress: 'Corner of 9th Cross and MG Road',
        urgencyLevel: 'Critical'
      },
      location: {
        locationProvided: true,
        locationType: 'current_gps',
        locationContext: 'incident_site',
        coordinates: { latitude: 13.0827, longitude: 80.2707, accuracy: 8 },
        addressText: 'MG Road Junction Substation',
        city: 'Chennai',
        consentGranted: true
      }
    };
    const elecRes = await request(`${API}/complaints`, { method: 'POST', body: elecPayload });
    assert(elecRes.status === 201 && elecRes.data.status === 'Submitted', '3. Submit Electricity complaint with GPS coordinates & address');
    const elecTrackingId = elecRes.data.trackingId;

    // 4. Submit Harassment Complaint without location (strictly confidential)
    const harassmentPayload = {
      category: 'Harassment and Personal Safety',
      title: 'Automated Test: Confidential Campus Misconduct Report',
      description: 'Confidential reporting test verifying protective data shield.',
      fullName: 'Private Individual',
      email: 'confidential.report@secure.org',
      isSensitive: true,
      categoryDetails: {
        incidentType: 'Hostile Misconduct',
        safeContactPreference: 'Email only (Discreet)',
        requestSupport: true
      },
      location: {
        locationProvided: false,
        locationType: 'none'
      }
    };
    const harassRes = await request(`${API}/complaints`, { method: 'POST', body: harassmentPayload });
    assert(harassRes.status === 201 && harassRes.data.verificationCode, '4. Submit Harassment complaint generating 6-digit Verification PIN');
    const harassTrackingId = harassRes.data.trackingId;
    const harassPin = harassRes.data.verificationCode;

    // 5. Verify Privacy Shield on Harassment complaint (unauthenticated/no PIN)
    const publicHarassTrack = await request(`${API}/complaints/track/${harassTrackingId}`);
    assert(publicHarassTrack.data?.isSensitiveRestricted === true && !publicHarassTrack.data?.complaint, '5. Sensitive Harassment details redacted on public unauthenticated lookup');

    // 6. Verify PIN Unlock on Harassment complaint
    const unlockedHarassTrack = await request(`${API}/complaints/track/${harassTrackingId}?verificationCode=${harassPin}`);
    assert(unlockedHarassTrack.data?.isSensitiveRestricted === false && unlockedHarassTrack.data?.complaint?.title.includes('Confidential'), '6. Harassment complaint securely unlocked with verification PIN');

    // 7. Test Nonexistent tracking ID handling
    const nonExistent = await request(`${API}/complaints/track/RT-DOES-NOT-EXIST-9999`);
    assert(nonExistent.status === 404, '7. Nonexistent tracking ID safely returns 404 Not Found');

    // 8. Test Invalid Input handling
    const invalidInput = await request(`${API}/complaints`, { method: 'POST', body: { title: 'Missing required fields' } });
    assert(invalidInput.status === 400, '8. Missing required fields properly rejected with 400 Bad Request');

    // 9. Admin Authentication
    const adminLoginRes = await request(`${API}/auth/login`, {
      method: 'POST',
      body: { email: 'admin@resolvetrack.gov', password: 'Admin@ResolveTrack2026' }
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data?.token && adminLoginRes.data?.user?.role === 'admin', '9. Admin login with seeded credentials successful');
    const adminToken = adminLoginRes.data.token;

    // 10. Unauthorized user attempting admin route
    const citizenLoginRes = await request(`${API}/auth/login`, {
      method: 'POST',
      body: { email: 'shruthi.citizen@example.com', password: 'Citizen@12345' }
    });
    const citizenToken = citizenLoginRes.data.token;

    const forbiddenCheck = await request(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert(forbiddenCheck.status === 403, '10. Access denied: Non-admin user denied from admin endpoints (403 Forbidden)');

    // 11. Admin updates status & priority & remarks on Electricity complaint
    const adminGetElec = await request(`${API}/admin/complaints?search=${elecTrackingId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const elecDbId = adminGetElec.data.complaints[0]._id;

    const updateRes = await request(`${API}/admin/complaints/${elecDbId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'In Progress',
        remarks: 'Emergency lineman crew dispatched to site. Power isolated.',
        internalNotes: 'Dispatched unit 4. Check cable insulation integrity.'
      }
    });
    assert(updateRes.status === 200 && updateRes.data?.complaint?.status === 'In Progress', '11. Admin successfully transitioned status to In Progress');

    // 12. Track complaint after status change and verify timeline
    const trackAfterUpdate = await request(`${API}/complaints/track/${elecTrackingId}`);
    assert(
      trackAfterUpdate.data?.complaint?.status === 'In Progress' &&
      trackAfterUpdate.data?.complaint?.statusHistory?.length >= 2 &&
      trackAfterUpdate.data?.complaint?.publicRemarks.includes('lineman crew'),
      '12. Complainant tracking shows new status and public remarks in timeline'
    );

    // 13. Verify private internalNotes are NOT leaked to public
    const publicTimelineHistory = trackAfterUpdate.data.complaint.statusHistory;
    const hasLeakedInternalNotes = publicTimelineHistory.some(item => item.internalNotes && item.internalNotes.length > 0);
    assert(!hasLeakedInternalNotes, '13. Security check: Internal admin notes strictly scrubbed from public tracking timeline');

    // 14. Verify user isolation: Shruthi cannot see another user's private complaint list
    const shruthiComplaints = await request(`${API}/complaints/my`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const onlyShruthi = shruthiComplaints.data.complaints.every(c => c.email === 'shruthi.citizen@example.com');
    assert(onlyShruthi, '14. User data isolation: /api/complaints/my strictly returns only authenticated user\'s own complaints');

    console.log(`\n====================================================`);
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runTests();
