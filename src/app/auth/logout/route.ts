import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();

  // 1. Sign out of Supabase Auth
  await supabase.auth.signOut();

  // 2. Create redirect response
  const response = NextResponse.redirect(new URL('/auth/login', origin));

  // 3. Clear the OTP session cookie
  response.cookies.set('portfolio_otp_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // expire immediately
  });

  return response;
}
export async function POST(request: Request) {
  return GET(request);
}
