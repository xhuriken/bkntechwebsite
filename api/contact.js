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
        <div style="font-family: 'Inter', sans-serif; background-color: #0d0e16; padding: 30px; color: #e3e1ed; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid rgba(190, 194, 255, 0.15);">
          <h2 style="font-family: 'Space Grotesk', sans-serif; color: #bec2ff; font-size: 20px; border-bottom: 1px solid rgba(190, 194, 255, 0.1); padding-bottom: 15px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">
            Nouveau message reçu
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 6px 0; color: #ababcf; font-size: 13px; width: 80px;"><strong>Expéditeur :</strong></td>
              <td style="padding: 6px 0; color: #e3e1ed; font-size: 13px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #ababcf; font-size: 13px;"><strong>E-mail :</strong></td>
              <td style="padding: 6px 0; color: #bec2ff; font-size: 13px;"><a href="mailto:${email}" style="color: #bec2ff; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #ababcf; font-size: 13px;"><strong>Sujet :</strong></td>
              <td style="padding: 6px 0; color: #e3e1ed; font-size: 13px;">${subject}</td>
            </tr>
          </table>
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(190, 194, 255, 0.1); padding: 20px; border-radius: 8px; margin-top: 25px; border-left: 3px solid #bec2ff;">
            <p style="white-space: pre-wrap; margin: 0; font-size: 14px; line-height: 1.6; color: #e3e1ed;">${message}</p>
          </div>
          <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #ababcf; letter-spacing: 0.05em; text-transform: uppercase;">
            BKN Tech Mailer — Généré Automatiquement
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
