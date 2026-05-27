import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServer';
import { sendOTP } from '@/lib/otp';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, code } = body;

    const supabaseAdmin = createAdminClient();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    // ACTION: RESEND
    if (action === 'resend') {
      await sendOTP(email);
      return NextResponse.json({ success: true, message: 'New verification code sent!' });
    }

    // ACTION: VERIFY
    if (action === 'verify') {
      if (!code || code.length !== 6) {
        return NextResponse.json({ error: 'Verification code must be exactly 6 digits.' }, { status: 400 });
      }

      // Query OTP from database
      const now = new Date().toISOString();
      const { data: otpData, error: otpError } = await supabaseAdmin
        .from('otps')
        .select('*')
        .eq('email', email)
        .eq('otp_code', code)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1);

      if (otpError || !otpData || otpData.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
      }

      // Fetch the registered user profile by email to link session
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile for OTP session:', profileError);
        return NextResponse.json({ error: 'No registered user profile found in database.' }, { status: 404 });
      }

      // Invalidate all OTPs for this email to prevent reuse
      await supabaseAdmin.from('otps').delete().eq('email', email);

      // Create a secure session token
      const sessionToken = crypto.randomUUID();
      const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Save session in database
      const { error: sessionError } = await supabaseAdmin.from('user_sessions').insert({
        user_id: profile.id,
        session_token: sessionToken,
        otp_verified: true,
        expires_at: sessionExpires.toISOString(),
      });

      if (sessionError) {
        console.error('Error creating user session in DB:', sessionError);
        return NextResponse.json({ error: 'Session registration failed.' }, { status: 500 });
      }

      // Set cookie in response
      const response = NextResponse.json({ success: true, message: 'Successfully verified!' });
      const isProduction = process.env.NODE_ENV === 'production';
      
      response.cookies.set('portfolio_otp_session', sessionToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in OTP API route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
