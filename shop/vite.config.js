import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// proxy 与管理台 frontend/vite.config.js 完全同一套：/api 转发到网关。
const apiProxy = {
  '/api': {
    target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
};

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        about: fileURLToPath(new URL('./about.html', import.meta.url)),
        models: fileURLToPath(new URL('./models.html', import.meta.url)),
      },
    },
  },
  server: {
    // 5173 被管理台 frontend/ 占用，C 端商城用 5174，两个 dev server 可并行。
    port: 5174,
    strictPort: true,
    proxy: apiProxy,
    // cloudflared 隧道演示：访客经 *.trycloudflare.com 访问本机 dev server，
    // Vite 默认只放行 localhost 域名的 Host 头，必须显式允许，否则全部 403。
    allowedHosts: ['.trycloudflare.com'],
  },
  preview: {
    port: 5174,
    strictPort: true,
    proxy: apiProxy,
  },
});
