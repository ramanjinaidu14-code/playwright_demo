const { AllureRuntime, CucumberJSAllureFormatter } = require('allure-cucumberjs');

module.exports = class AllureReporter extends CucumberJSAllureFormatter {
  constructor(options) {
    super(options, new AllureRuntime({ resultsDir: 'allure-results' }), {
      labels: [],
      links: [],
    });
  }
};
