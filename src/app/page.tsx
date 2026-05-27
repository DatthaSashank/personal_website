import { createClient } from '@/lib/supabaseServer';
import PortfolioApp from '@/components/PortfolioApp';

// Disable layout static caching so user status changes are visible instantly
export const revalidate = 0;

export default async function Home() {
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
    <PortfolioApp initialUser={user} initialProfile={profile} />
  );
}
