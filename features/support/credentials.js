function getDemoCredentials() {
  const { DEMO_USERNAME: username, DEMO_PASSWORD: password } = process.env;
  if (!username || !password) {
    throw new Error('Set DEMO_USERNAME and DEMO_PASSWORD in the environment before running the e-commerce tests.');
  }
  return { username, password };
}

module.exports = { getDemoCredentials };
