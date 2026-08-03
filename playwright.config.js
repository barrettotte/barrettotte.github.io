const { defineConfig, devices } = require('@playwright/test');

const hugo = process.env.HUGO || 'hugo';

module.exports = defineConfig({
  testDir: './tests/ui',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:1313',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `${hugo} server --bind 127.0.0.1 --port 1313 --disableFastRender --noHTTPCache`,
    url: 'http://127.0.0.1:1313',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
