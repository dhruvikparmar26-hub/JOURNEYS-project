import nodemailer from 'nodemailer';

/**
 * Create the mail transporter
 * In development (when SMTP is not configured), logs to console as fallback
 */
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.example.com') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null; // No transporter — will log to console
};

/**
 * Send an email (or log it in development)
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n📧 ═══════════ EMAIL (dev mode) ═══════════');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body:\n${html.replace(/<[^>]*>/g, '').trim()}`);
    console.log('═══════════════════════════════════════════\n');
    return { messageId: 'dev-mode-' + Date.now() };
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@journeys.app',
    to,
    subject,
    html,
  });
};

/**
 * JOURNEYS email wrapper styles
 */
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #0B0E14; font-family: 'Inter', -apple-system, system-ui, sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #141924; border: 1px solid #242B3A; border-radius: 16px; padding: 40px 32px; }
    .logo { font-size: 20px; font-weight: 700; margin-bottom: 32px; }
    .logo-text { color: #F5F6F8; }
    .logo-accent { color: #F2A93B; }
    h1 { color: #F5F6F8; font-size: 22px; font-weight: 700; margin: 0 0 12px; }
    p { color: #9AA1AF; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background-color: #F2A93B; color: #0B0E14; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; margin: 8px 0 24px; }
    .code { display: inline-block; background-color: #1B2230; border: 1px solid #242B3A; border-radius: 10px; padding: 16px 28px; font-size: 28px; font-weight: 700; letter-spacing: 0.15em; color: #F2A93B; margin: 8px 0 24px; }
    .footer { color: #5C6470; font-size: 12px; text-align: center; margin-top: 24px; }
    .footer a { color: #4A7CF6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">JOUR</span><span class="logo-accent">NEYS</span>
      </div>
      ${content}
    </div>
    <p class="footer">
      This email was sent by <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">JOURNEYS</a>.
      If you didn't request this, you can safely ignore it.
    </p>
  </div>
</body>
</html>
`;

/**
 * Send verification email
 */
export const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5180'}/verify-email?token=${token}`;

  await sendEmail({
    to,
    subject: 'Verify your JOURNEYS account',
    html: emailWrapper(`
      <h1>Verify your email</h1>
      <p>Welcome to JOURNEYS! Click the button below to verify your email address and start planning your next adventure.</p>
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      <p>This link expires in 15 minutes. If you didn't create an account, you can safely ignore this email.</p>
    `),
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5180'}/reset-password?token=${token}`;

  await sendEmail({
    to,
    subject: 'Reset your JOURNEYS password',
    html: emailWrapper(`
      <h1>Reset your password</h1>
      <p>We received a request to reset your password. Click the button below to set a new one.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p>This link expires in 15 minutes. If you didn't request a password reset, your account is still secure — no action is needed.</p>
    `),
  });
};

export default sendEmail;
