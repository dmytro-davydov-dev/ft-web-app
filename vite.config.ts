import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // loadEnv with prefix '' loads ALL env vars (including non-VITE_ ones).
  // API_PROXY_TARGET is intentionally not prefixed with VITE_ so it is never
  // bundled into the client build — it's server/config-time only.
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.API_PROXY_TARGET ?? '';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      // Proxy /api/* to the Cloud Run backend during local dev so the browser
      // never makes cross-origin requests (eliminates CORS errors).
      // VITE_API_BASE_URL must be empty (or unset) for this to work — the
      // client then sends relative paths that Vite intercepts here.
      ...(proxyTarget
        ? {
            proxy: {
              '/api': {
                target: proxyTarget,
                changeOrigin: true,
                secure: true,
              },
            },
          }
        : {}),
    },
  };
});
