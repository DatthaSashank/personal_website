import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabaseServer';

// GET all access requests (Admin only)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Admin status
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();
    const { data: requests, error } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST approve/reject request (Admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Admin status
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!adminProfile || adminProfile.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { requestId, action } = await request.json();
    if (!requestId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch the request details
    const { data: accessRequest, error: fetchError } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !accessRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const targetStatus = action === 'approve' ? 'Approved' : 'Rejected';

    // 2. Update the request status
    const { error: requestUpdateError } = await supabaseAdmin
      .from('access_requests')
      .update({ status: targetStatus })
      .eq('id', requestId);

    if (requestUpdateError) {
      return NextResponse.json({ error: requestUpdateError.message }, { status: 500 });
    }

    // 3. If approved, automatically update user's profile permissions!
    if (action === 'approve') {
      // Determine what to enable
      const type = accessRequest.request_type;
      const enablePersonal = type === 'personal' || type === 'both';
      const enableProfessional = type === 'professional' || type === 'both';

      // Fetch the target user's current permissions
      const { data: targetProfile, error: profileFetchError } = await supabaseAdmin
        .from('profiles')
        .select('has_personal_access, has_professional_access')
        .eq('id', accessRequest.user_id)
        .single();

      if (!profileFetchError && targetProfile) {
        const updatePayload: any = {};
        if (enablePersonal) updatePayload.has_personal_access = true;
        if (enableProfessional) updatePayload.has_professional_access = true;

        await supabaseAdmin
          .from('profiles')
          .update(updatePayload)
          .eq('id', accessRequest.user_id);
      }
    }

    return NextResponse.json({ success: true, message: `Request successfully ${targetStatus.toLowerCase()}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
