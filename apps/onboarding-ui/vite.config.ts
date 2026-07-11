import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { contributionApiPlugin } from './src/features/issues/contributionApiPlugin.ts'
import { contentPlugin, quizContributionAliasPlugin } from './vite.devApiPlugin.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const toolRoot = path.resolve(__dirname, '../..')
const uiRoot = __dirname

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    quizContributionAliasPlugin(uiRoot),
    contentPlugin(toolRoot),
    contributionApiPlugin(toolRoot),
  ],
  resolve: {
    alias: {
      '@': path.resolve(uiRoot, './src'),
      '@content': path.resolve(toolRoot, 'content'),
    },
  },
  server: {
    port: 4310,
    fs: {
      allow: [toolRoot],
    },
  },
  preview: {
    port: 4310,
  },
})
