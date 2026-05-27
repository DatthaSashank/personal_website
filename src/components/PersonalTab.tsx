'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, Image as ImageIcon, MessageSquare, Loader2 
} from 'lucide-react';
import BlogReader from './BlogReader';

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface PersonalTabProps {
  isAdmin: boolean;
  currentUserId: string;
}

const GALLERY_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80', title: 'Modular Architecture planning' },
  { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80', title: 'IDE setup, late night refactoring' },
  { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80', title: 'Productivity workstation setup' },
  { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80', title: 'AI node connectivity experiment' },
];

export default function PersonalTab({ isAdmin, currentUserId }: PersonalTabProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBlog, setActiveBlog] = useState<Blog | null>(null);
  
  // CMS states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState('');

  // Lightbox state
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blog');
      if (res.ok) {
        const result = await res.json();
        if (result.success) setBlogs(result.data);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditBlog(null);
    setFormTitle('');
    setFormSlug('');
    setFormExcerpt('');
    setFormContent('');
    setFormImageUrl('');
    setFormStatus('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (blog: Blog, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditBlog(blog);
    setFormTitle(blog.title);
    setFormSlug(blog.slug);
    setFormExcerpt(blog.excerpt);
    setFormContent(blog.content);
    setFormImageUrl(blog.image_url || '');
    setFormStatus('');
    setIsFormOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('Saving...');

    const payload = {
      id: editBlog?.id,
      title: formTitle,
      slug: formSlug,
      excerpt: formExcerpt,
      content: formContent,
      image_url: formImageUrl || null,
    };

    try {
      const method = editBlog ? 'PUT' : 'POST';
      const res = await fetch('/api/blog', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setFormStatus('Saved successfully!');
        setIsFormOpen(false);
        fetchBlogs();
        if (activeBlog && activeBlog.id === editBlog?.id) {
          setActiveBlog(result.data);
        }
      } else {
        setFormStatus(`Error: ${result.error || 'Failed to save post'}`);
      }
    } catch (err) {
      setFormStatus('Network error. Try again.');
    }
  };

  const handleDeleteBlog = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const res = await fetch(`/api/blog?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBlogs();
        if (activeBlog && activeBlog.id === id) setActiveBlog(null);
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
    }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto">
      {activeBlog ? (
        <BlogReader 
          blog={activeBlog} 
          onBack={() => setActiveBlog(null)} 
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onDelete={handleDeleteBlog}
          onEdit={(blog) => {
            // Trigger edit state and modal
            setEditBlog(blog);
            setFormTitle(blog.title);
            setFormSlug(blog.slug);
            setFormExcerpt(blog.excerpt);
            setFormContent(blog.content);
            setFormImageUrl(blog.image_url || '');
            setFormStatus('');
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-1">
                Writing & Snapshots
              </h1>
              <p className="text-neutral-500 text-sm">
                Medium-style logs and personal documentation.
              </p>
            </div>
            {isAdmin && (
              <button onClick={handleOpenCreate} className="btn-primary">
                <Plus className="w-4 h-4" />
                Write Post
              </button>
            )}
          </div>

          {/* Dynamic Image Gallery */}
          <div className="mb-12">
            <h2 className="text-lg font-medium text-neutral-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              Snapshot Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GALLERY_IMAGES.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className="aspect-square relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-neutral-100 bg-neutral-100"
                >
                  <img 
                    src={img.url} 
                    alt={img.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-[11px] text-white font-medium truncate">{img.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blogs list */}
          <div>
            <h2 className="text-lg font-medium text-neutral-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Journal Entries
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="glass-card text-center p-8 border-neutral-100 text-neutral-500">
                No entries found.
              </div>
            ) : (
              <div className="grid gap-6">
                {blogs.map((blog) => (
                  <div 
                    key={blog.id} 
                    onClick={() => setActiveBlog(blog)}
                    className="glass-card border-neutral-100/70 p-6 flex flex-col md:flex-row gap-6 cursor-pointer"
                  >
                    {blog.image_url && (
                      <div className="w-full md:w-44 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 border border-neutral-100">
                        <img src={blog.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                            {blog.title}
                          </h3>
                          {isAdmin && (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button 
                                onClick={(e) => handleOpenEdit(blog, e)}
                                className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteBlog(blog.id, e)}
                                className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-100 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-neutral-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {blog.excerpt || blog.content.substring(0, 120) + '...'}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-neutral-400">
                        {new Date(blog.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Write/Edit Blog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                {editBlog ? 'Edit Journal Entry' : 'Create Gated Entry'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formStatus && (
              <div className="mb-4 p-3 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl">
                {formStatus}
              </div>
            )}

            <form onSubmit={handleSaveBlog} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-600 mb-1 block">Title</label>
                <input 
                  className="input-field" 
                  value={formTitle} 
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (!editBlog) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                    }
                  }} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">Slug</label>
                  <input className="input-field" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">Image URL (Optional)</label>
                  <input className="input-field" placeholder="https://..." value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 mb-1 block">Short Excerpt</label>
                <textarea className="input-field" rows={2} value={formExcerpt} onChange={(e) => setFormExcerpt(e.target.value)} required />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 mb-1 block">Full Rich Content</label>
                <textarea className="input-field font-mono text-xs" rows={10} value={formContent} onChange={(e) => setFormContent(e.target.value)} required />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Publish Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox for Snapshots */}
      {activeImage && (
        <div 
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button className="absolute top-4 right-4 text-white hover:text-neutral-300 w-10 h-10 flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <img src={activeImage.url} alt={activeImage.title} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
            <p className="text-white/80 text-sm text-center font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">{activeImage.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
