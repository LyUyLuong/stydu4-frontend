import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /api/v1 to the local backend so the FE can use the same relative
    // base URL in dev as in prod (no env var swap needed).
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  esbuild: {
    // Strip console.log/info/debug AND debugger statements from production
    // builds so they don't leak request URLs / payloads in the browser console.
    // console.warn / console.error are kept on purpose — those are real signals
    // we want to see in prod (e.g. via a logging service later).
    // Only applied when running `vite build`; `vite dev` keeps everything.
    drop: ['debugger'],
    pure: ['console.log', 'console.info', 'console.debug', 'console.trace'],
  },
})
