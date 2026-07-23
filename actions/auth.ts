// actions/auth.ts - VERSION FINALE
'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel, CreateUtilisateurInput, comparePassword } from "@/models/utilisateur";

//  Importer depuis password.ts
import {
  requestPasswordReset as _requestPasswordReset,
  resetPassword as _resetPassword,
  generateTwoFactorSecret as _generateTwoFactorSecret,
  verifyAndEnableTwoFactor as _verifyAndEnableTwoFactor,
  disableTwoFactor as _disableTwoFactor,
  loginWithTwoFactor as _loginWithTwoFactor,
  checkTwoFactorStatus as _checkTwoFactorStatus
} from "./password";

export type LoginResponse = {
  success: boolean;
  error?: string;
  requiresTwoFactor?: boolean;
  data?: {
    user: {
      id: number;
      email: string;
      role: string;
    }
  };
};

export type AuthActionResponse = {
  success: boolean;
  error?: string;
};

//  Toutes les fonctions exportées sont async

// Authentification
export async function getConnectedUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  if (!userId) return null;
  return await UtilisateurModel.getById(Number(userId));
}

export async function loginAction(email: string, motDePasse: string): Promise<LoginResponse> {
  try {
    const user = await UtilisateurModel.getByEmail(email);
    if (!user) {
      return { success: false, error: "Email ou mot de passe incorrect." };
    }

    const passwordMatch = await comparePassword(motDePasse, user.motDePasse);
    if (!passwordMatch) {
      return { success: false, error: "Email ou mot de passe incorrect." };
    }

    if (user.twoFactorEnabled) {
      return { 
        success: false, 
        error: "2FA activé. Utilisez la connexion avec 2FA.",
        requiresTwoFactor: true,
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("session_user_id", user.id.toString(), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (error) {
    console.error("Error in loginAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la connexion." };
  }
}

export async function registerAction(data: CreateUtilisateurInput): Promise<AuthActionResponse> {
  try {
    const existingUser = await UtilisateurModel.getByEmail(data.email);
    if (existingUser) {
      return { success: false, error: "Un compte avec cet email existe déjà." };
    }

    const newUser = await UtilisateurModel.create(data);
    
    const cookieStore = await cookies();
    cookieStore.set("session_user_id", newUser.id.toString(), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (error) {
    console.error("Error in registerAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la création du compte." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session_user_id");
  redirect("/login");
}

//  Réexporter les fonctions de password.ts (toutes async)
export async function requestPasswordReset(email: string) {
  return _requestPasswordReset(email);
}

export async function resetPassword(token: string, newPassword: string) {
  return _resetPassword(token, newPassword);
}

export async function generateTwoFactorSecret(userId: number) {
  return _generateTwoFactorSecret(userId);
}

export async function verifyAndEnableTwoFactor(userId: number, secret: string, token: string) {
  return _verifyAndEnableTwoFactor(userId, secret, token);
}

export async function disableTwoFactor(userId: number) {
  return _disableTwoFactor(userId);
}

export async function loginWithTwoFactor(email: string, password: string, twoFactorToken?: string) {
  return _loginWithTwoFactor(email, password, twoFactorToken);
}

export async function checkTwoFactorStatus(userId: number) {
  return _checkTwoFactorStatus(userId);
}