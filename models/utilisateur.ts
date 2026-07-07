import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface CreateUtilisateurInput {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  role: Role;
  image?: string;
}

//  Fonctions de hachage
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return await compare(password, hashed);
}

//  Génération de token JWT
export function generateResetToken(email: string): string {
  return jwt.sign(
    { email, purpose: 'reset-password' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export function verifyResetToken(token: string): { email: string } | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return { email: decoded.email };
  } catch {
    return null;
  }
}

export const UtilisateurModel = {
  async getAll() {
    return await db.utilisateur.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: number) {
    return await db.utilisateur.findUnique({
      where: { id },
    });
  },

  async getByEmail(email: string) {
    return await db.utilisateur.findUnique({
      where: { email },
    });
  },

  async create(data: CreateUtilisateurInput) {
    const hashedPassword = await hashPassword(data.motDePasse);
    return await db.utilisateur.create({
      data: {
        ...data,
        motDePasse: hashedPassword,
      },
    });
  },

  async update(id: number, data: Partial<CreateUtilisateurInput>) {
    const updateData: any = { ...data };
    if (data.motDePasse) {
      updateData.motDePasse = await hashPassword(data.motDePasse);
    }
    return await db.utilisateur.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(id: number) {
    return await db.utilisateur.delete({
      where: { id },
    });
  },

  //  Nouveaux : 2FA
  async enableTwoFactor(userId: number, secret: string) {
    return await db.utilisateur.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });
  },

  async disableTwoFactor(userId: number) {
    return await db.utilisateur.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });
  },

  //  Nouveaux : Reset Password
  async setResetToken(email: string, token: string, expiry: Date) {
    return await db.utilisateur.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });
  },

  async clearResetToken(email: string) {
    return await db.utilisateur.update({
      where: { email },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  },

  async findByResetToken(token: string) {
    return await db.utilisateur.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });
  },
};