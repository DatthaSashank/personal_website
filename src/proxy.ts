import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client in Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Paths classification
  const isAuthPage = pathname.startsWith('/auth');
  const isAdminPage = pathname.startsWith('/admin');
  const isBlogPostPage = pathname.startsWith('/blog');

  // Retrieve user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(`[Proxy Middleware] Path: ${pathname}, User ID: ${user?.id || 'null'}, Email: ${user?.email || 'null'}`);

  // 1. If not authenticated at all
  if (!user) {
    if (isAdminPage || isBlogPostPage || pathname === '/' || pathname === '/profile' || pathname === '/about') {
      console.log(`[Proxy Middleware] Redirecting unauthenticated user from ${pathname} to /auth/login`);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return response;
  }

  // 2. If authenticated with Google, check OTP verification token
  const otpCookie = request.cookies.get('portfolio_otp_session')?.value;
  let isOtpVerified = false;

  if (otpCookie) {
    // Verify session token in database using a service role client to bypass RLS
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      adminKey,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('user_sessions')
      .select('otp_verified, expires_at')
      .eq('session_token', otpCookie)
      .eq('user_id', user.id)
      .single();

    if (sessionError) {
      console.error('Middleware session query error:', sessionError);
    }

    if (sessionData && !sessionError) {
      const expiresAt = new Date(sessionData.expires_at);
      if (sessionData.otp_verified && expiresAt > new Date()) {
        isOtpVerified = true;
      }
    }
  }

  console.log(`[Proxy Middleware] Path: ${pathname}, isOtpVerified: ${isOtpVerified}`);

  // If Google authenticated but OTP not verified
  if (!isOtpVerified) {
    const isVerificationRoute = 
      pathname.startsWith('/auth/verify-otp') || 
      pathname.startsWith('/auth/callback') || 
      pathname.startsWith('/auth/login') ||
      pathname.startsWith('/auth/logout');

    if (!isVerificationRoute) {
      const verifyUrl = new URL('/auth/verify-otp', request.url);
      verifyUrl.searchParams.set('email', user.email || '');
      return NextResponse.redirect(verifyUrl);
    }
    return response;
  }

  // 3. User is Google-logged in AND OTP-verified. Enforce Gated Roles
  // Fetch user profile (uses anon key in middleware; RLS allows selecting own profile)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, has_personal_access, has_professional_access')
    .eq('id', user.id)
    .single();

  if (!profile || profileError) {
    // If profile is missing (e.g. trigger failed or delay), allow access to home but restrict other areas
    if (isAdminPage || isBlogPostPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // Admin page restriction
  if (isAdminPage && profile.role !== 'Admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Direct Blog pages (gated to Personal access)
  if (isBlogPostPage && profile.role !== 'Admin' && !profile.has_personal_access) {
    return NextResponse.redirect(new URL('/?tab=professional', request.url));
  }

  // Redirect authenticated & verified users away from auth pages
  if (isAuthPage && !pathname.startsWith('/auth/logout')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately in API routes for performance and CORS reasons)
     * - static files (_next/static, _next/image, favicon.ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/otp|api/ai-chat|api/access-requests|api/blog/react|api/blog/comments|api/blog|api/projects|api/certifications).*)',
  ],
};
