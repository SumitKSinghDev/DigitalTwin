import nodemailer from 'nodemailer';

/**
 * Service to dispatch verification OTP codes.
 * Connects to the user's SMTP settings. If credentials are missing or connection fails,
 * it outputs a beautiful, styled console block with the OTP so development remains seamless.
 */
export const sendOtpEmail = async (email, otpCode, name = 'Student') => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const sender = process.env.SMTP_SENDER || `"Digital Twin" <${user}>`;

  // Dynamic styled terminal fallback logger
  const logFallbackConsole = () => {
    console.log('\n====================================================');
    console.log('      🚀 DIGITAL TWIN INTERNAL AUTH DISPATCHER      ');
    console.log('====================================================');
    console.log(` Target User : ${name} (${email})`);
    console.log(` OTP Code   : \x1b[36m\x1b[1m  ${otpCode}  \x1b[0m`);
    console.log(` Expiry Time: 10 minutes (${new Date(Date.now() + 10*60*1000).toLocaleTimeString()})`);
    console.log('====================================================');
    console.log(' [TIP] Copy this 6-digit OTP code directly to verify.');
    console.log('====================================================\n');
  };

  // Check if SMTP is configured
  if (!user || !pass) {
    console.log(' [SMTP Config Check] Missing SMTP credentials in .env. Falling back to console log.');
    logFallbackConsole();
    return { success: true, fallback: true };
  }

  try {
    console.log("SMTP IPv4 transport initialized");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: sender,
      to: email,
      subject: `🔑 Verify Your Digital Twin Core Code: ${otpCode}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Digital Twin Core</title>
          <style>
            body {
              background-color: #0b0f19;
              color: #f3f4f6;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.95));
              border: 1px solid #1f2937;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.1);
            }
            .header {
              background: linear-gradient(90deg, #6366f1, #8b5cf6);
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 800;
              letter-spacing: 1px;
              color: #ffffff;
              text-transform: uppercase;
            }
            .content {
              padding: 40px 30px;
              line-height: 1.6;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #e5e7eb;
            }
            .instructions {
              color: #9ca3af;
              font-size: 15px;
              margin-bottom: 30px;
            }
            .otp-container {
              text-align: center;
              margin: 30px 0;
            }
            .otp-box {
              display: inline-block;
              background: rgba(99, 102, 241, 0.1);
              border: 2px solid #6366f1;
              color: #818cf8;
              font-size: 36px;
              font-weight: 800;
              letter-spacing: 8px;
              padding: 15px 30px;
              border-radius: 12px;
              box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
              text-shadow: 0 0 8px rgba(129, 140, 248, 0.5);
            }
            .timer {
              text-align: center;
              font-size: 13px;
              color: #ef4444;
              margin-top: 10px;
              font-weight: 500;
            }
            .footer {
              padding: 20px;
              border-top: 1px solid #1f2937;
              text-align: center;
              font-size: 12px;
              color: #4b5563;
              background-color: rgba(17, 24, 39, 0.5);
            }
            .footer a {
              color: #6366f1;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Digital Twin Core</h1>
            </div>
            <div class="content">
              <div class="greeting">Hello, ${name}!</div>
              <div class="instructions">
                You have initiated the core synchronization sequence for your intelligent <strong>Student Digital Twin</strong>. Use the authorization passcode below to verify your email address and activate your twin state.
              </div>
              <div class="otp-container">
                <div class="otp-box">${otpCode}</div>
                <div class="timer">⏳ This verification code expires in 10 minutes</div>
              </div>
              <div class="instructions" style="margin-top: 30px; font-size: 13px;">
                If you did not initiate this request, you can safely ignore this email. Your core password credentials remain encrypted and secure.
              </div>
            </div>
            <div class="footer">
              ⚡ Intelligent telemetry powered by Digital Twin for Students.<br>
              Need help? Contact support or reply to this email.
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP Dispatch Success] Email verification OTP dispatched to ${email}. ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP Connection Error] Failed to dispatch email. Details: ${error.message}`);
    console.log('>>> Falling back to local console representation.');
    logFallbackConsole();
    return { success: true, fallback: true, error: error.message };
  }
};
