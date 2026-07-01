// actions/terrain.ts
"use server";

import { revalidatePath } from "next/cache";
import { TerrainService } from "@/services/terrain.service";
import { notifyAllSystemUsers, getUserFullName } from "./notification";
import { db } from "@/lib/db";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function addTerrainAction(
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const formattedData = {
      ...data,
      latitude: data.latitude !== undefined && data.latitude !== null && data.latitude !== "" ? parseFloat(data.latitude) : null,
      longitude: data.longitude !== undefined && data.longitude !== null && data.longitude !== "" ? parseFloat(data.longitude) : null,
    };
    const terrain = await TerrainService.create(formattedData);

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      "🗺️ Nouveau terrain ajouté",
      `Le terrain "${terrain.nom}" (${terrain.superficie} ha) a été ajouté.`,
      acteurNom
    );

    revalidatePath("/dashboard/terrains");
    return { success: true, data: terrain };
  } catch (error: any) {
    console.error("Error in addTerrainAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la création du terrain." };
  }
}

export async function deleteTerrainAction(
  id: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const terrain = await db.terrain.findUnique({
      where: { id },
      select: { nom: true },
    });

    await TerrainService.delete(id);

    if (terrain) {
      const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
      await notifyAllSystemUsers(
        "🗑️ Terrain supprimé",
        `Le terrain "${terrain.nom}" a été supprimé.`,
        acteurNom
      );
    }

    revalidatePath("/dashboard/terrains");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteTerrainAction:", error);
    if (error.code === "P2003") {
      return { 
        success: false, 
        error: "Impossible de supprimer ce terrain car il est lié à des animaux ou des cultures existants." 
      };
    }
    return { success: false, error: "Une erreur est survenue lors de la suppression du terrain." };
  }
}

export async function updateTerrainAction(
  id: number,
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const formattedData = {
      ...data,
      latitude: data.latitude !== undefined && data.latitude !== null && data.latitude !== "" ? parseFloat(data.latitude) : null,
      longitude: data.longitude !== undefined && data.longitude !== null && data.longitude !== "" ? parseFloat(data.longitude) : null,
    };
    const terrain = await TerrainService.update(id, formattedData);

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      "✏️ Terrain modifié",
      `Le terrain "${terrain.nom}" a été mis à jour.`,
      acteurNom
    );

    revalidatePath("/dashboard/terrains");
    return { success: true, data: terrain };
  } catch (error: any) {
    console.error("Error in updateTerrainAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la modification du terrain." };
  }
}