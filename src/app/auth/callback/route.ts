import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendOTP } from '@/lib/otp';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code) {
    // 1. Create the redirect response object first
    const verifyUrl = new URL('/auth/verify-otp', origin);
    const response = NextResponse.redirect(verifyUrl);

    // 2. Initialize Supabase client bound directly to the redirect response cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Retrieve cookies from incoming request
            const cookieList = request.cookies.getAll();
            return cookieList;
          },
          setAll(cookiesToSet) {
            // Write cookies directly to the redirect response
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // 3. Exchange OAuth code for Supabase Auth session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user && data.user.email) {
      try {
        // Trigger sequential OTP send
        await sendOTP(data.user.email);
        
        // Append query parameters to redirect URL
        verifyUrl.searchParams.set('email', data.user.email);
        verifyUrl.searchParams.set('next', next);
        
        // Return the response which has the cookies successfully injected
        return response;
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
