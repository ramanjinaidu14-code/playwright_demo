const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const LoginPage = require('../pages/loginPage');
const HomePage = require('../pages/homePage');
const CartPage = require('../pages/cartPage');
const { getDemoCredentials } = require('../support/credentials');

Given('I open demoblaze', async function () {
  this.loginPage = new LoginPage(this.page);
  this.homePage = new HomePage(this.page);
  this.cartPage = new CartPage(this.page);
  await this.loginPage.goto();
});

When('I login with configured credentials', async function () {
  const { username, password } = getDemoCredentials();
  await this.loginPage.login(username, password);
});

When('I add product {string} to the cart', async function (productName) {
  await this.homePage.addProductToCart(productName);
});

When('I go to the cart', async function () {
  await this.homePage.goToCart();
});

Then('I see product {string} in the cart', async function (productName) {
  // retry a few times because the add-to-cart flow can be async
  const maxAttempts = 5;
  let exists = false;
  for (let i = 0; i < maxAttempts; i++) {
    exists = await this.cartPage.checkProductInCart(productName);
    if (exists) break;
    await this.page.waitForTimeout(1000);
  }
  assert.ok(exists, `expected cart to include "${productName}"`);
});
