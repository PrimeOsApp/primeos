import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import base44 from '@base44/vite-plugin'

const normalizeBasePath = (value) => {
  if (!value || value === '/') return '/'
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

const basePath = normalizeBasePath(process.env.VITE_BASE_PATH)

export default defineConfig({
  base: basePath,
  plugins: [react(), base44()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
