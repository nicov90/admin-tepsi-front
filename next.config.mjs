/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "www.grupotepsi.com" },
      { hostname: "tailus.io" },
      { hostname: "tepsicloud.blob.core.windows.net" }
    ]
  },
  redirects: () => {
    return [
      {
        source: "/",
        destination: "/inicio",
        permanent: true,
      },
    ];
  },
  experimental: {
    missingSuspenseWithCSRBailout: false, // error searchParams build
  },
};

export default nextConfig;
