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
};

/**
 * Save or update presence for a user at a given date.
 */
export async function savePresenceAction(data: {
  userId: number;
  date: string;
  statut: StatutPresence;
  paye: boolean;
}, acteurId?: number): Promise<ActionResponse> {
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

    const userDetails = await db.utilisateur.findUnique({ where: { id: data.userId }, select: { nom: true, prenom: true } });
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
    return { success: false, error: "Une erreur est survenue lors de la sauvegarde de la présence." };
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
      return { success: false, error: "Format de fichier non supporté. Utilisez PDF, JPEG, PNG ou WEBP." };
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
    return { success: false, error: "Une erreur est survenue lors du téléchargement du certificat." };
  }
}
