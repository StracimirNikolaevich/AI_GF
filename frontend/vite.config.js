import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:3456',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:3456',
        ws: true,
      },
      '/load_file': {
        target: 'http://127.0.0.1:3456',
        changeOrigin: true,
      },
      '/uploaded_files': {
        target: 'http://127.0.0.1:3456',
        changeOrigin: true,
      },
      '/vrm': {
        target: 'http://127.0.0.1:3456',
        changeOrigin: true,
      },
      '/tool_temp': {
        target: 'http://127.0.0.1:3456',
        changeOrigin: true,
      },
      '/ext': {
        target: 'http://127.0.0.1:3456',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:3456',
        changeOrigin: true,
      },
      '/llm_models': {
        target: 'http://127.0.0.1:3456',
        changeOrigin: true,
      },
    }
  }
})
