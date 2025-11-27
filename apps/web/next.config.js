import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    experimental: {
        turbo: {
            root: path.resolve(__dirname, "../../"),
        },
    },
    async rewrites() {
        const INVENTORY_URL = process.env.INVENTORY_URL || "http://localhost:3001";
        const ANALYTICS_URL = process.env.ANALYTICS_URL || "http://localhost:3002";

        return [
            {
                source: "/inventory",
                destination: `${INVENTORY_URL}/inventory`,
            },
            {
                source: "/inventory/:path*",
                destination: `${INVENTORY_URL}/inventory/:path*`,
            },
            {
                source: "/analytics",
                destination: `${ANALYTICS_URL}/analytics`,
            },
            {
                source: "/analytics/:path*",
                destination: `${ANALYTICS_URL}/analytics/:path*`,
            },
        ];
    },
};

export default nextConfig;
