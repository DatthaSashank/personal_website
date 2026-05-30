'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { User, Shield, Key, Loader2, Award, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  has_personal_access: boolean;
  has_professional_access: boolean;
}

interface AccessRequest {
  id: string;
  request_type: 'personal' | 'professional' | 'both';
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [nameInput, setNameInput] = useState('');
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchProfileAndRequests();
  }, []);

  const fetchProfileAndRequests = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile from secure server API
        const profileRes = await fetch('/api/auth/profile');
        if (profileRes.ok) {
          const pData = await profileRes.json();
          if (pData.success && pData.profile) {
            setProfile(pData.profile);
            setNameInput(pData.profile.name || '');
          }
        }

        // Fetch requests
        const reqRes = await fetch('/api/access-requests');
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          if (reqData.success) {
            setRequests(reqData.data);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setUpdateStatus('Updating...');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: nameInput.trim() })
        .eq('id', profile.id);

      if (error) {
        setUpdateStatus(`Error: ${error.message}`);
      } else {
        setUpdateStatus('Display name updated successfully!');
        setProfile((prev) => prev ? { ...prev, name: nameInput.trim() } : null);
        setTimeout(() => setUpdateStatus(null), 3000);
      }
    } catch (err) {
      setUpdateStatus('Failed to connect.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        <p className="text-sm text-neutral-500 font-medium">Retrieving Profile Node...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="glass-card border-neutral-100 p-8">
          <p className="text-neutral-500 mb-4">Please log in to view your profile dashboard.</p>
        </div>
      </div>
    );
  }

  const isUserAdmin = profile.role === 'Admin';

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 fade-in">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-1 flex items-center gap-2">
          <User className="w-8 h-8 text-neutral-800" />
          Explorer Profile
        </h1>
        <p className="text-neutral-500 text-sm">Review your security credentials and gated access rights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Account Card */}
        <div className="glass-card border-neutral-100/70 p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-md font-semibold text-neutral-900 mb-4">Security Credentials</h2>
            
            {updateStatus && (
              <div className="mb-4 p-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl">
                {updateStatus}
              </div>
            )}

            <form onSubmit={handleUpdateName} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Gmail Address</label>
                <input className="input-field bg-neutral-50 border-neutral-100 text-neutral-500 cursor-not-allowed text-xs" value={profile.email} disabled />
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Display Name</label>
                <input className="input-field text-xs" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
              </div>

              <button type="submit" className="btn-primary self-start text-xs py-2">
                Save Display Name
              </button>
            </form>
          </div>
        </div>

        {/* Right Card: Access Permissions Badges */}
        <div className="glass-card border-neutral-100/70 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-semibold text-neutral-900 mb-4 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-500" />
              Gated Rights
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-50 bg-neutral-50/50">
                <span className="text-xs font-semibold text-neutral-600">Site Role</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 rounded-full px-2 py-0.5 capitalize">
                  {profile.role.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-50 bg-neutral-50/50">
                <span className="text-xs font-semibold text-neutral-600">Personal Gated</span>
                <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${
                  isUserAdmin || profile.has_personal_access
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-neutral-100 text-neutral-400 border-neutral-200/50'
                }`}>
                  {isUserAdmin || profile.has_personal_access ? 'Active' : 'Locked'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-50 bg-neutral-50/50">
                <span className="text-xs font-semibold text-neutral-600">Professional Hub</span>
                <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${
                  isUserAdmin || profile.has_professional_access
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-neutral-100 text-neutral-400 border-neutral-200/50'
                }`}>
                  {isUserAdmin || profile.has_professional_access ? 'Active' : 'Locked'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access Requests Queue */}
      <div className="glass-card border-neutral-100/70 p-6">
        <h3 className="text-md font-semibold text-neutral-900 mb-4 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-500" />
          Access Requests Logs
        </h3>

        {requests.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4">No access requests submitted by this account.</p>
        ) : (
          <div className="grid gap-3">
            {requests.map((req) => (
              <div 
                key={req.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-50 bg-neutral-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    req.status === 'Pending' 
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : req.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {req.status === 'Pending' && <Clock className="w-4 h-4" />}
                    {req.status === 'Approved' && <CheckCircle2 className="w-4 h-4" />}
                    {req.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-800 capitalize">
                      {req.request_type} access portal
                    </span>
                    <span className="text-[9px] text-neutral-400 font-medium">
                      Submitted {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${
                  req.status === 'Pending' 
                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                    : req.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
