'use client';

import { useState, useEffect } from 'react';
import { 
  Users, ShieldAlert, CheckCircle, XCircle, Clock, Shield, 
  ArrowLeft, RefreshCw, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: 'Admin' | 'Personal_Viewer' | 'Professional_Viewer' | 'Public';
  has_personal_access: boolean;
  has_professional_access: boolean;
  updated_at: string;
}

interface AccessRequest {
  id: string;
  user_id: string;
  email: string;
  request_type: 'personal' | 'professional' | 'both';
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard views: 'users' | 'requests'
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'requests'>('users');
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profilesRes, requestsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/requests')
      ]);

      if (profilesRes.ok && requestsRes.ok) {
        const pData = await profilesRes.json();
        const rData = await requestsRes.json();
        if (pData.success && rData.success) {
          setProfiles(pData.data);
          setRequests(rData.data);
        } else {
          setError(pData.error || rData.error || 'Failed to fetch admin data.');
        }
      } else {
        setError('Unauthorized access or network error.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (
    targetUserId: string, 
    field: 'personal' | 'professional', 
    currentVal: boolean
  ) => {
    setActionStatus('Updating permissions...');
    const profile = profiles.find(p => p.id === targetUserId);
    if (!profile) return;

    const payload = {
      targetUserId,
      role: profile.role,
      hasPersonalAccess: field === 'personal' ? !currentVal : profile.has_personal_access,
      hasProfessionalAccess: field === 'professional' ? !currentVal : profile.has_professional_access
    };

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles(prev => prev.map(p => p.id === targetUserId ? data.data : p));
        setActionStatus(null);
      } else {
        setActionStatus(`Failed: ${data.error}`);
      }
    } catch (err) {
      setActionStatus('Network error.');
    }
  };

  const handleChangeRole = async (targetUserId: string, newRole: string) => {
    setActionStatus('Updating role...');
    const profile = profiles.find(p => p.id === targetUserId);
    if (!profile) return;

    const payload = {
      targetUserId,
      role: newRole,
      hasPersonalAccess: profile.has_personal_access,
      hasProfessionalAccess: profile.has_professional_access
    };

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles(prev => prev.map(p => p.id === targetUserId ? data.data : p));
        setActionStatus(null);
      } else {
        setActionStatus(`Failed: ${data.error}`);
      }
    } catch (err) {
      setActionStatus('Network error.');
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    setActionStatus(`Processing request...`);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh data
        await fetchDashboardData();
        setActionStatus(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        setTimeout(() => setActionStatus(null), 3000);
      } else {
        setActionStatus(`Failed: ${data.error}`);
      }
    } catch (err) {
      setActionStatus('Network error.');
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        <p className="text-sm text-neutral-500 font-medium">Securing Dashboard Node...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="glass-card border-red-100 p-8 text-center bg-red-50/50">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">Access Restriced</h2>
          <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
            {error}
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  return (
    <div className="fade-in max-w-5xl mx-auto">
      {/* Back button */}
      <Link href="/" className="btn-secondary text-neutral-500 pl-2 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Site
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-1 flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-500" />
            Admin Command Node
          </h1>
          <p className="text-neutral-500 text-sm">
            Control registered explorer credentials and access privileges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {actionStatus && (
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {actionStatus}
            </span>
          )}
          <button 
            onClick={fetchDashboardData}
            className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:border-neutral-900 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Admin Panel Tabs */}
      <div className="flex border-b border-neutral-200/60 mb-8">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'users'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-neutral-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Users ({profiles.length})
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'requests'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-neutral-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Access Requests
          {pendingRequests.length > 0 && (
            <span className="text-[10px] font-bold bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* View Details */}
      {activeSubTab === 'users' ? (
        <div className="glass-card border-neutral-100 p-0 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50/50 border-b border-neutral-100 text-neutral-400 font-semibold text-xs tracking-wider uppercase">
                <tr>
                  <th className="px-6 py-4">Explorer Details</th>
                  <th className="px-6 py-4">Security Role</th>
                  <th className="px-6 py-4 text-center">Personal Gated</th>
                  <th className="px-6 py-4 text-center">Professional Hub</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {profiles.map((prof) => (
                  <tr key={prof.id} className="hover:bg-neutral-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-900">{prof.name || 'New Explorer'}</span>
                        <span className="text-xs text-neutral-400 font-medium">{prof.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={prof.role}
                        onChange={(e) => handleChangeRole(prof.id, e.target.value)}
                        className="bg-white border border-neutral-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:border-neutral-900 cursor-pointer"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Personal_Viewer">Personal Viewer</option>
                        <option value="Professional_Viewer">Professional Viewer</option>
                        <option value="Public">Public</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={prof.has_personal_access || prof.role === 'Admin'}
                        disabled={prof.role === 'Admin'}
                        onChange={() => handleToggleAccess(prof.id, 'personal', prof.has_personal_access)}
                        className="w-4 h-4 accent-neutral-950 cursor-pointer disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={prof.has_professional_access || prof.role === 'Admin'}
                        disabled={prof.role === 'Admin'}
                        onChange={() => handleToggleAccess(prof.id, 'professional', prof.has_professional_access)}
                        className="w-4 h-4 accent-neutral-950 cursor-pointer disabled:opacity-50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card border-neutral-100 p-0 overflow-hidden shadow-sm">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400 font-medium">
              No access requests logs registered.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50/50 border-b border-neutral-100 text-neutral-400 font-semibold text-xs tracking-wider uppercase">
                  <tr>
                    <th className="px-6 py-4">User Email</th>
                    <th className="px-6 py-4">Requested Tab</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-neutral-900">{req.email}</td>
                      <td className="px-6 py-4 capitalize font-mono text-xs">{req.request_type}</td>
                      <td className="px-6 py-4 text-xs text-neutral-400">
                        {new Date(req.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2.5 py-0.5 ${
                          req.status === 'Pending' 
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {req.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {req.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                          {req.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleRequestAction(req.id, 'approve')}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRequestAction(req.id, 'reject')}
                              className="px-2.5 py-1 bg-neutral-100 hover:bg-red-50 hover:text-red-600 rounded-lg text-xs font-semibold transition-all border border-transparent hover:border-red-100"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-300">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
        Admin Console Active
      </div>
    </div>
  );
}
