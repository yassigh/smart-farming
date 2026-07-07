// actions/presence.ts

"use server";

import { PresenceModel } from "@/models/presence";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { StatutPresence } from "@prisma/client";
import { notifyAllSystemUsers, getUserFullName } from "./notification";
import { db } from "@/lib/db";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  workedDays?: Record<number, number>;
};

/**
 * Save or update presence for a user at a given date.
 */
export async function savePresenceAction(
  data: {
    userId: number;
    date: string;
    statut: StatutPresence;
    paye: boolean;
  },
  acteurId?: number
): Promise<ActionResponse> {
  try {
    if (!data.userId || !data.date || !data.statut) {
      return { success: false, error: "Tous les paramètres requis ne sont pas fournis." };
    }

    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
      return { success: false, error: "Date invalide." };
    }

    const updated = await PresenceModel.savePresence(
      data.userId,
      parsedDate,
      data.statut,
      data.paye
    );

    const userDetails = await db.utilisateur.findUnique({
      where: { id: data.userId },
      select: { nom: true, prenom: true }
    });
    const userName = userDetails ? `${userDetails.prenom} ${userDetails.nom}` : "un employé";

    const resolvedActeurId = acteurId || data.userId;
    const acteurNom = resolvedActeurId ? await getUserFullName(resolvedActeurId) : undefined;
    await notifyAllSystemUsers(
      "📅 Présence mise à jour",
      `La présence de ${userName} a été mise à jour (${data.statut}).`,
      acteurNom
    );

    revalidatePath("/dashboard/presences");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error in savePresenceAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la sauvegarde de la présence."
    };
  }
}

/**
 * Handle certificate upload and link it to the presence record.
 */
export async function uploadCertificatAction(formData: FormData): Promise<ActionResponse> {
  try {
    const presenceIdStr = formData.get("presenceId") as string;
    const file = formData.get("certificat") as File;

    if (!presenceIdStr || !file) {
      return { success: false, error: "Tous les paramètres (ID et certificat) sont requis." };
    }

    const presenceId = Number(presenceIdStr);
    if (isNaN(presenceId)) {
      return { success: false, error: "ID de présence invalide." };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Format de fichier non supporté. Utilisez PDF, JPEG, PNG ou WEBP."
      };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Le fichier ne doit pas dépasser 5Mo." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public/uploads/certificats");

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Public URL
    const url = `/uploads/certificats/${filename}`;

    // Update the database record
    const updated = await PresenceModel.updateCertificat(presenceId, url);

    revalidatePath("/dashboard/presences");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error in uploadCertificatAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors du téléchargement du certificat."
    };
  }
}

/**
 * Get presences for a specific date
 */
export async function getPresencesByDateAction(date: string): Promise<ActionResponse> {
  try {
    if (!date) {
      return { success: false, error: "La date est requise." };
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return { success: false, error: "Date invalide." };
    }

    // Get presences for the specific date using PresenceModel
    const presences = await PresenceModel.getByDate(parsedDate);

    // Calculate worked days for each user up to this date
    const workedDaysMap = await PresenceModel.getAllWorkedDaysUpToDate(parsedDate);

    return {
      success: true,
      data: presences,
      workedDays: workedDaysMap,
    };
  } catch (error: any) {
    console.error("Error in getPresencesByDateAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors du chargement des présences."
    };
  }
}

/**
 * Get presence for a specific user and date
 */
export async function getPresenceByUserAndDateAction(
  userId: number,
  date: string
): Promise<ActionResponse> {
  try {
    if (!userId || !date) {
      return { success: false, error: "L'utilisateur et la date sont requis." };
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return { success: false, error: "Date invalide." };
    }

    const start = new Date(parsedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(parsedDate);
    end.setHours(23, 59, 59, 999);

    const presence = await db.presence.findFirst({
      where: {
        utilisateurId: userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    return { success: true, data: presence };
  } catch (error: any) {
    console.error("Error in getPresenceByUserAndDateAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors du chargement de la présence."
    };
  }
}

/**
 * Get all presences for a user between two dates
 */
export async function getUserPresencesBetweenDatesAction(
  userId: number,
  startDate: string,
  endDate: string
): Promise<ActionResponse> {
  try {
    if (!userId || !startDate || !endDate) {
      return { success: false, error: "Tous les paramètres sont requis." };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, error: "Dates invalides." };
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const presences = await db.presence.findMany({
      where: {
        utilisateurId: userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate statistics
    const totalDays = presences.length;
    const presentDays = presences.filter(p => p.statut === StatutPresence.PRESENT).length;
    const absentDays = presences.filter(p => p.statut === StatutPresence.ABSENT).length;
    const sickDays = presences.filter(p => p.statut === StatutPresence.MALADE).length;
    const paidDays = presences.filter(p => p.paye).length;

    return {
      success: true,
      data: {
        presences,
        stats: {
          total: totalDays,
          present: presentDays,
          absent: absentDays,
          sick: sickDays,
          paid: paidDays,
          presenceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
        },
      },
    };
  } catch (error: any) {
    console.error("Error in getUserPresencesBetweenDatesAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors du chargement des présences."
    };
  }
}

/**
 * Delete a presence record (Admin only)
 */
export async function deletePresenceAction(id: number): Promise<ActionResponse> {
  try {
    if (!id) {
      return { success: false, error: "L'ID de la présence est requis." };
    }

    const presence = await db.presence.findUnique({
      where: { id },
      include: {
        utilisateur: {
          select: { nom: true, prenom: true },
        },
      },
    });

    if (!presence) {
      return { success: false, error: "Cette présence n'existe pas." };
    }

    await db.presence.delete({
      where: { id },
    });

    const userName = presence.utilisateur
      ? `${presence.utilisateur.prenom} ${presence.utilisateur.nom}`
      : "un employé";

    await notifyAllSystemUsers(
      "🗑️ Présence supprimée",
      `La présence du ${userName} du ${presence.date.toLocaleDateString()} a été supprimée.`,
      "Administrateur"
    );

    revalidatePath("/dashboard/presences");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deletePresenceAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la présence."
    };
  }
}

/**
 * Get worked days for all users up to a specific date
 */
export async function getWorkedDaysUpToDateAction(date: string): Promise<ActionResponse> {
  try {
    if (!date) {
      return { success: false, error: "La date est requise." };
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return { success: false, error: "Date invalide." };
    }

    const workedDaysMap = await PresenceModel.getAllWorkedDaysUpToDate(parsedDate);

    return { success: true, data: workedDaysMap };
  } catch (error: any) {
    console.error("Error in getWorkedDaysUpToDateAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors du calcul des jours travaillés."
    };
  }
}

/**
 * Get presence statistics for a date range
 */
export async function getPresenceStatisticsAction(
  startDate: string,
  endDate: string
): Promise<ActionResponse> {
  try {
    if (!startDate || !endDate) {
      return { success: false, error: "Les dates sont requises." };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, error: "Dates invalides." };
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Get total users
    const totalUsers = await db.utilisateur.count();

    // Get presences in date range
    const presences = await db.presence.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const present = presences.filter(p => p.statut === StatutPresence.PRESENT).length;
    const absent = presences.filter(p => p.statut === StatutPresence.ABSENT).length;
    const sick = presences.filter(p => p.statut === StatutPresence.MALADE).length;
    const paid = presences.filter(p => p.paye).length;

    // Calculate average presence rate per day
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const averagePresenceRate = daysDiff > 0 ? Math.round((present / (totalUsers * daysDiff)) * 100) : 0;

    return {
      success: true,
      data: {
        totalUsers,
        totalPresences: presences.length,
        present,
        absent,
        sick,
        paid,
        averagePresenceRate,
        daysCount: daysDiff,
      },
    };
  } catch (error: any) {
    console.error("Error in getPresenceStatisticsAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors du calcul des statistiques."
    };
  }
}