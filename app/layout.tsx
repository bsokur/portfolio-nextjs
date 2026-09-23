import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { profile } from '@/lib/profile';
import { siteDescription, siteTitle, siteUrl } from '@/lib/site';
import './globals.css';

const geist = localFont({ src: '../public/fonts/geist.woff2', variable: '--font-geist', display: 'swap', weight: '100 900' });

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: siteTitle,
  description: siteDescription,
  authors: [{ name: profile.name }],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: profile.name,
    url: siteUrl,
    type: 'website',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: siteTitle, description: siteDescription },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={geist.variable} data-scroll-behavior="smooth"><body>{children}</body></html>;
}
