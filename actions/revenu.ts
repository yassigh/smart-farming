"use server";

import { RevenuModel, CreateRevenuInput } from "@/models/revenu";
import { revalidatePath } from "next/cache";
import { notifyAllSystemUsers, getUserFullName } from "./notification";
import { db } from "@/lib/db";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function addRevenuAction(
  data: CreateRevenuInput,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    if (!data.montant || !data.source || !data.fermeId || !data.createdById) {
      return { success: false, error: "Tous les champs obligatoires doivent être remplis." };
    }
    if (data.montant <= 0) {
      return { success: false, error: "Le montant doit être supérieur à 0." };
    }
    const revenu = await RevenuModel.create(data);

    const resolvedActeurId = acteurId || data.createdById;
    const acteurNom = resolvedActeurId ? await getUserFullName(resolvedActeurId) : undefined;
    await notifyAllSystemUsers(
      "💰 Nouveau revenu",
      `Un revenu de ${revenu.montant} a été enregistré (${revenu.source}).`,
      acteurNom
    );

    revalidatePath("/dashboard/finances");
    return { success: true, data: revenu };
  } catch (error: any) {
    console.error("Error in addRevenuAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la création du revenu." };
  }
}

export async function updateRevenuAction(
  id: number,
  data: Partial<CreateRevenuInput>,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const updated = await RevenuModel.update(id, data);

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      "✏️ Revenu modifié",
      `Un revenu (${updated.source}) a été mis à jour.`,
      acteurNom
    );

    revalidatePath("/dashboard/finances");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error in updateRevenuAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la mise à jour du revenu." };
  }
}

export async function deleteRevenuAction(
  id: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const revenu = await db.revenu.findUnique({ where: { id }, select: { source: true, montant: true } });
    await RevenuModel.delete(id);

    if (revenu) {
      const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
      await notifyAllSystemUsers(
        "🗑️ Revenu supprimé",
        `Le revenu de ${revenu.montant} (${revenu.source}) a été supprimé.`,
        acteurNom
      );
    }

    revalidatePath("/dashboard/finances");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteRevenuAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la suppression." };
  }
}
