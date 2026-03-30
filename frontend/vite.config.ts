import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    emptyOutDir: true,
    
    chunkSizeWarningLimit: 800,
    
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('@tiptap/react') ||
            id.includes('@tiptap/starter-kit') ||
            id.includes('@tiptap/extension-underline')
          ) {
            return 'editor'
          }

          if (id.includes('lucide-react')) {
            return 'icons'
          }

          if (
            id.includes('react-router-dom') ||
            id.includes('react-dom') ||
            id.includes('react')
          ) {
            return 'vendor'
          }
        }
      }
    }
  }
})