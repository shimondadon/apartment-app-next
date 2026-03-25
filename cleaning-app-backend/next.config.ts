import type { NextConfig } from 'next';

/** Vercel: preview גם עם NODE_ENV=production — רק production מקבל Origin ספציפי. מקומי: לפי NODE_ENV (next start מול next dev). */
const useProductionCors =
  process.env.VERCEL_ENV === 'production' ||
  (process.env.VERCEL_ENV == null && process.env.NODE_ENV === 'production');

const corsHeadersProduction = [
  { key: 'Access-Control-Allow-Origin', value: 'https://apartment-app-kohl.vercel.app' },
  { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
  { key: 'Access-Control-Allow-Credentials', value: 'true' },
] as const;

const corsHeadersDevelopment = [
  { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
  { key: 'Access-Control-Allow-Credentials', value: 'true' },
  {
    key: 'Access-Control-Allow-Headers',
    value: 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
  },
  { key: 'Access-Control-Allow-Origin', value: '*' },
] as const;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [...(useProductionCors ? corsHeadersProduction : corsHeadersDevelopment)],
      },
    ];
  },
};

export default nextConfig;
