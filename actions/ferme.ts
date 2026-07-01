// actions/ferme.ts
"use server";

import { revalidatePath } from "next/cache";
import { FermeService } from "@/services/ferme.service";
import { notifyAllSystemUsers, getUserFullName } from "./notification";
import { db } from "@/lib/db";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function addFermeAction(
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const ferme = await FermeService.create(data);

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      "🏡 Nouvelle ferme créée",
      `La ferme "${ferme.nom}" a été créée.`,
      acteurNom
    );

    revalidatePath("/dashboard/fermes");
    revalidatePath("/dashboard/terrains");
    return { success: true, data: ferme };
  } catch (error: any) {
    console.error("Error in addFermeAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la création de la ferme." };
  }
}

export async function deleteFermeAction(
  id: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const ferme = await db.ferme.findUnique({
      where: { id },
      select: { nom: true },
    });

    await FermeService.delete(id);

    if (ferme) {
      const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
      await notifyAllSystemUsers(
        "🗑️ Ferme supprimée",
        `La ferme "${ferme.nom}" a été supprimée.`,
        acteurNom
      );
    }

    revalidatePath("/dashboard/fermes");
    revalidatePath("/dashboard/terrains");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteFermeAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la ferme. Assurez-vous qu'elle ne contient pas de terrains.",
    };
  }
}

export async function updateFermeAction(
  id: number,
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const ferme = await FermeService.update(id, data);

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      "✏️ Ferme modifiée",
      `La ferme "${ferme.nom}" a été mise à jour.`,
      acteurNom
    );

    revalidatePath("/dashboard/fermes");
    revalidatePath("/dashboard/terrains");
    return { success: true, data: ferme };
  } catch (error: any) {
    console.error("Error in updateFermeAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la modification de la ferme." };
  }
}
