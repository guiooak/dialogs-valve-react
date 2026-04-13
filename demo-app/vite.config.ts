import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: '/dialogs-valve-react/',
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@dialogs-valve/react': path.resolve(__dirname, '../src/index.ts'),
    },
  },
})
