/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Completely disable SWC tracing
  experimental: {
    disableOptimizedLoading: true,
  },
  
  // Disable all webpack stats and logging
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable all logging
      config.infrastructureLogging = {
        level: 'error',
      }
      config.stats = false
      
      // Disable source maps completely
      config.devtool = false
      
      // Disable caching
      config.cache = false
    }
    
    return config
  },
  
  // Disable features that cause file writes
  compress: false,
  cleanDistDir: false, // Don't clean to avoid permission issues
  
  // Compiler settings
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Disable image optimization
  images: {
    unoptimized: true,
  },
}

export default nextConfig