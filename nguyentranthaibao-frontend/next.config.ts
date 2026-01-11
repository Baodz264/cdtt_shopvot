import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["localhost"], // Cho phép load ảnh từ localhost
  },
};

export default nextConfig;
