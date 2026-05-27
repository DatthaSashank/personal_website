import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import { LogOut, Shield, User as UserIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dattha Sashank | Personal Portfolio',
  description: 'Gated Personal Portfolio, Medium-style Blog, and AI Hub.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#fbfbfd]">
        <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-md border-b border-neutral-100">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-neutral-900 hover:opacity-85 transition-opacity"
            >
              Dattha Sashank
            </Link>

            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                About
              </Link>
              {profile?.role === 'Admin' && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Dashboard
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-100 rounded-full pl-3 pr-1 py-1">
                  <div className="flex flex-col text-right hidden xs:flex">
                    <span className="text-xs font-semibold text-neutral-800 leading-tight">
                      {profile?.name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-medium capitalize">
                      {profile?.role || 'Guest'}
                    </span>
                  </div>
                  <Link
                    href="/profile"
                    className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300 transition-colors"
                    title="View Profile Status"
                  >
                    <UserIcon className="w-4 h-4 text-neutral-600" />
                  </Link>
                  <Link
                    href="/auth/logout"
                    className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <Link href="/auth/login" className="btn-primary text-xs py-1.5 px-3">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          {children}
        </main>

        <footer className="border-t border-neutral-100 py-8 text-center text-xs text-neutral-400 bg-white/30">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} Dattha Sashank. Built with Next.js, Tailwind CSS & Supabase.</p>
            <div className="flex gap-4">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/about" className="hover:underline">About</Link>
              <Link href="/profile" className="hover:underline">Profile</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
