import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ["pino", "pino-pretty"],
};

export default nextConfig;
