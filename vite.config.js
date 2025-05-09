import { defineConfig } from 'vite';
export default defineConfig({
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