# Playwright BDD UI

Browser UI automation for the Demoblaze e-commerce site, implemented in JavaScript with Playwright. The repository supports both Gherkin-based BDD scenarios through Cucumber and conventional Playwright Test specs. Both paths can publish results to Allure.

## Requirements

- Node.js and npm
- Network access to install npm dependencies and reach `https://demoblaze.com`
- A browser installed through Playwright (Chromium is used by the Cucumber World)

## Setup

From the project root:

```powershell
npm install
npx playwright install chromium
```

To install all browsers supported by Playwright instead, run `npx playwright install`.

## Project Layout

```text
features/
	ecommerace.feature             Gherkin scenario(s)
	pages/                         Page Object Model classes
	step_definitions/              Cucumber step implementations
	support/
		world.js                     Browser lifecycle, World, and failure screenshot hook
		allure-reporter.js           Cucumber-to-Allure formatter adapter
tests/
	ecommerace.spec.js             Playwright Test version of the e-commerce flow
tools/
	send_report.js                 Zip and email the generated Allure report
cucumber.js                      Default Cucumber CLI configuration
playwright.config.js             Playwright Test and Allure configuration
package.json                     Dependencies and npm scripts
allure-results/                  Raw Allure result files
allure-report/                   Generated HTML report
test-artifacts/                  Screenshots captured for failed Cucumber scenarios
test-results/                    Playwright Test output
```

## Test Paths

### Cucumber BDD

The current feature is in `features/ecommerace.feature`. It describes a user opening Demoblaze, logging in, adding the Samsung Galaxy S6, navigating to the cart, and verifying the product is present.

Steps are implemented in `features/step_definitions/ecom.steps.js`. They use the page objects under `features/pages/`:

- `loginPage.js` opens the site and performs login.
- `homePage.js` opens a product, adds it to the cart, accepts the browser dialog, and navigates to the cart.
- `cartPage.js` finds and checks product names in the cart.

The custom World in `features/support/world.js` launches Chromium for each scenario, creates a browser context and page, and closes the browser afterward. It captures a full-page screenshot into `test-artifacts/` when a scenario fails. Its `headful` setting is supplied through Cucumber's world parameters.

Run the non-manual scenarios headlessly:

```powershell
npm test
```

Run non-manual scenarios with a visible browser:

```powershell
npm run test:headed
```

Run scenarios tagged `@manual` with a visible browser:

```powershell
npm run test:manual
```

The login scenarios require `DEMO_USERNAME` and `DEMO_PASSWORD` in the process environment. In PowerShell, set them for the current terminal before running tests:

```powershell
$env:DEMO_USERNAME = "your-test-user"
$env:DEMO_PASSWORD = "your-test-password"
npm run test:manual
```

Do not put real credentials in feature files, source code, reports, or committed files. Rotate any credentials that were previously committed or shared.

The standard and headed commands exclude `@manual`; the manual command selects only `@manual`. Each command includes the Allure formatter, so the feature and its individual Gherkin step outcomes are written to `allure-results/`.

### Playwright Test

`tests/ecommerace.spec.js` performs the same shopping flow using `@playwright/test`. Playwright Test settings are in `playwright.config.js`: tests are discovered under `tests/`, the timeout is 30 seconds, retries are enabled once, and the Allure reporter is configured alongside the list reporter.

Run the configured Playwright Test suite:

```powershell
npm run pw:test:allure
```

Or run the existing spec directly:

```powershell
npx playwright test tests/ecommerace.spec.js
```

## Allure Reports

Both test frameworks write raw results to the shared `allure-results/` directory. Generate or refresh the static HTML report with:

```powershell
npm run pw:allure:generate
```

Open the report in a browser with:

```powershell
npm run pw:allure:open
```

The generated report entry page is `allure-report/index.html`. Since both frameworks share the results directory, a report can include results from both. Old result files can remain between runs; when an isolated report is needed, clear `allure-results/` before running the desired test command, then generate the report. Keep `allure-report/` and `allure-results/` out of source control unless the team intentionally stores report artifacts.

## Emailing the Report

`tools/send_report.js` creates `allure-report.zip` and emails it as an attachment. Generate the report first. The script prompts for missing recipient email, SMTP host, SMTP port, and SMTP username. The port defaults to `587`. The SMTP password is not prompted for because terminal input could expose it; set `SMTP_PASS` in the environment instead. Do not put credentials in the script or commit them.

PowerShell example (enter actual values locally; do not commit them):

```powershell
$env:SMTP_HOST = "smtp.example.com"
$env:SMTP_PORT = "587"
$env:SMTP_USER = "automation@example.com"
$env:SMTP_PASS = "your-local-secret"
node tools/send_report.js
```

Set `RECIPIENT` to skip the recipient prompt, or pass it as the first command-line argument. `SMTP_HOST` and `SMTP_USER` can also be set to skip their prompts.

## Required Inputs and Prompt Templates

### Inputs to Prepare

- Test execution: network access to Demoblaze and a Playwright-installed Chromium browser.
- Login scenario: set `DEMO_USERNAME` and `DEMO_PASSWORD` in the environment or a secret store. The test reads these values at runtime and the Gherkin step does not include credentials.
- Allure generation: raw result files in `allure-results/`. Run at least one test command before generating a report.
- Email delivery: recipient email, SMTP host, SMTP username, SMTP password, and optionally SMTP port. The helper prompts for the non-secret values when missing; provide `SMTP_PASS` through the environment.

### Prompt to Add a BDD Scenario

Use this prompt when asking an AI assistant to extend the BDD suite:

```text
Add a Cucumber BDD scenario to this Playwright project.
User outcome: <describe the behavior to verify>
Preconditions and test data: <describe required state and data; use environment variables for secrets>
Expected result: <describe observable pass criteria>
Constraints: follow the existing Gherkin, step-definition, Page Object Model, and CustomWorld patterns.
Update or add the feature, step definitions, and page objects only as needed.
Include negative and boundary cases where relevant, and do not hard-code credentials or tokens.
Run the relevant test and report the exact command and outcome.
```

### Prompt to Diagnose a Failed Scenario

```text
Diagnose the failing Cucumber scenario using its Allure step statuses, error message, screenshot, and the related step definition/page object.
Identify the first failing step and the most likely root cause.
Make the smallest behavior-correct change, preserve existing project patterns, then rerun the focused scenario and regenerate the Allure report.
Do not report success unless the validation command passes; summarize any remaining failure.
```

### Prompt to Generate and Share a Report

```text
Run the requested Cucumber or Playwright test command, generate the Allure HTML report from the resulting allure-results, and summarize passed/failed scenarios and steps.
Before emailing or sharing the report, check that it does not expose credentials, tokens, personal data, or other secrets.
```

## Configuration Notes

- `cucumber.js` defines the default Cucumber support-code paths and progress formatter. The npm Cucumber scripts explicitly configure the Allure formatter as well.
- `playwright.config.js` configures the Playwright Test runner and `allure-playwright` reporter.
- `features/support/allure-reporter.js` adapts `allure-cucumberjs` to Cucumber and writes to `allure-results/`.
- Cucumber step timeout is set to 60 seconds in `features/support/world.js`.
- The cart assertion retries its product lookup for a short period to accommodate the asynchronous add-to-cart flow.

## Known Issues and Security

- `npm run pw:test` runs the Playwright spec directly; `npm run pw:test:allure` runs the configured Playwright Test suite with its reporters.
- Keep `DEMO_USERNAME`, `DEMO_PASSWORD`, and SMTP credentials out of source control. Allure results/reports can include historic test data, so inspect them before sharing.
- The report email helper prompts for non-secret configuration only. `SMTP_PASS` must be provided through the environment and is intentionally not requested interactively.
- These tests depend on an external website. Site availability, network conditions, bot checks, and changes to the site's UI can affect results independently of local code changes.
