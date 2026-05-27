'use client';

import { useRouter } from 'next/navigation';
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

interface BlogReaderClientProps {
  blog: Blog;
  isAdmin: boolean;
  currentUserId: string;
}

export default function BlogReaderClient({ blog, isAdmin, currentUserId }: BlogReaderClientProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/blog?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/?tab=personal');
        router.refresh();
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
    }
  };

  return (
    <BlogReader
      blog={blog}
      isAdmin={isAdmin}
      currentUserId={currentUserId}
      onBack={() => router.push('/?tab=personal')}
      onEdit={() => router.push('/?tab=personal')} // Edits are handled directly inside the Personal tab
      onDelete={handleDelete}
    />
  );
}
