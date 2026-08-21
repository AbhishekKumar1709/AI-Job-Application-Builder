import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) dynamically imports a worker module at
  // runtime; letting the bundler trace/inline it breaks that resolution,
  // so it needs to stay a plain external require() against node_modules.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
