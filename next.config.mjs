const extraAllowedOrigins = (process.env.ALLOWED_DEV_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const allowedDevOrigins = Array.from(
  new Set(["localhost", "127.0.0.1", "::1", ...extraAllowedOrigins])
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
};

export default nextConfig;
