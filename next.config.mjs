/** @type {import('next').NextConfig} */

// const customHeaders = [
//   "Accept", "Accept-Version", "Content-Length",
//   "Content-MD5", "Content-Type", "Date", "X-Api-Version",
//   "X-CSRF-Token", "X-Requested-With",
// ];

const nextConfig = {
  // headers: () => {
  //   return [
  //     {
	//       source: "/api/(.*)",
  //       headers: [
	//         { key: "Access-Control-Allow-Credentials", value: "true" },
  //         { key: "Access-Control-Allow-Origin", value: "https://app.acme.local:3001" },
  //         { key: "Access-Control-Allow-Methods", value: "GET,POST" },
  //         { key: "Access-Control-Allow-Headers", value: customHeaders.join(", ") }
	//       ]
  //     }
  //   ]
  // },
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
