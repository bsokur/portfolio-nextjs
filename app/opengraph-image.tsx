import { ImageResponse } from 'next/og';
import { profile } from '@/lib/profile';

export const dynamic = 'force-static';
export const alt = `${profile.name} — ${profile.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', padding: 80, background: '#ffffff', color: '#1c2027', borderBottom: '16px solid #315dde' }}>
      <div style={{ display: 'flex', color: '#626974', fontSize: 24, marginBottom: 44 }}>{profile.location}</div>
      <div style={{ display: 'flex', fontSize: 70, fontWeight: 700, letterSpacing: -3 }}>{profile.name}</div>
      <div style={{ display: 'flex', color: '#315dde', fontSize: 30, marginTop: 24 }}>{profile.headline}</div>
      <div style={{ display: 'flex', color: '#626974', fontSize: 24, marginTop: 48 }}>{profile.technologies.join(' / ')}</div>
    </div>,
    size,
  );
}
