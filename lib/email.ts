// lib/email.ts
import nodemailer from 'nodemailer';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// URL de base pour les logos (à adapter selon votre hébergement)
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Génère le template email moderne avec logo
 */
function getEmailTemplate(
  title: string,
  content: string,
  buttonText?: string,
  buttonLink?: string,
  footerMessage?: string
) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f0e8;
      line-height: 1.6;
      color: #29453E;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(41, 69, 62, 0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #29453E 0%, #3C6C5F 100%);
      padding: 40px 40px 30px;
      text-align: center;
      position: relative;
    }
    .header-logo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      padding: 16px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    .header-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .header p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      margin-top: 4px;
      font-weight: 400;
    }
    .content {
      padding: 40px 40px 32px;
    }
    .content h2 {
      font-size: 20px;
      font-weight: 600;
      color: #29453E;
      margin-bottom: 12px;
    }
    .content p {
      color: #4a5f5a;
      font-size: 15px;
      margin-bottom: 16px;
    }
    .content .highlight-box {
      background: #f8f5f0;
      border-left: 4px solid #3C6C5F;
      padding: 16px 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .content .highlight-box p {
      margin: 0;
      font-size: 14px;
      color: #29453E;
    }
    .button {
      display: inline-block;
      padding: 14px 36px;
      background: linear-gradient(135deg, #3C6C5F 0%, #29453E 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(60, 108, 95, 0.25);
      margin: 8px 0 16px;
      border: none;
      cursor: pointer;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(60, 108, 95, 0.35);
    }
    .divider {
      height: 1px;
      background: #e8e3dc;
      margin: 24px 0;
    }
    .footer {
      padding: 24px 40px 32px;
      background: #faf8f6;
      text-align: center;
      border-top: 1px solid #e8e3dc;
    }
    .footer p {
      font-size: 13px;
      color: #8a9b96;
      margin: 4px 0;
    }
    .footer a {
      color: #3C6C5F;
      text-decoration: none;
      font-weight: 500;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .social-links {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin: 12px 0 8px;
    }
    .social-links a {
      display: inline-block;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #e8e3dc;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s;
    }
    .social-links a:hover {
      background: #d5cec4;
    }
    .badge {
      display: inline-block;
      background: rgba(60, 108, 95, 0.1);
      color: #3C6C5F;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .text-muted {
      color: #8a9b96;
      font-size: 13px;
    }
    @media (max-width: 480px) {
      .container { margin: 16px; border-radius: 16px; }
      .header { padding: 30px 20px 24px; }
      .content { padding: 28px 20px 24px; }
      .footer { padding: 20px 20px 24px; }
      .header-logo { width: 64px; height: 64px; padding: 12px; }
      .button { display: block; text-align: center; padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header avec logo -->
    <div class="header">
      <div class="header-logo">
       <Image
                         src="/logo.png"
                         alt="Smart Farming"
                         width={isCollapsed ? 40 : 48}
                         height={isCollapsed ? 40 : 48}
                         className="object-contain"
                         priority
                       />
      </div>
      <h1>SMART-FARM</h1>
      <p>Solutions agricoles intelligentes</p>
      <span class="badge" style="display:inline-block;background:rgba(255,255,255,0.15);color:#ffffff;font-size:11px;font-weight:600;padding:4px 14px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;margin-top:8px;border:1px solid rgba(255,255,255,0.1);">
         Sécurisé
      </span>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>${title}</h2>
      ${content}
      ${buttonText && buttonLink ? `
        <div style="text-align: center; margin: 24px 0 8px;">
          <a href="${buttonLink}" class="button">${buttonText}</a>
        </div>
      ` : ''}
      ${footerMessage ? `
        <div class="highlight-box">
          <p> ${footerMessage}</p>
        </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        <strong>SMART-FARM</strong> · Gestion agricole intelligente
      </p>
      <p class="text-muted" style="margin-top:4px;">
        © ${new Date().getFullYear()} SMART-FARM. Tous droits réservés.
      </p>
      <p class="text-muted" style="font-size:12px;margin-top:8px;">
        Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
      </p>
      <div style="margin-top:12px;">
        <a href="${BASE_URL}" style="color:#3C6C5F;text-decoration:none;font-size:13px;font-weight:500;">Visiter le site</a>
        <span style="color:#d5cec4;margin:0 8px;">·</span>
        <a href="${BASE_URL}/contact" style="color:#3C6C5F;text-decoration:none;font-size:13px;font-weight:500;">Nous contacter</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const content = `
    <p>Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte SMART-FARM.</p>
    <p style="margin-bottom: 8px;">Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
  `;

  const mailOptions = {
    from: `"SMART-FARM" <${process.env.SMTP_USER}>`,
    to: email,
    subject: ' Réinitialisation de votre mot de passe SMART-FARM',
    html: getEmailTemplate(
      'Réinitialisation de mot de passe',
      content,
      'Réinitialiser mon mot de passe',
      resetLink,
      'Ce lien expire dans 1 heure et ne peut être utilisé qu\'une seule fois.'
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de réinitialisation envoyé à ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error: 'Impossible d\'envoyer l\'email' };
  }
}

/**
 * Envoie un email de confirmation pour le 2FA
 */
export async function sendTwoFactorEmail(email: string, code: string) {
  const content = `
    <p>Voici votre code de vérification pour vous connecter à votre compte SMART-FARM :</p>
    <div style="background: #f0f4f2; padding: 20px; text-align: center; font-size: 36px; letter-spacing: 12px; font-weight: 700; border-radius: 12px; color: #29453E; font-family: 'Courier New', monospace; margin: 16px 0;">
      ${code}
    </div>
    <p style="font-size: 14px; color: #4a5f5a;">Ce code expire dans <strong>5 minutes</strong>.</p>
    <p style="font-size: 13px; color: #8a9b96; margin-top: 8px;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
  `;

  const mailOptions = {
    from: `"SMART-FARM" <${process.env.SMTP_USER}>`,
    to: email,
    subject: ' Code de vérification 2FA - SMART-FARM',
    html: getEmailTemplate(
      'Code de vérification 2FA',
      content,
      undefined,
      undefined,
      'Ce code est à usage unique et expire dans 5 minutes.'
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(` Email 2FA envoyé à ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Erreur 2FA email:', error);
    return { success: false };
  }
}

/**
 * Envoie un email de bienvenue
 */
export async function sendWelcomeEmail(email: string, firstName: string) {
  const content = `
    <p>Bonjour <strong>${firstName}</strong>,</p>
    <p>Bienvenue sur <strong>SMART-FARM</strong> ! Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
    <p>Découvrez dès maintenant comment notre plateforme peut vous aider à :</p>
    <ul style="color:#4a5f5a;padding-left:20px;margin:12px 0;">
      <li> Gérer vos fermes et terrains</li>
      <li> Suivre vos animaux et cultures</li>
      <li> Bénéficier de prédictions IA</li>
      <li> Optimiser vos rendements</li>
    </ul>
    <p style="margin-top: 16px;">Commencez dès maintenant à explorer votre tableau de bord.</p>
  `;

  const mailOptions = {
    from: `"SMART-FARM" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Bienvenue sur SMART-FARM !',
    html: getEmailTemplate(
      'Bienvenue sur SMART-FARM',
      content,
      'Accéder à mon compte',
      `${process.env.NEXTAUTH_URL}/dashboard`,
      'Connectez-vous pour découvrir toutes nos fonctionnalités.'
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de bienvenue envoyé à ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Erreur email de bienvenue:', error);
    return { success: false };
  }
}

/**
 * Envoie une notification générique
 */
export async function sendNotificationEmail(
  email: string,
  subject: string,
  title: string,
  content: string,
  buttonText?: string,
  buttonLink?: string
) {
  const mailOptions = {
    from: `"SMART-FARM" <${process.env.SMTP_USER}>`,
    to: email,
    subject: subject,
    html: getEmailTemplate(
      title,
      content,
      buttonText,
      buttonLink
    ),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de notification envoyé à ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Erreur email de notification:', error);
    return { success: false };
  }
}