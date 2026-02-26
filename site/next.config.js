/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/kernel-testbed',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
