'use client';

import { useState, useEffect } from 'react';
import { Lock, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';

interface LockScreenProps {
  tab: 'personal' | 'professional';
  userEmail: string;
  onRequestSubmitted?: () => void;
}

export default function LockScreen({ tab, userEmail, onRequestSubmitted }: LockScreenProps) {
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if the user already has a pending request for this tab
    async function checkPendingRequest() {
      try {
        const res = await fetch('/api/access-requests');
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            const hasPending = result.data.some(
              (req: any) =>
                (req.request_type === tab || req.request_type === 'both') &&
                req.status === 'Pending'
            );
            if (hasPending) {
              setRequestStatus('pending');
            }
          }
        }
      } catch (err) {
        console.error('Error checking pending requests:', err);
      }
    }

    checkPendingRequest();
  }, [tab]);

  const handleRequestAccess = async () => {
    setRequestStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: tab }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRequestStatus('success');
        if (onRequestSubmitted) {
          onRequestSubmitted();
        }
      } else {
        setErrorMessage(data.error || 'Failed to submit request.');
        setRequestStatus('error');
      }
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
      setRequestStatus('error');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4 fade-in">
      <div className="glass-card text-center border-neutral-100 p-8 md:p-10 relative overflow-hidden">
        {/* Background Accent Deco */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-neutral-100 rounded-full blur-2xl opacity-50" />

        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-100 text-neutral-400 mb-6">
          {requestStatus === 'pending' || requestStatus === 'success' ? (
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
          ) : (
            <Lock className="w-7 h-7 text-neutral-500" />
          )}
        </div>

        <h2 className="text-xl font-semibold text-neutral-900 mb-2 capitalize">
          {tab} Gated Portal
        </h2>
        
        <p className="text-neutral-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
          {tab === 'personal'
            ? 'This space contains writing, snapshots, and thoughts about architecture. Access is granted to verified viewers only.'
            : 'Explore project detailed case studies, achievements, and the interactive AI Learning hub.'}
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
            {errorMessage}
          </div>
        )}

        {requestStatus === 'idle' && (
          <button
            onClick={handleRequestAccess}
            className="btn-primary w-full justify-center py-3"
          >
            Request Gated Access
          </button>
        )}

        {requestStatus === 'loading' && (
          <button
            disabled
            className="btn-secondary w-full justify-center py-3 cursor-not-allowed opacity-80"
          >
            <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
            Sending Request...
          </button>
        )}

        {requestStatus === 'pending' && (
          <div className="w-full py-3 px-4 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-sm font-semibold flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Access Request Pending Admin Approval
          </div>
        )}

        {requestStatus === 'success' && (
          <div className="w-full py-3 px-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-sm font-semibold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Request Submitted Successfully!
          </div>
        )}

        {requestStatus === 'error' && (
          <button
            onClick={handleRequestAccess}
            className="btn-primary w-full justify-center py-3 bg-red-600 hover:bg-red-500"
          >
            Try Again
          </button>
        )}

        <div className="mt-6 text-[11px] text-neutral-400">
          Signed in as <span className="font-medium text-neutral-600">{userEmail}</span>
        </div>
      </div>
    </div>
  );
}
