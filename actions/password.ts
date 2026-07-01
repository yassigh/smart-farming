// actions/password.ts - VERSION CORRIGÉE
'use server';

import { UtilisateurModel } from "@/models/utilisateur";
import { comparePassword, generateResetToken, verifyResetToken } from "@/models/utilisateur";
import { sendPasswordResetEmail } from "@/lib/email";
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// ✅ TYPE POUR LES RÉPONSES
export type PasswordActionResponse = {
  success: boolean;
  error?: string;
  message?: string;
  requiresTwoFactor?: boolean;
  data?: any;
};

// ============================================
// 1. 🔐 FORGOT PASSWORD - DEMANDE
// ============================================
export async function requestPasswordReset(email: string): Promise<PasswordActionResponse> {
  try {
    const user = await UtilisateurModel.getByEmail(email);
    if (!user) {
      return { 
        success: false, 
        error: "Aucun compte trouvé avec cet email." 
      };
    }

    const token = generateResetToken(email);
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await UtilisateurModel.setResetToken(email, token, expiry);

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    const emailResult = await sendPasswordResetEmail(email, resetLink);
    
    if (!emailResult.success) {
      return { 
        success: false, 
        error: "Erreur lors de l'envoi de l'email." 
      };
    }

    return { 
      success: true, 
      message: "Un email de réinitialisation a été envoyé." 
    };
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    return { 
      success: false, 
      error: "Erreur serveur." 
    };
  }
}

// ============================================
// 2. 🔐 FORGOT PASSWORD - RÉINITIALISATION
// ============================================
export async function resetPassword(token: string, newPassword: string): Promise<PasswordActionResponse> {
  try {
    const user = await UtilisateurModel.findByResetToken(token);
    if (!user) {
      return { 
        success: false, 
        error: "Token invalide ou expiré." 
      };
    }

    const decoded = verifyResetToken(token);
    if (!decoded || decoded.email !== user.email) {
      return { 
        success: false, 
        error: "Token invalide." 
      };
    }

    await UtilisateurModel.update(user.id, { motDePasse: newPassword });
    await UtilisateurModel.clearResetToken(user.email);

    revalidatePath('/login');
    
    return { 
      success: true, 
      message: "Mot de passe réinitialisé avec succès !" 
    };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return { 
      success: false, 
      error: "Erreur lors de la réinitialisation." 
    };
  }
}

// ============================================
// 3. 🔐 ACTIVATION 2FA
// ============================================
export async function generateTwoFactorSecret(userId: number): Promise<PasswordActionResponse> {
  try {
    const user = await UtilisateurModel.getById(userId);
    if (!user) {
      return { success: false, error: "Utilisateur non trouvé." };
    }

    const secret = speakeasy.generateSecret({
      name: `SMART-FARM (${user.email})`,
      length: 20,
    });

    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url!);

    return { 
      success: true, 
      data: {
        secret: secret.base32,
        qrCode: qrCodeDataURL,
      }
    };
  } catch (error) {
    console.error('Error generating 2FA secret:', error);
    return { success: false, error: "Erreur lors de la génération du QR Code." };
  }
}

export async function verifyAndEnableTwoFactor(userId: number, secret: string, token: string): Promise<PasswordActionResponse> {
  try {
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1,
    });

    if (!verified) {
      return { success: false, error: "Code 2FA invalide." };
    }

    await UtilisateurModel.enableTwoFactor(userId, secret);

    return { success: true, message: "2FA activé avec succès !" };
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return { success: false, error: "Erreur lors de l'activation du 2FA." };
  }
}

export async function disableTwoFactor(userId: number): Promise<PasswordActionResponse> {
  try {
    await UtilisateurModel.disableTwoFactor(userId);
    return { success: true, message: "2FA désactivé." };
  } catch (error) {
    return { success: false, error: "Erreur lors de la désactivation." };
  }
}

// ============================================
// 4. 🔐 LOGIN AVEC 2FA
// ============================================
export async function loginWithTwoFactor(
  email: string, 
  password: string, 
  twoFactorToken?: string
): Promise<PasswordActionResponse> {
  try {
    const user = await UtilisateurModel.getByEmail(email);
    if (!user) {
      return { success: false, error: "Email ou mot de passe incorrect." };
    }

    const passwordMatch = await comparePassword(password, user.motDePasse);
    if (!passwordMatch) {
      return { success: false, error: "Email ou mot de passe incorrect." };
    }

    // ✅ Vérification twoFactorEnabled
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        return { 
          success: false, 
          requiresTwoFactor: true,
          message: "Code 2FA requis." 
        };
      }

      // ✅ Vérifier que twoFactorSecret n'est pas null
      if (!user.twoFactorSecret) {
        return { success: false, error: "2FA mal configuré." };
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 1,
      });

      if (!verified) {
        return { success: false, error: "Code 2FA invalide." };
      }
    }

    // Créer la session
    const cookieStore = await cookies();
    cookieStore.set("session_user_id", user.id.toString(), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { 
      success: true, 
      data: { 
        user: { id: user.id, email: user.email, role: user.role } 
      } 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: "Erreur lors de la connexion." };
  }
}

// ============================================
// 5. 🔐 VÉRIFICATION 2FA EXISTANT
// ============================================
export async function checkTwoFactorStatus(userId: number): Promise<PasswordActionResponse> {
  try {
    const user = await UtilisateurModel.getById(userId);
    if (!user) {
      return { success: false, error: "Utilisateur non trouvé." };
    }

    return { 
      success: true, 
      data: {
        enabled: user.twoFactorEnabled || false,
      }
    };
  } catch (error) {
    return { success: false, error: "Erreur lors de la vérification." };
  }
}