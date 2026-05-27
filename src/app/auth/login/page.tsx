'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Shield, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    // Get the base URL dynamically or use window.location.origin
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-60 -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-sky-100 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-neutral-100 shadow-2xl rounded-3xl p-8 text-center transition-all">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-6 border border-emerald-100/50">
          <Shield className="w-6 h-6" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2 font-sans">
          Welcome
        </h1>
        <p className="text-neutral-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
          Sign in to access Dattha Sashank's personal blogs, projects portfolio, and modular AI learning hub.
        </p>

        {error && (
          <div className="mb-6 p-4 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-medium transition-all duration-300 shadow-lg shadow-neutral-900/10 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          Dual-Layer Verification Active
        </div>
      </div>
    </div>
  );
}
