class LoginPage {
  constructor(page) {
    this.page = page;
    // locators
    this.selectors = {
      loginLink: '#login2',
      usernameInput: '#loginusername',
      passwordInput: '#loginpassword',
      loginButtonXpath: '//button[normalize-space()="Log in"]'
    };
  }

  async goto() {
    await this.page.goto('https://demoblaze.com/index.html', { waitUntil: 'load' });
  }

  async openLoginModal() {
    await this.page.click(this.selectors.loginLink);
    await this.page.waitForSelector(this.selectors.usernameInput, { timeout: 15000 });
  }

  async submitCredentials(username, password) {
    await this.page.fill(this.selectors.usernameInput, username);
    await this.page.fill(this.selectors.passwordInput, password);
    await this.page.click(`xpath=${this.selectors.loginButtonXpath}`);
  }

  async login(username, password) {
    await this.openLoginModal();
    await this.submitCredentials(username, password);
  }
}

module.exports = LoginPage;
