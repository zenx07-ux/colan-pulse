import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@elastic/eui',
      '@elastic/eui-theme-borealis',
      '@emotion/react',
      '@emotion/css',
    ],
  },
})
