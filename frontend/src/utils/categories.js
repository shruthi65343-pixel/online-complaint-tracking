export const COMPLAINT_CATEGORIES = [
  {
    id: 'harassment-safety',
    name: 'Harassment and Personal Safety',
    shortName: 'Safety & Harassment',
    description: 'Harassment, bullying, threats, workplace or campus misconduct, and requests for support.',
    iconName: 'ShieldAlert',
    accentColor: 'text-rose-600 bg-rose-50 border-rose-200',
    isSensitive: true,
    locationRequirement: 'optional',
    locationHint: 'Location is completely optional to safeguard your privacy.'
  },
  {
    id: 'education-exam',
    name: 'Education and Examination',
    shortName: 'Education & Exams',
    description: 'Exam re-evaluation, incorrect marks, delayed results, examination issues, and administrative complaints.',
    iconName: 'GraduationCap',
    accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    isSensitive: false,
    locationRequirement: 'optional',
    locationHint: 'Campus address can be provided if an on-site office is involved.'
  },
  {
    id: 'electricity-utilities',
    name: 'Electricity and Public Utilities',
    shortName: 'Electricity & Utilities',
    description: 'Power outages, damaged electric poles, exposed wires, billing problems, water supply and streetlights.',
    iconName: 'Zap',
    accentColor: 'text-amber-600 bg-amber-50 border-amber-200',
    isSensitive: false,
    locationRequirement: 'recommended',
    locationHint: 'Providing the affected address or GPS coordinates helps repair crews locate the fault quickly.'
  },
  {
    id: 'govt-public-services',
    name: 'Government and Public Services',
    shortName: 'Public Services',
    description: 'Delayed services, administrative grievances, documentation issues and public service complaints.',
    iconName: 'Building2',
    accentColor: 'text-teal-600 bg-teal-50 border-teal-200',
    isSensitive: false,
    locationRequirement: 'optional',
    locationHint: 'Mention the civic office, taluk center or service branch location.'
  },
  {
    id: 'municipal-environment',
    name: 'Municipal and Environmental Issues',
    shortName: 'Municipal & Civic',
    description: 'Garbage collection, drainage, sanitation, road damage and waterlogging.',
    iconName: 'Trash2',
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    isSensitive: false,
    locationRequirement: 'recommended',
    locationHint: 'Location details ensure municipal sanitation and civil teams can inspect the site.'
  },
  {
    id: 'technical-issues',
    name: 'Technical Issues',
    shortName: 'Technical & Digital',
    description: 'Laptop or computer issues, software problems, website errors and digital services.',
    iconName: 'Laptop',
    accentColor: 'text-sky-600 bg-sky-50 border-sky-200',
    isSensitive: false,
    locationRequirement: 'optional',
    locationHint: 'Location is generally not required for digital services.'
  },
  {
    id: 'other',
    name: 'Other',
    shortName: 'General Complaints',
    description: 'A general complaint category for miscellaneous civic or administrative issues not covered above.',
    iconName: 'HelpCircle',
    accentColor: 'text-slate-600 bg-slate-50 border-slate-200',
    isSensitive: false,
    locationRequirement: 'optional',
    locationHint: 'Provide location only if relevant to your issue.'
  }
];

export const STATUS_LIST = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Awaiting Information',
  'Resolved',
  'Closed'
];

export const PRIORITY_LIST = [
  'Low',
  'Medium',
  'High',
  'Urgent'
];
