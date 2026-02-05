/// <reference types="vitest/config" />
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

export default defineConfig({
  root: './playground',
  plugins: [vue()],
  test: {
    root: '.',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
    },
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
  },
})
