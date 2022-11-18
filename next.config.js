/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bkpyhkkjvgzfjojacrka.supabase.co"
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/images/anime/**"
      }
    ]
  }
}

module.exports = nextConfig
