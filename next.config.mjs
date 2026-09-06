/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      // Vercel Blob gives each store a random subdomain like
      // "lyvg1cbmqfvg3380.public.blob.vercel-storage.com" — the wildcard
      // matches any store under the same account, not just the one live now
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;