import { createClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { ArrowLeft, User, Briefcase, Award } from 'lucide-react';

export const revalidate = 0;

export default async function About() {
  const supabase = await createClient();
  const { data: sections, error } = await supabase.from('about_sections').select('*');

  if (error) {
    console.error('Error fetching about sections:', error);
  }

  // Helper to safely extract content
  const getSection = (key: string) => sections?.find((s) => s.section_key === key);
  
  const personal = getSection('personal');
  const professional = getSection('professional');
  const certifications = getSection('certifications');

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 fade-in">
      {/* Navigation */}
      <div>
        <Link href="/" className="btn-secondary text-neutral-500 pl-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Site
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-1">
          About Dattha Sashank
        </h1>
        <p className="text-neutral-500 text-sm">A brief look into my personal background and professional history.</p>
      </div>

      {/* Grid of Sections */}
      <div className="grid gap-6">
        <section className="glass-card border-neutral-100 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-500" />
            {personal ? personal.title : 'Personal Story'}
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
            {personal ? personal.content : 'I am a passionate technologist exploring software architecture and AI.'}
          </p>
        </section>

        <section className="glass-card border-neutral-100 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-500" />
            {professional ? professional.title : 'Professional Journey'}
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
            {professional ? professional.content : 'Senior Software Engineer leading architecture for scalable web applications.'}
          </p>
        </section>

        <section className="glass-card border-neutral-100 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            {certifications ? certifications.title : 'Certifications'}
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
            {certifications ? certifications.content : 'AWS Solutions Architect, React Advanced Certification.'}
          </p>
        </section>
      </div>
    </div>
  );
}
