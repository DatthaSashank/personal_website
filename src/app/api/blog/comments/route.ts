import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

// GET comments for a blog (joins profiles to get commenter names)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');

    if (!blogId) {
      return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Query comments and join profiles
    const { data: comments, error } = await supabase
      .from('comments')
      .select('id, blog_id, user_id, parent_id, content, created_at, profiles(name, role)')
      .eq('blog_id', blogId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: comments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a comment or nested reply
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blogId, parentId, content } = await request.json();
    if (!blogId || !content || content.trim() === '') {
      return NextResponse.json({ error: 'blogId and content are required' }, { status: 400 });
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        blog_id: blogId,
        user_id: user.id,
        parent_id: parentId || null,
        content: content.trim(),
      })
      .select('id, blog_id, user_id, parent_id, content, created_at, profiles(name, role)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: comment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a comment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
