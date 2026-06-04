import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: ['supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  
  experimental: {
    typedRoutes: true,
  },
  
  transpilePackages: ['lucide-react'],
};

export default nextConfig;
