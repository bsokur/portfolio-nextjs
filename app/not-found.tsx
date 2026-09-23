import Link from 'next/link';
import { profile } from '@/lib/profile';

export default function NotFound() {
  return <main className="site-shell not-found"><p className="eyebrow">404</p><h1>Page not found.</h1><p className="bio">This page may have moved, or the link may be incorrect.</p><p><Link className="text-link" href="/">Back to {profile.name}’s portfolio <span aria-hidden="true">→</span></Link></p></main>;
}
