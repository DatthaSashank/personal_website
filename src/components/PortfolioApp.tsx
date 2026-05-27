'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Briefcase, Eye, ShieldAlert, Sparkles } from 'lucide-react';
import LockScreen from './LockScreen';
import PersonalTab from './PersonalTab';
import ProfessionalTab from './ProfessionalTab';

interface PortfolioAppProps {
  initialUser: any;
  initialProfile: any;
}

export default function PortfolioApp({ initialUser, initialProfile }: PortfolioAppProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Tab State: default to professional
  const currentTabParam = searchParams?.get('tab') || 'professional';
  const [activeTab, setActiveTab] = useState<'personal' | 'professional'>(
    currentTabParam === 'personal' ? 'personal' : 'professional'
  );
  
  const [profile, setProfile] = useState(initialProfile);

  // Sync state if URL search parameters change
  useEffect(() => {
    if (searchParams) {
      const tab = searchParams.get('tab');
      if (tab === 'personal' || tab === 'professional') {
        setActiveTab(tab);
      }
    }
  }, [searchParams]);

  // Sync profile data dynamically by querying the endpoint
  const refreshProfile = async () => {
    try {
      const res = await fetch('/api/access-requests'); // Endpoint triggers profile queries too
      if (res.ok) {
        // Re-fetch profile status from a direct user info call
        const userRes = await fetch('/api/auth/profile');
        if (userRes.ok) {
          const uData = await userRes.json();
          if (uData.success && uData.profile) {
            setProfile(uData.profile);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tab: 'personal' | 'professional') => {
    setActiveTab(tab);
    // Update URL query parameters silently
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`/?${params.toString()}`);
  };

  // Determine permissions
  const isUserAdmin = profile?.role === 'Admin';
  const hasPersonalAccess = isUserAdmin || profile?.has_personal_access || profile?.role === 'Personal_Viewer';
  const hasProfessionalAccess = isUserAdmin || profile?.has_professional_access || profile?.role === 'Professional_Viewer';

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="text-center max-w-2xl mx-auto mb-10 pt-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
          Exploring Software Architecture & AI.
        </h1>
        <p className="text-neutral-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8">
          I'm Dattha Sashank, a professional software engineer focused on building highly scalable web systems, clean security policies, and autonomous AI agents.
        </p>

        {/* Apple-style Capsule Tab Switcher */}
        <div className="inline-flex p-1 bg-neutral-200/50 backdrop-blur-md rounded-full border border-neutral-200/20 shadow-inner">
          <button
            onClick={() => handleTabChange('professional')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
              activeTab === 'professional'
                ? 'bg-neutral-950 text-white shadow-md'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Professional Hub
          </button>
          <button
            onClick={() => handleTabChange('personal')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-neutral-950 text-white shadow-md'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Personal Gated
          </button>
        </div>
      </section>

      {/* Gated Views Render */}
      <div className="min-h-[400px]">
        {activeTab === 'personal' ? (
          hasPersonalAccess ? (
            <PersonalTab isAdmin={isUserAdmin} currentUserId={initialUser?.id} />
          ) : (
            <LockScreen tab="personal" userEmail={initialUser?.email} onRequestSubmitted={refreshProfile} />
          )
        ) : hasProfessionalAccess ? (
          <ProfessionalTab isAdmin={isUserAdmin} />
        ) : (
          <LockScreen tab="professional" userEmail={initialUser?.email} onRequestSubmitted={refreshProfile} />
        )}
      </div>
    </div>
  );
}
