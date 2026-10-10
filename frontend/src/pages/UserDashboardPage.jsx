import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  Filter,
  Clock,
  ArrowRight,
  Shield,
  AlertCircle,
  RefreshCw,
  Calendar,
  MessageSquare,
  Lock
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchMyComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/complaints/my');
      if (res.data?.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load your complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  // Filter complaints locally
  const filtered = complaints.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      c.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            Citizen Grievance Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            My Lodged Grievances
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        <Link
          to="/categories"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-teal-900/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lodge New Grievance</span>
        </Link>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Filed</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">{complaints.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
            {complaints.filter((c) => c.status === 'In Progress' || c.status === 'Under Review').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Needed</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">
            {complaints.filter((c) => c.status === 'Awaiting Information').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length}
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Tracking Reference or Subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Awaiting Information">Awaiting Information</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Harassment and Personal Safety">Harassment and Safety</option>
            <option value="Education and Examination">Education and Exams</option>
            <option value="Electricity and Public Utilities">Electricity & Utilities</option>
            <option value="Government and Public Services">Government Services</option>
            <option value="Municipal and Environmental Issues">Municipal & Civic</option>
            <option value="Technical Issues">Technical Issues</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Complaint List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
          <span>Retrieving your grievances from database...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 mx-auto flex items-center justify-center text-teal-700">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">No grievances found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm || statusFilter !== 'All' || categoryFilter !== 'All'
                ? 'Try adjusting your search filters.'
                : "You haven't filed any complaints yet."}
            </p>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <span>File Your First Grievance</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-teal-500/60 hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-navy-950 bg-slate-100 px-2.5 py-1 rounded-lg border">
                    {item.trackingId}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                  <PriorityBadge priority={item.priority} size="sm" />
                  {item.isSensitive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" /> Confidential
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Public Remarks Snippet */}
              {item.publicRemarks && (
                <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-teal-800">Officer Remark: </strong>
                    <span>{item.publicRemarks}</span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 font-medium">Category: <strong>{item.category}</strong></span>
                <Link
                  to={`/track?id=${encodeURIComponent(item.trackingId)}`}
                  className="font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1.5 transition"
                >
                  <span>Open Full Tracker & Milestones</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
