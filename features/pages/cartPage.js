class CartPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      cartBody: '#tbodyid',
      productNames: 'xpath=//tbody[@id="tbodyid"]/tr/td[2]'
    };
  }

  async waitForCart() {
    await this.page.waitForSelector(this.selectors.cartBody, { timeout: 15000 });
  }

  async getCartText() {
    await this.waitForCart();
    return await this.page.textContent(this.selectors.cartBody);
  }

  async checkProductInCart(productName) {
    const products = this.page.locator(this.selectors.productNames);
    const count = await products.count();
    for (let i = 0; i < count; i++) {
      const name = (await products.nth(i).textContent()).trim();
      if (name === productName) return true;
    }
    return false;
  }
}

module.exports = CartPage;
