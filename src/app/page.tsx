
import { redirect } from 'next/navigation';

// This is a server component that redirects to the login page.
export default async function RootPage() {
  redirect('/login');
}
