import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  MapPin,
  Lock,
  Info
} from 'lucide-react';
import { COMPLAINT_CATEGORIES } from '../utils/categories';
import LocationPicker from '../components/LocationPicker';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ComplaintFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const categoryParam = searchParams.get('category');
  const defaultCategory = COMPLAINT_CATEGORIES.find((c) => c.name === categoryParam)?.name || COMPLAINT_CATEGORIES[0].name;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Primary Form State
  const [formData, setFormData] = useState({
    category: defaultCategory,
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    title: '',
    description: '',
    isSensitive: defaultCategory === 'Harassment and Personal Safety',
    // Category Details
    categoryDetails: {
      institution: '',
      collegeDepartment: '',
      courseProgram: '',
      subjectExam: '',
      examSessionDate: '',
      explanation: '',
      examRollOrRefNumber: '',

      utilityType: 'Power Outage',
      problemNature: '',
      affectedAddress: '',
      consumerNumber: '',
      urgencyLevel: 'Medium',

      incidentType: 'Harassment or Misconduct',
      incidentDateTime: '',
      incidentLocation: '',
      requestSupport: true,
      safeContactPreference: 'Email only (Discreet)',

      department: '',
      serviceReferenceNumber: '',
      applicationOrIncidentDate: '',
      serviceLocation: '',

      municipalIssueType: 'Road Damage & Potholes',
      affectedArea: '',
      urgency: 'Medium',

      deviceOrService: '',
      technicalProblemType: '',
      deviceModelOrRef: '',

      additionalNotes: ''
    },
    // Location Object
    location: {
      locationProvided: false,
      locationType: 'none',
      locationContext: 'unspecified',
      coordinates: null,
      addressText: '',
      city: '',
      consentGranted: false
    },
    // Attachment
    attachment: {
      fileName: '',
      fileType: '',
      fileSize: 0,
      fileData: ''
    }
  });

  // Keep user profile synced if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Update sensitivity when category changes
  const handleCategorySelect = (selectedCatName) => {
    const catObj = COMPLAINT_CATEGORIES.find((c) => c.name === selectedCatName);
    setFormData((prev) => ({
      ...prev,
      category: selectedCatName,
      isSensitive: Boolean(catObj?.isSensitive)
    }));
  };

  const handleDetailChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      categoryDetails: {
        ...prev.categoryDetails,
        [field]: value
      }
    }));
  };

  // Mock / Lightweight File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          attachment: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation before step changes
  const validateStep = (currentStep) => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setErrorMessage('Please provide your full name.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return false;
      }
      if (!formData.title.trim()) {
        setErrorMessage('Complaint title is required.');
        return false;
      }
      if (!formData.description.trim()) {
        setErrorMessage('Detailed description is required.');
        return false;
      }
    } else if (currentStep === 2) {
      // Category specific light checks
      if (formData.category === 'Education and Examination') {
        if (!formData.categoryDetails.institution) {
          setErrorMessage('Institution or University name is required.');
          return false;
        }
      }
      if (formData.category === 'Electricity and Public Utilities') {
        if (!formData.categoryDetails.problemNature) {
          setErrorMessage('Please specify the nature of the utility problem.');
          return false;
        }
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.post('/complaints', formData);
      if (res.data?.success) {
        // Navigate to confirmation page with state
        navigate('/confirmation', {
          state: {
            trackingId: res.data.trackingId,
            verificationCode: res.data.verificationCode,
            category: res.data.category,
            status: res.data.status,
            createdAt: res.data.createdAt,
            possibleDuplicateWarning: res.data.possibleDuplicateWarning
          }
        });
      } else {
        setErrorMessage(res.data?.message || 'Submission failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const currentCategoryConfig = COMPLAINT_CATEGORIES.find((c) => c.name === formData.category);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and Step Indicator */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            Official Grievance Registration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            File a Complaint
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete the following details. Fields adapt intelligently according to your chosen category.
          </p>
        </div>

        {/* Wizard Steps */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { num: 1, label: 'Intake Info' },
            { num: 2, label: 'Domain Details' },
            { num: 3, label: 'Location & Privacy' },
            { num: 4, label: 'Review & Lodging' }
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2.5 rounded-xl border text-center transition ${
                step === s.num
                  ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold shadow-sm'
                  : step > s.num
                  ? 'bg-slate-50 border-emerald-400 text-emerald-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <div className="text-xs sm:text-sm">
                Step {s.num}: <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* STEP 1: CATEGORY & GENERAL INFORMATION */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3">1. General Information & Category</h2>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Complaint Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full text-sm font-medium px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
              >
                {COMPLAINT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.isSensitive ? '(Confidential Shield)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Sensitive alert badge if harassment */}
            {formData.isSensitive && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Confidential Protective Protocol Active</p>
                  <p className="text-rose-800 leading-relaxed">
                    Personal safety reports are locked from unrestricted public indexing. Full narrative descriptions are accessible solely by authorized nodal officers or via your private 6-digit verification code.
                  </p>
                </div>
              </div>
            )}

            {/* Reporter details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shruthi Sundaram"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSensitive}
                    onChange={(e) => setFormData({ ...formData, isSensitive: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Mark complaint as strictly confidential</span>
                </label>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Subject / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Brief summary of the issue (e.g. Low voltage in Sector 4 or Examination grade mismatch)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Grievance Narrative <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Provide a comprehensive explanation of the incident, impact, dates, and previous attempts at resolution..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORY SPECIFIC FIELDS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">2. Category-Specific Fields</h2>
                <p className="text-xs text-teal-700 font-semibold">{formData.category}</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full font-medium">
                Tailored Attributes
              </span>
            </div>

            {/* 1. Education and Examination */}
            {formData.category === 'Education and Examination' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Institution or University <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. National Institute of Technology"
                      value={formData.categoryDetails.institution}
                      onChange={(e) => handleDetailChange('institution', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      College or Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dept of Computer Science & Engineering"
                      value={formData.categoryDetails.collegeDepartment}
                      onChange={(e) => handleDetailChange('collegeDepartment', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Course / Program
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech Computer Science (Sem 7)"
                      value={formData.categoryDetails.courseProgram}
                      onChange={(e) => handleDetailChange('courseProgram', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject / Examination Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CS-702 Cryptography & Network Security"
                      value={formData.categoryDetails.subjectExam}
                      onChange={(e) => handleDetailChange('subjectExam', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Exam Session or Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Winter Session 2025-2026 / Dec 15, 2025"
                      value={formData.categoryDetails.examSessionDate}
                      onChange={(e) => handleDetailChange('examSessionDate', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Roll Number / Fee Reference Receipt
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BT-CS-2022-094 / REC-8902"
                      value={formData.categoryDetails.examRollOrRefNumber}
                      onChange={(e) => handleDetailChange('examRollOrRefNumber', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Explanation of Marks or Issue
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on previous score, expected result, re-evaluation fee submission date..."
                    value={formData.categoryDetails.explanation}
                    onChange={(e) => handleDetailChange('explanation', e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            )}

            {/* 2. Electricity and Public Utilities */}
            {formData.category === 'Electricity and Public Utilities' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Utility Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.categoryDetails.utilityType}
                      onChange={(e) => handleDetailChange('utilityType', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="Power Outage">Power Outage / Transformer Fault</option>
                      <option value="Damaged Electric Pole">Damaged Electric Pole / Tilted Pole</option>
                      <option value="Exposed Live Wires">Exposed Live Wires (Hazard)</option>
                      <option value="Streetlight Malfunction">Streetlight Malfunction</option>
                      <option value="Water Supply Issue">Public Water Pipeline Leak / Contamination</option>
                      <option value="Billing Dispute">Billing Dispute / Meter Error</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={formData.categoryDetails.urgencyLevel}
                      onChange={(e) => handleDetailChange('urgencyLevel', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="Low">Low - Routine repair</option>
                      <option value="Medium">Medium - Affects daily routine</option>
                      <option value="High">High - Significant disruption</option>
                      <option value="Critical">Critical - Safety risk / Live sparking</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nature of Problem <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sparking transformer wire, 8 hours blackout"
                      value={formData.categoryDetails.problemNature}
                      onChange={(e) => handleDetailChange('problemNature', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consumer Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DISCOM-8839201 / CA-4402"
                      value={formData.categoryDetails.consumerNumber}
                      onChange={(e) => handleDetailChange('consumerNumber', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Affected Address / Feeder Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4th Cross Road, Sector 4, Opposite Greenview Park"
                    value={formData.categoryDetails.affectedAddress}
                    onChange={(e) => handleDetailChange('affectedAddress', e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            )}

            {/* 3. Harassment and Personal Safety */}
            {formData.category === 'Harassment and Personal Safety' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Type of Incident
                    </label>
                    <select
                      value={formData.categoryDetails.incidentType}
                      onChange={(e) => handleDetailChange('incidentType', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="Verbal Harassment & Intimidation">Verbal Harassment & Intimidation</option>
                      <option value="Campus Misconduct / Ragging">Campus Misconduct / Ragging</option>
                      <option value="Workplace Hostility">Workplace Hostility / Abuse of Authority</option>
                      <option value="Cyberbullying / Digital Threats">Cyberbullying / Digital Threats</option>
                      <option value="Physical Stalking / Safety Hazard">Physical Stalking / Safety Hazard</option>
                      <option value="Other Safety Concern">Other Personal Safety Concern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Approximate Incident Date & Time (If Known)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Oct 6th, approx 7:30 PM"
                      value={formData.categoryDetails.incidentDateTime}
                      onChange={(e) => handleDetailChange('incidentDateTime', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Incident Location (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. North Wing Library, Floor 2"
                      value={formData.categoryDetails.incidentLocation}
                      onChange={(e) => handleDetailChange('incidentLocation', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Safe Contact Preference
                    </label>
                    <select
                      value={formData.categoryDetails.safeContactPreference}
                      onChange={(e) => handleDetailChange('safeContactPreference', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="Email only (Discreet)">Email only (Discreet)</option>
                      <option value="Discreet phone callback">Discreet phone callback</option>
                      <option value="In-person confidential counseling cell">In-person confidential counseling cell</option>
                      <option value="Do not initiate direct contact unless necessary">Do not initiate direct contact unless necessary</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="supportReq"
                    checked={formData.categoryDetails.requestSupport}
                    onChange={(e) => handleDetailChange('requestSupport', e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="supportReq" className="text-xs font-medium text-slate-700 cursor-pointer">
                    I request active support, safety escort, or counseling assistance from the internal cell.
                  </label>
                </div>
              </div>
            )}

            {/* 4. Government and Public Services */}
            {formData.category === 'Government and Public Services' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department or Civic Agency
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Revenue & Taluk Office, Transport RTO"
                      value={formData.categoryDetails.department}
                      onChange={(e) => handleDetailChange('department', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Application or Token Reference Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. REV-DOM-2026-88910"
                      value={formData.categoryDetails.serviceReferenceNumber}
                      onChange={(e) => handleDetailChange('serviceReferenceNumber', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Application / Incident
                    </label>
                    <input
                      type="date"
                      value={formData.categoryDetails.applicationOrIncidentDate}
                      onChange={(e) => handleDetailChange('applicationOrIncidentDate', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Service Center Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. South Taluk Civic Office, Counter 4"
                      value={formData.categoryDetails.serviceLocation}
                      onChange={(e) => handleDetailChange('serviceLocation', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Municipal and Environmental Issues */}
            {formData.category === 'Municipal and Environmental Issues' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Municipal Issue Type
                    </label>
                    <select
                      value={formData.categoryDetails.municipalIssueType}
                      onChange={(e) => handleDetailChange('municipalIssueType', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="Garbage Collection / Dumping">Garbage Collection / Illegal Dumping</option>
                      <option value="Drainage & Overflowing Sewage">Drainage & Overflowing Sewage</option>
                      <option value="Road Damage & Potholes">Road Damage & Severe Potholes</option>
                      <option value="Waterlogging & Blocked Culvert">Waterlogging & Blocked Culvert</option>
                      <option value="Sanitation & Public Health">Sanitation & Public Health</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Urgency
                    </label>
                    <select
                      value={formData.categoryDetails.urgency}
                      onChange={(e) => handleDetailChange('urgency', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High (Traffic block or health risk)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Affected Area / Street / Ward
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ward 18, Commercial Market Road"
                    value={formData.categoryDetails.affectedArea}
                    onChange={(e) => handleDetailChange('affectedArea', e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            )}

            {/* 6. Technical Issues */}
            {formData.category === 'Technical Issues' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Device / Portal / Service
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Student Portal, Campus WiFi, Official Laptop"
                      value={formData.categoryDetails.deviceOrService}
                      onChange={(e) => handleDetailChange('deviceOrService', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Problem Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Login 500 error, SSL certificate failure, Blue screen"
                      value={formData.categoryDetails.technicalProblemType}
                      onChange={(e) => handleDetailChange('technicalProblemType', e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Device Model / Asset Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dell Latitude 5420 / ASSET-99120"
                    value={formData.categoryDetails.deviceModelOrRef}
                    onChange={(e) => handleDetailChange('deviceModelOrRef', e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            )}

            {/* 7. Other */}
            {formData.category === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Context or Specific Grievance Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Mention any specific entity, reference codes, or history regarding this complaint..."
                  value={formData.categoryDetails.additionalNotes}
                  onChange={(e) => handleDetailChange('additionalNotes', e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            )}

            {/* Optional Evidence / Attachment */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Attachment / Photo Evidence (Max 5MB)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition shadow-sm">
                  <Upload className="w-4 h-4 text-teal-600" />
                  <span>{formData.attachment.fileName ? 'Change File' : 'Upload Document / Photo'}</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx" />
                </label>
                {formData.attachment.fileName && (
                  <span className="text-xs text-slate-600 flex items-center gap-1.5 font-mono">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    {formData.attachment.fileName} ({(formData.attachment.fileSize / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PRIVACY-AWARE LOCATION */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-lg font-bold text-slate-900">3. Privacy-Aware Location Setting</h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred location sharing mode. Sensitive complaints and examinations remain optional.
              </p>
            </div>

            <LocationPicker
              value={formData.location}
              onChange={(newLoc) => setFormData({ ...formData, location: newLoc })}
              category={formData.category}
              isSensitive={formData.isSensitive}
              locationHint={currentCategoryConfig?.locationHint}
            />
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-lg font-bold text-slate-900">4. Review & Confirm Submission</h2>
              <p className="text-xs text-slate-500 mt-1">
                Verify your complaint details before generating your tracking reference.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500">Category:</span>
                  <p className="font-bold text-slate-900 text-sm">{formData.category}</p>
                </div>
                <div>
                  <span className="text-slate-500">Complainant:</span>
                  <p className="font-semibold text-slate-900">{formData.fullName} ({formData.email})</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500">Subject:</span>
                <p className="font-bold text-slate-900">{formData.title}</p>
              </div>

              <div>
                <span className="text-slate-500">Description:</span>
                <p className="text-slate-700 leading-relaxed mt-1">{formData.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <span className="text-slate-500">Privacy Status:</span>
                  <p className="font-semibold text-slate-800">
                    {formData.isSensitive ? '🔒 Confidential Protected' : 'Standard Transparent Track'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Location Mode:</span>
                  <p className="font-semibold text-slate-800">
                    {formData.location.locationType === 'current_gps'
                      ? 'GPS Lat/Long recorded (redacted publicly)'
                      : formData.location.locationType === 'manual_address'
                      ? formData.location.addressText
                      : 'No location shared'}
                  </p>
                </div>
              </div>

              {formData.attachment.fileName && (
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-slate-600">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Attached: {formData.attachment.fileName}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                By lodging this grievance, a unique tracking reference code and a 6-digit verification PIN will be securely generated. You will be able to monitor milestones and communicate with investigating officers.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Navigation Controls */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-7 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-teal-900/20 disabled:opacity-50"
            >
              <span>{loading ? 'Submitting Grievance...' : 'Submit Grievance'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
