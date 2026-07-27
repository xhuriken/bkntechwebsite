import nodemailer from 'nodemailer';

/**
 * Serverless Contact Form API Handler
 * Handles form validation, honeypot spam protection, Cloudflare Turnstile token validation,
 * and sends email notifications via Nodemailer SMTP.
 */
export default async function handler(req, res) {
  // Enforce POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message, bkn_website_bot_trap, turnstile_token } = req.body;

    // 1. Honeypot Anti-Spam Check:
    // If the hidden trap input is filled, ignore the request and pretend it succeeded.
    if (bkn_website_bot_trap) {
      console.warn("Spam attempt caught via Honeypot trap.");
      return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    }

    // 2. Data Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    // 3. Cloudflare Turnstile CAPTCHA verification (if keys are configured)
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && turnstile_token) {
      try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(turnstile_token)}`
        });
        const verifyData = await response.json();
        if (!verifyData.success) {
          return res.status(400).json({ error: 'Security verification failed. Please try again.' });
        }
      } catch (err) {
        console.error('Turnstile connection error:', err);
        // Do not block in case of external service downtime, proceed with email
      }
    }

    // 4. Configure SMTP Transporter using environment variables
    if (!process.env.SMTP_PASS) {
      console.error("Missing SMTP_PASS environment variable.");
      return res.status(500).json({ error: 'Mail server configuration error.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'ssl0.ovh.net',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE !== 'false', // true by default (TLS port 465)
      auth: {
        user: process.env.SMTP_USER || 'contact@bkntech.fr',
        pass: process.env.SMTP_PASS
      }
    });

    // 5. Structure Email Content
    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER || 'contact@bkntech.fr'}>`,
      replyTo: email,
      to: process.env.SMTP_TO || 'contact@bkntech.fr',
      subject: `[BKN Tech - Contact] ${subject}`,
      text: `Nouveau message de contact BKN Tech :\n\nNom : ${name}\nEmail : ${email}\nSujet : ${subject}\n\nMessage :\n${message}`,
      html: `
        <div style="background-color: #0c0d12; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: left;">
          <div style="max-width: 560px; margin: 0 auto; background-color: #12131a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
            <!-- Brand Accent Line -->
            <div style="height: 4px; background: linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%);"></div>
            
            <div style="padding: 24px;">
              <!-- Logo / Brand -->
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #a78bfa; margin-bottom: 16px;">
                BKN Tech
              </div>

              <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em;">
                Nouveau message reçu sur bkntech.fr
              </h2>

              <!-- Details List -->
              <div style="border-top: 1px solid #27272a; border-bottom: 1px solid #27272a; padding: 12px 0; margin-bottom: 16px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #a1a1aa; width: 100px;">Expéditeur</td>
                    <td style="padding: 4px 0; font-size: 13px; font-weight: 500; color: #ffffff;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #a1a1aa;">E-mail</td>
                    <td style="padding: 4px 0; font-size: 13px; font-weight: 500; color: #a78bfa;">
                      <a href="mailto:${email}" style="color: #a78bfa; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #a1a1aa;">Sujet</td>
                    <td style="padding: 4px 0; font-size: 13px; font-weight: 500; color: #ffffff;">${subject}</td>
                  </tr>
                </table>
              </div>

              <!-- Message Blockquote -->
              <div style="font-size: 15px; line-height: 1.6; color: #e4e4e7; border-left: 2px solid #7c3aed; padding-left: 16px; margin: 0; white-space: pre-wrap; font-style: normal;">${message}</div>
            </div>
          </div>
        </div>
      `
    };

    // 6. Send Email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error("Mail send failure:", error);
    return res.status(500).json({ error: 'Internal server error. Failed to dispatch message.' });
  }
}
