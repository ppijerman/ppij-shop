/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pg"],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};
export default nextConfig;
