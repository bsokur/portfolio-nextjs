import type { ImageLoaderProps } from 'next/image';

// These widths match next.config.ts and scripts/optimize-portrait.mjs.
const portraitWidths = [192, 320, 416, 624];

export default function portraitLoader({ width }: ImageLoaderProps): string {
  // Next also probes the intrinsic width in development; cap that probe at
  // the largest generated asset. Configured srcset widths resolve exactly.
  const variant = portraitWidths.find((candidate) => candidate >= width) ?? portraitWidths[portraitWidths.length - 1];
  return `/images/portrait-${variant}.webp`;
}
