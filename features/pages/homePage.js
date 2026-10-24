class HomePage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      productLink: '#tbodyid h4 a',
      addToCartBtn: 'a:has-text("Add to cart")',
      cartLink: '#cartur'
    };
  }

  async openProduct(productName) {
    const product = this.page.locator(this.selectors.productLink, { hasText: productName }).first();
    await product.scrollIntoViewIfNeeded();
    await product.click();
  }

  async addToCartAcceptDialog() {
    this.page.once('dialog', async (dialog) => {
      try { await dialog.accept(); } catch (e) { }
    });
    await this.page.click(this.selectors.addToCartBtn);
  }

  async addProductToCart(productName) {
    await this.openProduct(productName);
    await this.page.waitForSelector(this.selectors.addToCartBtn, { timeout: 15000 });
    await this.addToCartAcceptDialog();
    await this.page.waitForTimeout(1000);
  }

  async goToCart() {
    await this.page.click(this.selectors.cartLink);
    await this.page.waitForLoadState('load');
  }
}

module.exports = HomePage;
