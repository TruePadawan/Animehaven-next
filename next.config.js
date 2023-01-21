/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	staticPageGenerationTimeout: 100,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "bkpyhkkjvgzfjojacrka.supabase.co",
			},
			{
				protocol: "https",
				hostname: "cdn.myanimelist.net",
				pathname: "/images/anime/**",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
		],
	},
};

module.exports = nextConfig;
