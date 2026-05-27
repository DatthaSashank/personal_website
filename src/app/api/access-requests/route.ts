import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve requests submitted by the logged-in user
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestType } = await request.json();
    if (!requestType || !['personal', 'professional', 'both'].includes(requestType)) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    // Check if there is already an active pending request of this type
    const { data: existing, error: checkError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('request_type', requestType)
      .eq('status', 'Pending')
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, message: 'Request is already pending.' });
    }

    // Insert access request
    const { error: insertError } = await supabase
      .from('access_requests')
      .insert({
        user_id: user.id,
        email: user.email!,
        request_type: requestType,
        status: 'Pending',
      });

    if (insertError) {
      console.error('Error inserting access request:', insertError);
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Access request submitted successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
