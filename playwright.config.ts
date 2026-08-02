import { defineConfig } from '@playwright/test'

const PORT = 4174

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/*.test.ts'],
  timeout: 45_000,
  fullyParallel: true,
  workers: 3,
  reporter: [['list']],
  use: {
    // vite base is '/glsl/' (SPEC §5)
    baseURL: `http://localhost:${PORT}/glsl/`,
    viewport: { width: 900, height: 900 },
    deviceScaleFactor: 1,
    launchOptions: {
      args: [
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
    },
  },
  webServer: {
    command: `bunx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/glsl/`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
