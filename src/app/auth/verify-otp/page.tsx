'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || '';
  const next = searchParams?.get('next') || '/';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Count down for resending OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    // Take the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Auto-focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return; // Must be exactly 6 digits

    const digits = pasteData.split('');
    setOtp(digits);
    // Focus last input
    inputRefs.current[5]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);
    setResendStatus(null);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, code: otpCode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(next);
        router.refresh();
      } else {
        setError(data.error || 'Verification failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError(null);
    setResendStatus(null);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResendStatus('A new code has been sent to your email.');
        setTimer(60);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend code.');
      }
    } catch (err) {
      setError('Network error. Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-60 -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-sky-100 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-neutral-100 shadow-2xl rounded-3xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-6 border border-emerald-100/50">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">
          Verify It's You
        </h1>
        <p className="text-neutral-500 text-xs mb-6 leading-relaxed max-w-xs mx-auto">
          We sent a 6-digit verification code to <span className="font-semibold text-neutral-800">{email}</span>. Please enter it below.
        </p>

        {error && (
          <div className="mb-6 p-4 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        {resendStatus && (
          <div className="mb-6 p-4 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl">
            {resendStatus}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-2.5 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={loading}
                className="w-12 h-14 text-center text-xl font-semibold bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-xl outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.some((d) => d === '')}
            className="w-full py-3.5 px-5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-medium transition-all duration-300 shadow-lg shadow-neutral-900/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-neutral-500">
          {timer > 0 ? (
            <span>Resend code in {timer}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-500 font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resend verification code
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          Secure Session Initializing
        </div>
      </div>
    </div>
  );
}
