import { defineConfig, devices } from '@playwright/test'

const preview = process.env.PLAYWRIGHT_PREVIEW === '1'
const baseURL = `http://127.0.0.1:${preview ? 4173 : 5173}`

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    channel: 'chrome',
  },
  webServer: {
    command: preview ? 'npm run preview -- --host 127.0.0.1' : 'npm run dev -- --host 127.0.0.1',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
