import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendOTP } from '@/lib/otp';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code) {
    const verifyUrl = new URL('/auth/verify-otp', origin);
    
    // Create a Map to collect unique cookies by name to prevent duplication
    const cookiesToSetLater = new Map<string, { value: string; options: any }>();

    // Initialize Supabase client bound to our temporary collector
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookiesToSetLater.set(name, { value, options });
            });
          },
        },
      }
    );

    // Exchange OAuth code for Supabase Auth session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user && data.user.email) {
      try {
        // Trigger sequential OTP send
        await sendOTP(data.user.email);
        
        // Append query parameters to the URL BEFORE creating the redirect response
        verifyUrl.searchParams.set('email', data.user.email);
        verifyUrl.searchParams.set('next', next);
        
        // Now create the redirect response with the finalized URL
        const response = NextResponse.redirect(verifyUrl);

        // Inject the collected cookies into the redirect response
        cookiesToSetLater.forEach((cookie, name) => {
          response.cookies.set(name, cookie.value, cookie.options);
        });
        
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
