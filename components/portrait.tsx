'use client';

import Image from 'next/image';
import portraitLoader from '@/lib/portrait-loader';

type PortraitProps = {
  alt: string;
  className?: string;
};

export function Portrait({ alt, className = 'intro-portrait' }: PortraitProps) {
  return <Image
    className={className}
    src="/images/portrait-624.webp"
    loader={portraitLoader}
    alt={alt}
    width={832}
    height={1144}
    sizes="(max-width: 47.99rem) 96px, (max-width: 63.99rem) 160px, 208px"
    loading="eager"
    fetchPriority="high"
  />;
}
