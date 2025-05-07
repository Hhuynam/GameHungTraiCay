import { defineConfig } from 'vite';
export default defineConfig({
  root: 'MainGame', // Đặt thư mục MainGame làm thư mục gốc cho Vite
  server: {
    port: 3000,
    host: true,
    hot: true
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    outDir: '../dist' // Build ra ngoài thư mục dist
  }
});