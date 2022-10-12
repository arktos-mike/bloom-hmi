import { rmSync } from 'fs'
import { join } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import pkg from './package.json'

rmSync(join(__dirname, 'dist'), { recursive: true, force: true }) // v14.14.0

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
      'styles': join(__dirname, 'src/assets/styles'),
    },
  },
  css: {
    // CSS Pre -processor
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@border-radius-base': '10px',
          '@border-width-base': '2px',
          '@border-radius-sm': '3px',
          '@tabs-title-font-size-sm':' @font-size-lg',
          '@tabs-bar-margin': '0 0 @margin-xs 0',
          '@disabled-bg': '@white',
          '@disabled-active-bg': '@white',
          '@segmented-bg': 'fade(@black, 15%)',
          '@segmented-hover-bg': 'fade(@black, 30%)',
          '@segmented-selected-bg': '@primary-color',
          '@segmented-label-color': '@white',
          '@segmented-label-hover-color': '@white',
          '@avatar-group-overlapping': '-20px',
          '@avatar-group-space': '5px',
          '@avatar-group-border-color': '#ffffff3f'
        },
      },
    },
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            sourcemap: false,
            outDir: 'dist/electron/main',
          },
        },
      },
      preload: {
        input: {
          // You can configure multiple preload scripts here
          index: join(__dirname, 'electron/preload/index.ts'),
        },
        vite: {
          build: {
            // For debug
            sourcemap: 'inline',
            outDir: 'dist/electron/preload',
          }
        },
      },
      // Enables use of Node.js API in the Electron-Renderer
      renderer: {},
    }),
  ],
  server: {
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT,
  },
})
