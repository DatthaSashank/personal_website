'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit, Trash2, Send, Loader2, CornerDownRight 
} from 'lucide-react';

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    role: string;
  };
}

interface BlogReaderProps {
  blog: Blog;
  onBack: () => void;
  isAdmin: boolean;
  currentUserId: string;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  onEdit?: (blog: Blog, e: React.MouseEvent) => void;
}

export default function BlogReader({ 
  blog, onBack, isAdmin, currentUserId, onDelete, onEdit 
}: BlogReaderProps) {
  const [reactions, setReactions] = useState({ like: 0, fire: 0, mindblown: 0, heart: 0 });
  const [userReacted, setUserReacted] = useState<string[]>([]);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [rootCommentInput, setRootCommentInput] = useState('');
  const [replyInputId, setReplyInputId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    fetchReactions();
    fetchComments();
  }, [blog.id]);

  const fetchReactions = async () => {
    try {
      const res = await fetch(`/api/blog/react?blogId=${blog.id}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setReactions(result.data.counts);
          setUserReacted(result.data.userReactions);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await fetch(`/api/blog/comments?blogId=${blog.id}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success) setComments(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleReact = async (type: 'like' | 'fire' | 'mindblown' | 'heart') => {
    try {
      const res = await fetch('/api/blog/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId: blog.id, reactionType: type }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setReactions((prev: any) => {
            const increment = result.action === 'added' ? 1 : -1;
            return { ...prev, [type]: Math.max(0, prev[type] + increment) };
          });
          setUserReacted((prev) => 
            result.action === 'added' ? [...prev, type] : prev.filter(t => t !== type)
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (parentId: string | null = null) => {
    const content = parentId ? replyText : rootCommentInput;
    if (!content.trim()) return;

    setCommentSubmitting(true);
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId: blog.id, parentId, content }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setComments((prev) => [...prev, result.data]);
        if (parentId) {
          setReplyText('');
          setReplyInputId(null);
        } else {
          setRootCommentInput('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch(`/api/blog/comments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const emojiList = [
    { key: 'like' as const, symbol: '👍' },
    { key: 'fire' as const, symbol: '🔥' },
    { key: 'mindblown' as const, symbol: '🤯' },
    { key: 'heart' as const, symbol: '❤️' },
  ];

  const rootComments = comments.filter((c) => c.parent_id === null);

  return (
    <div className="fade-in max-w-2xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="btn-secondary text-neutral-500 hover:text-neutral-900 pl-2">
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        {isAdmin && onDelete && onEdit && (
          <div className="flex gap-2">
            <button 
              onClick={(e) => onEdit(blog, e)} 
              className="btn-secondary text-xs"
            >
              <Edit className="w-4 h-4" />
              Edit Post
            </button>
            <button 
              onClick={(e) => onDelete(blog.id, e)} 
              className="btn-secondary text-red-500 hover:bg-red-50 text-xs"
            >
              <Trash2 className="w-4 h-4" />
              Delete Post
            </button>
          </div>
        )}
      </div>

      {/* Main Post */}
      <article className="mb-12">
        {blog.image_url && (
          <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden mb-8 border border-neutral-100 bg-neutral-50 shadow-sm">
            <img src={blog.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          {blog.title}
        </h1>

        <div className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-8">
          {new Date(blog.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <div className="article-content leading-relaxed text-neutral-800 text-sm md:text-base">
          {blog.content.split('\n').map((para, idx) => {
            if (!para.trim()) return null;
            return <p key={idx}>{para}</p>;
          })}
        </div>
      </article>

      {/* Reactions Tray */}
      <div className="border-y border-neutral-100 py-4 mb-8 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-500">React to this entry:</span>
        <div className="flex gap-2.5">
          {emojiList.map((emoji) => {
            const active = userReacted.includes(emoji.key);
            const count = (reactions as any)[emoji.key] || 0;
            return (
              <button
                key={emoji.key}
                onClick={() => handleReact(emoji.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  active 
                    ? 'bg-neutral-950 border-neutral-950 text-white' 
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-950'
                }`}
              >
                <span>{emoji.symbol}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comments Hub */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-950 mb-6 flex items-center gap-2">
          Discussion ({comments.length})
        </h3>

        {/* Comment input form */}
        <div className="flex gap-4 mb-8">
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0 flex items-center justify-center font-bold text-xs text-neutral-500 select-none uppercase">
            U
          </div>
          <div className="flex-grow flex flex-col gap-2">
            <textarea
              className="input-field text-sm"
              rows={3}
              placeholder="What are your thoughts or questions?..."
              value={rootCommentInput}
              onChange={(e) => setRootCommentInput(e.target.value)}
            />
            <button
              onClick={() => handlePostComment(null)}
              disabled={commentSubmitting || !rootCommentInput.trim()}
              className="btn-primary self-end text-xs py-2"
            >
              <Send className="w-3.5 h-3.5" />
              Comment
            </button>
          </div>
        </div>

        {/* Comments Feed */}
        {commentsLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-200" />
          </div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-6 text-xs text-neutral-400">
            No comments yet. Start the conversation!
          </div>
        ) : (
          <div className="grid gap-6">
            {rootComments.map((comment) => (
              <CommentNode
                key={comment.id}
                comment={comment}
                allComments={comments}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                replyInputId={replyInputId}
                setReplyInputId={setReplyInputId}
                replyText={replyText}
                setReplyText={setReplyText}
                onAddReply={handlePostComment}
                onDelete={handleDeleteComment}
                commentSubmitting={commentSubmitting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-Component: Individual Comment Card with recursive reply threads
function CommentNode({
  comment, allComments, currentUserId, isAdmin, replyInputId,
  setReplyInputId, replyText, setReplyText, onAddReply, onDelete, commentSubmitting
}: {
  comment: Comment; allComments: Comment[]; currentUserId: string; isAdmin: boolean;
  replyInputId: string | null; setReplyInputId: (id: string | null) => void;
  replyText: string; setReplyText: (text: string) => void;
  onAddReply: (parentId: string) => void; onDelete: (id: string) => void;
  commentSubmitting: boolean;
}) {
  const childReplies = allComments.filter((c) => c.parent_id === comment.id);
  const isReplying = replyInputId === comment.id;
  const isOwner = comment.user_id === currentUserId;

  return (
    <div className="flex gap-3 text-sm group">
      <div className="w-7 h-7 rounded-full bg-neutral-100 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-neutral-500 uppercase border border-neutral-200/50">
        {comment.profiles?.name?.substring(0, 2) || 'EX'}
      </div>

      <div className="flex-grow">
        <div className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">
              {comment.profiles?.name || 'Explorer'}
            </span>
            {comment.profiles?.role === 'Admin' && (
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 rounded-full px-2 py-0.5">
                Admin
              </span>
            )}
          </div>
          <span className="text-[10px] text-neutral-400">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>

        <p className="text-neutral-700 text-xs md:text-sm leading-relaxed mb-2 whitespace-pre-line">
          {comment.content}
        </p>

        <div className="flex items-center gap-4 text-xs font-semibold text-neutral-400 mb-3">
          <button
            onClick={() => {
              if (isReplying) {
                setReplyInputId(null);
              } else {
                setReplyInputId(comment.id);
                setReplyText('');
              }
            }}
            className="hover:text-neutral-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            Reply
          </button>
          {(isOwner || isAdmin) && (
            <button
              onClick={() => onDelete(comment.id)}
              className="hover:text-red-500 flex items-center gap-1 transition-colors text-neutral-400 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}
        </div>

        {isReplying && (
          <div className="flex gap-3 mb-4 fade-in">
            <CornerDownRight className="w-4 h-4 text-neutral-300 mt-2 flex-shrink-0" />
            <div className="flex-grow flex flex-col gap-2">
              <textarea
                className="input-field text-xs"
                rows={2}
                placeholder={`Reply to ${comment.profiles?.name || 'explorer'}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex gap-2 self-end">
                <button
                  onClick={() => setReplyInputId(null)}
                  className="btn-secondary text-[10px] py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onAddReply(comment.id)}
                  disabled={commentSubmitting || !replyText.trim()}
                  className="btn-primary text-[10px] py-1.5 px-3"
                >
                  Post Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {childReplies.length > 0 && (
          <div className="pl-4 border-l border-neutral-100/70 mt-2 grid gap-4">
            {childReplies.map((reply) => (
              <CommentNode
                key={reply.id}
                comment={reply}
                allComments={allComments}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                replyInputId={replyInputId}
                setReplyInputId={setReplyInputId}
                replyText={replyText}
                setReplyText={setReplyText}
                onAddReply={onAddReply}
                onDelete={onDelete}
                commentSubmitting={commentSubmitting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
