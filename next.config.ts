import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ["pino", "pino-pretty"],
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
};

export default nextConfig;
