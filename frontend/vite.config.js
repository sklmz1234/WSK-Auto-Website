import { defineConfig } from 'vite';

const apiProxy = {
  '/api': {
    target: process.env.WSK_API_PROXY_TARGET || 'http://127.0.0.1:18090',
    changeOrigin: true,
  },
};

export default defineConfig({
  server: {
    port: 15173,
    strictPort: true,
    proxy: apiProxy,
  },
  preview: {
    port: 15173,
    strictPort: true,
    proxy: apiProxy,
  },
});
