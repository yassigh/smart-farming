"use server";

import { DepenseModel, CreateDepenseInput } from "@/models/depense";
import { revalidatePath } from "next/cache";
import { notifyAllSystemUsers, getUserFullName } from "./notification";
import { db } from "@/lib/db";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function addDepenseAction(
  data: CreateDepenseInput,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    if (!data.montant || !data.type || !data.fermeId || !data.createdById) {
      return { success: false, error: "Tous les champs obligatoires doivent être remplis." };
    }
    if (data.montant <= 0) {
      return { success: false, error: "Le montant doit être supérieur à 0." };
    }
    const depense = await DepenseModel.create(data);
    
    const resolvedActeurId = acteurId || data.createdById;
    const acteurNom = resolvedActeurId ? await getUserFullName(resolvedActeurId) : undefined;
    await notifyAllSystemUsers(
      "💸 Nouvelle dépense",
      `Une dépense de ${depense.montant} a été enregistrée (${depense.type}).`,
      acteurNom
    );

    revalidatePath("/dashboard/finances");
    return { success: true, data: depense };
  } catch (error: any) {
    console.error("Error in addDepenseAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la création de la dépense." };
  }
}

export async function updateDepenseAction(
  id: number,
  data: Partial<CreateDepenseInput>,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const updated = await DepenseModel.update(id, data);
    
    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      "✏️ Dépense modifiée",
      `Une dépense (${updated.type}) a été mise à jour.`,
      acteurNom
    );

    revalidatePath("/dashboard/finances");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error in updateDepenseAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la mise à jour de la dépense." };
  }
}

export async function deleteDepenseAction(
  id: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const depense = await db.depense.findUnique({ where: { id }, select: { type: true, montant: true } });
    await DepenseModel.delete(id);
    
    if (depense) {
      const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
      await notifyAllSystemUsers(
        "🗑️ Dépense supprimée",
        `La dépense de ${depense.montant} (${depense.type}) a été supprimée.`,
        acteurNom
      );
    }

    revalidatePath("/dashboard/finances");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteDepenseAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la suppression." };
  }
}
