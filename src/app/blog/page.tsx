import { redirect } from 'next/navigation';

export default function BlogIndexRedirect() {
  redirect('/?tab=personal');
}
