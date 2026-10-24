const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');
const nodemailer = require('nodemailer');

async function promptIfMissing(value, label, defaultValue) {
  if (value) return value;

  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = (await prompt.question(`${label}${suffix}: `)).trim();
  prompt.close();
  return answer || defaultValue;
}

async function main() {
  const recipient = await promptIfMissing(process.env.RECIPIENT || process.argv[2], 'Recipient email');
  if (!recipient) {
    console.error('Recipient email is required. Set RECIPIENT or pass it as the first argument.');
    process.exit(1);
  }

  const reportDir = path.resolve(process.cwd(), 'allure-report');
  if (!fs.existsSync(reportDir)) {
    console.error('allure-report directory not found. Run `npx allure generate allure-results -o allure-report` first.');
    process.exit(1);
  }

  const zipPath = path.resolve(process.cwd(), 'allure-report.zip');

  try {
    // Use PowerShell Compress-Archive on Windows
    if (process.platform === 'win32') {
      const cmd = `powershell -Command "Compress-Archive -Path '${reportDir.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force"`;
      execSync(cmd, { stdio: 'inherit' });
    } else {
      // Unix: use zip if available
      execSync(`zip -r -q ${zipPath} ./${path.relative(process.cwd(), reportDir)}`);
    }
  } catch (e) {
    console.error('Failed to create zip:', e.message);
    process.exit(1);
  }

  const smtpHost = await promptIfMissing(process.env.SMTP_HOST, 'SMTP host');
  const smtpPort = await promptIfMissing(process.env.SMTP_PORT, 'SMTP port', '587');
  const smtpUser = await promptIfMissing(process.env.SMTP_USER, 'SMTP username');
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('SMTP host, username, and SMTP_PASS are required. Set SMTP_PASS in the environment; it is not prompted to avoid echoing a secret.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: smtpPort == 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const info = await transporter.sendMail({
    from: smtpUser,
    to: recipient,
    subject: 'Allure report',
    text: 'Attached Allure report (zip).',
    attachments: [{ filename: path.basename(zipPath), path: zipPath }],
  });

  console.log('Email sent:', info.messageId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
