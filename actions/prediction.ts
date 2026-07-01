"use server";

import { PredictionModel, CreatePredictionInput } from "@/models/prediction";
import { revalidatePath } from "next/cache";
import { notifyAllSystemUsers, getUserFullName } from "./notification";
import { db } from "@/lib/db";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Génère une prédiction (déclenchée par l'agriculteur ou l'IA).
 * Dans ce cas, la logique IA peut être branchée ici à l'avenir.
 */
export async function addPredictionAction(
  data: CreatePredictionInput,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    if (!data.type || !data.resultat || !data.fermeId || !data.createdById) {
      return { success: false, error: "Tous les champs obligatoires doivent être remplis." };
    }
    const prediction = await PredictionModel.create(data);

    const resolvedActeurId = acteurId || data.createdById;
    const acteurNom = resolvedActeurId ? await getUserFullName(resolvedActeurId) : undefined;
    await notifyAllSystemUsers(
      "🔮 Nouvelle prédiction",
      `Une prédiction (${prediction.type}) a été générée.`,
      acteurNom
    );

    revalidatePath("/dashboard/predictions");
    return { success: true, data: prediction };
  } catch (error: any) {
    console.error("Error in addPredictionAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la génération de la prédiction." };
  }
}

export async function deletePredictionAction(
  id: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const prediction = await db.prediction.findUnique({ where: { id }, select: { type: true } });
    await PredictionModel.delete(id);

    if (prediction) {
      const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
      await notifyAllSystemUsers(
        "🗑️ Prédiction supprimée",
        `La prédiction (${prediction.type}) a été supprimée.`,
        acteurNom
      );
    }

    revalidatePath("/dashboard/predictions");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deletePredictionAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la suppression." };
  }
}
