const { test, expect } = require('@playwright/test');
const LoginPage = require('../features/pages/loginPage');
const HomePage = require('../features/pages/homePage');
const CartPage = require('../features/pages/cartPage');
const { getDemoCredentials } = require('../features/support/credentials');

test('Pom test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  const { username, password } = getDemoCredentials();
  await loginPage.login(username, password);

  const homePage = new HomePage(page);
  await homePage.addProductToCart('Samsung galaxy s6');
  await page.waitForTimeout(2000);
  await homePage.goToCart();

  const cartPage = new CartPage(page);
  await page.waitForTimeout(2000);
  const exists = await cartPage.checkProductInCart('Samsung galaxy s6');
  expect(exists).toBeTruthy();
});
