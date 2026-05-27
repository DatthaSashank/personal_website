import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { sendOTP } from '@/lib/otp';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code) {
    const supabase = await createClient();
    
    // Exchange OAuth code for Supabase Auth session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user && data.user.email) {
      try {
        // Trigger sequential OTP send
        await sendOTP(data.user.email);
        
        // Redirect to OTP verification page
        const verifyUrl = new URL('/auth/verify-otp', origin);
        verifyUrl.searchParams.set('email', data.user.email);
        verifyUrl.searchParams.set('next', next);
        return NextResponse.redirect(verifyUrl);
      } catch (otpError) {
        console.error('Error in callback OTP trigger:', otpError);
        return NextResponse.redirect(
          new URL(`/auth/login?error=Failed to initialize verification step`, origin)
        );
      }
    } else {
      console.error('Error exchanging code for session:', error);
    }
  }

  // Fallback if code exchange failed
  return NextResponse.redirect(new URL('/auth/login?error=Google authentication failed', origin));
}
