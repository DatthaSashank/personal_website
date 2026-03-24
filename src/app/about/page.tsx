import { supabase } from '@/lib/supabase'

export const revalidate = 0;

export default async function About() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');

  // Helper to safely get profile content
  const getProfile = (key: string) => profiles?.find(p => p.section_key === key);
  const personal = getProfile('personal');
  const professional = getProfile('professional');
  const certifications = getProfile('certifications');

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: 600 }}>About Dattha Sashank</h1>
      
      <div style={{ display: 'grid', gap: '2rem' }}>
        <section className="glass-card">
          <h2 style={{ fontSize: '1.5rem', color: 'var(--foreground)', marginBottom: '1rem', fontWeight: 600 }}>
             {personal ? personal.title : 'Personal Story'}
          </h2>
          <p style={{ lineHeight: 1.6, color: 'var(--secondary)' }}>
            {personal ? personal.content : "Data not found. Please add via Admin dashboard."}
          </p>
        </section>

        <section className="glass-card">
          <h2 style={{ fontSize: '1.5rem', color: 'var(--foreground)', marginBottom: '1rem', fontWeight: 600 }}>
             {professional ? professional.title : 'Professional Journey'}
          </h2>
          <p style={{ lineHeight: 1.6, color: 'var(--secondary)', whiteSpace: 'pre-wrap' }}>
             {professional ? professional.content : "Data not found. Please add via Admin dashboard."}
          </p>
        </section>

        <section className="glass-card">
          <h2 style={{ fontSize: '1.5rem', color: 'var(--foreground)', marginBottom: '1rem', fontWeight: 600 }}>
             {certifications ? certifications.title : 'Certifications'}
          </h2>
          <p style={{ lineHeight: 1.6, color: 'var(--secondary)', whiteSpace: 'pre-wrap' }}>
             {certifications ? certifications.content : "Data not found. Please add via Admin dashboard."}
          </p>
        </section>
      </div>
    </div>
  )
}
