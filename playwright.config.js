const config = {
  testDir: 'tests',
  timeout: 30 * 1000,
  retries: 1,
  reporter: [
    ['list'],
    ['allure-playwright']
  ],
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }
};

module.exports = config;
