const { setWorldConstructor, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

class CustomWorld {
  constructor(options) {
    this.parameters = options.parameters || {};
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init() {
    const headful = !!this.parameters.headful;
    this.browser = await chromium.launch({ headless: !headful });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async close() {
    if (this.browser) await this.browser.close();
    this.browser = null;
  }
}

setWorldConstructor(CustomWorld);

// Increase default step timeout to allow headful retry when sites present bot checks
setDefaultTimeout(60 * 1000);

Before(async function () {
  await this.init();
});

const fs = require('fs');
const path = require('path');

After(async function ({ result }) {
  try {
    if (result && result.status === 'FAILED' && this.page) {
      const outDir = path.resolve(process.cwd(), 'test-artifacts');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const file = path.join(outDir, `screenshot-${Date.now()}.png`);
      await this.page.screenshot({ path: file, fullPage: true });
    }
  } catch (e) {
    // ignore screenshot errors
  }

  await this.close();
});
