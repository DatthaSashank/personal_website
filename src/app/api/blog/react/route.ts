import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

// GET reaction counts and user status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');

    if (!blogId) {
      return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch all reactions for this blog
    const { data: reactions, error } = await supabase
      .from('blog_reactions')
      .select('reaction_type, user_id')
      .eq('blog_id', blogId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate reactions
    const counts = { like: 0, fire: 0, mindblown: 0, heart: 0 };
    let userReactions: string[] = [];

    reactions?.forEach((r) => {
      const type = r.reaction_type as keyof typeof counts;
      if (counts[type] !== undefined) {
        counts[type]++;
      }
      if (user && r.user_id === user.id) {
        userReactions.push(r.reaction_type);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        counts,
        userReactions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST toggle a reaction
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blogId, reactionType } = await request.json();
    if (!blogId || !reactionType || !['like', 'fire', 'mindblown', 'heart'].includes(reactionType)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Check if the reaction already exists
    const { data: existing, error: checkError } = await supabase
      .from('blog_reactions')
      .select('*')
      .eq('blog_id', blogId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType)
      .limit(1);

    if (existing && existing.length > 0) {
      // Reaction exists, toggle OFF (delete it)
      const { error: deleteError } = await supabase
        .from('blog_reactions')
        .delete()
        .eq('blog_id', blogId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Toggle ON (insert it)
      const { error: insertError } = await supabase
        .from('blog_reactions')
        .insert({
          blog_id: blogId,
          user_id: user.id,
          reaction_type: reactionType,
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
