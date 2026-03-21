import { redirect } from 'next/navigation';

export default function Home() {
  // We use server-side redirect instead of client-side.
  // Middleware handles the deep auth logic, but if they land here and are unauthenticated,
  // middleware lets them through (it's public). So we just bounce them to /login if they hit the page component.
  redirect('/login');
}
