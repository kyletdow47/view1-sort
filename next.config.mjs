import withPWAInit from '@ducanh2912/next-pwa'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

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

const isAnalyze = process.env.ANALYZE === 'true'

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},

  // Only for `npm run analyze`: allow the build to complete even if pre-existing
  // TypeScript or lint errors remain, so the bundle report can still be captured.
  // Production builds keep the default (fail on type errors).
  typescript: {
    ignoreBuildErrors: isAnalyze,
  },
  eslint: {
    ignoreDuringBuilds: isAnalyze,
  },

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
      {
        // Demo gallery placeholder images
        protocol: 'https',
        hostname: 'picsum.photos',
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

export default withBundleAnalyzer(withPWA(nextConfig))
