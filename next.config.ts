import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  poweredByHeader: false,
  devIndicators: false,
  images: { deviceSizes: [192, 320, 416, 624], imageSizes: [] },
};
export default nextConfig;
