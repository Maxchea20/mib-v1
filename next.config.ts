import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  allowedDevOrigins: [
    "172.20.10.4",
  ],

  // FFmpeg is a ready-made program file: it must be used from node_modules as it is,
  // not rewritten by the bundler (which breaks its path).
  serverExternalPackages: ["ffmpeg-static"],

  outputFileTracingIncludes: {
    "/api/video/quick": [
      "./node_modules/ffmpeg-static/ffmpeg",
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
  },
};

export default nextConfig;