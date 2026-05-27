import { createAdminClient } from './supabaseServer';
import nodemailer from 'nodemailer';

/**
 * Generates a random 6-digit OTP, saves it in the database with a 10-minute expiration,
 * and sends it via email (or logs it to the console in development/no-creds mode).
 */
export async function sendOTP(email: string): Promise<string> {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  const supabaseAdmin = createAdminClient();

  // Save the OTP in the 'otps' table
  const { error } = await supabaseAdmin.from('otps').insert({
    email,
    otp_code: otpCode,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error('Error saving OTP to database:', error);
    throw new Error('Could not initialize security verification');
  }

  // Print the OTP in a highly visible console block for easy development testing
  console.log('\n' + '='.repeat(60));
  console.log(`🔑 SECURITY ONE-TIME PASSWORD (OTP) FOR: ${email}`);
  console.log(`👉 CODE: ${otpCode}`);
  console.log(`⏳ VALID UNTIL: ${expiresAt.toLocaleString()}`);
  console.log('='.repeat(60) + '\n');

  // Attempt to send email
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const emailFrom = process.env.EMAIL_FROM || 'auth@portfolio.datthasashank.com';

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '465'),
        secure: smtpPort === '465',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Dattha Portfolio Auth" <${emailFrom}>`,
        to: email,
        subject: `${otpCode} is your portfolio access verification code`,
        text: `Your verification code is ${otpCode}. It is valid for 10 minutes.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <h2 style="color: #111; font-weight: 600; margin-bottom: 20px;">Verification Code</h2>
            <p style="color: #666; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">
              You recently signed in with Google. To complete authentication, please enter the following 6-digit verification code.
            </p>
            <div style="background-color: #f5f5f7; border-radius: 12px; padding: 15px 30px; text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #000;">${otpCode}</span>
            </div>
            <p style="color: #999; font-size: 12px; line-height: 1.5;">
              This code will expire in 10 minutes. If you did not request this code, please ignore this email.
            </p>
          </div>
        `,
      });
      console.log(`✉️ OTP email successfully sent to ${email}`);
    } else {
      console.log('💡 Note: SMTP credentials not fully configured. Using terminal console logging for OTP delivery.');
    }
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    // We don't crash, we let the user use the console logged code to proceed
  }

  return otpCode;
}
