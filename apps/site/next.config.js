/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.blackbird.xyz",
        port: "",
        pathname: "/**",
      },
    ],
  },
};
