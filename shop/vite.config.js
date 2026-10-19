import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// proxy 与管理台 frontend/vite.config.js 完全同一套：/api 转发到网关。
const apiProxy = {
  '/api': {
    target: process.env.WSK_API_PROXY_TARGET || 'http://127.0.0.1:18090',
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
        purchase: fileURLToPath(new URL('./purchase.html', import.meta.url)),
      },
    },
  },
  server: {
    // WSK 官网专用端口，冲突即退出。
    port: 15174,
    strictPort: true,
    proxy: apiProxy,
    // cloudflared 隧道演示：访客经 *.trycloudflare.com 访问本机 dev server，
    // Vite 默认只放行 localhost 域名的 Host 头，必须显式允许，否则全部 403。
    allowedHosts: ['.trycloudflare.com'],
  },
  preview: {
    port: 15174,
    strictPort: true,
    proxy: apiProxy,
  },
});
