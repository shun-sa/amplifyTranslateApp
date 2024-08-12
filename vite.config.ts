import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {  
    port: 8080,  // ここを追加
    strictPort: true // ここを追加
  },
  define: {
    global: 'window',
  },
})
