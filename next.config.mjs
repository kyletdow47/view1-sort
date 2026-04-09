import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},

  // Prevent Next.js from trying to bundle native Node modules used by
  // @xenova/transformers (onnxruntime-node, sharp). The CLIP model runs
  // entirely in the browser via ONNX Runtime WebAssembly inside a Web Worker.
  serverExternalPackages: ['sharp', 'onnxruntime-node'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Webpack config — used for production builds (Turbopack handles dev).
  // Ensures the Web Worker bundle can use @xenova/transformers without
  // Node.js-only modules being pulled in.
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve = config.resolve ?? {}
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
}

export default withPWA(nextConfig)
