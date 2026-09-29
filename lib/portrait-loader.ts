import type { ImageLoaderProps } from 'next/image';

// Keep in sync with next.config.ts and scripts/optimize-portrait.mjs.
const portraitWidths = [192, 320, 416, 624];

export default function portraitLoader({ width }: ImageLoaderProps): string {
  const variant =
    portraitWidths.find((candidate) => candidate >= width) ??
    portraitWidths[portraitWidths.length - 1];
  // The query prevents Next's same-URL loader warning for the largest variant.
  return `/images/portrait-${variant}.webp?w=${variant}`;
}
