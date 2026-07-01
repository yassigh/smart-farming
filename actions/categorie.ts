"use server";

import { CategorieModel, CreateCategorieInput } from "@/models/categorie";
import { revalidatePath } from "next/cache";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Create a new category (Admin only)
 */
export async function addCategorieAction(
  data: CreateCategorieInput
): Promise<ActionResponse> {
  try {
    if (!data.nom || !data.type) {
      return { success: false, error: "Le nom et le type sont obligatoires." };
    }

    const newCategorie = await CategorieModel.create(data);
    revalidatePath("/dashboard/categories");

    return { success: true, data: newCategorie };
  } catch (error: any) {
    console.error("Error in addCategorieAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la catégorie.",
    };
  }
}

/**
 * Update an existing category (Admin only)
 */
export async function updateCategorieAction(
  id: number,
  data: Partial<CreateCategorieInput>
): Promise<ActionResponse> {
  try {
    if (!data.nom && !data.type) {
      return { success: false, error: "Aucune donnée à mettre à jour." };
    }

    const updated = await CategorieModel.update(id, data);
    revalidatePath("/dashboard/categories");

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error in updateCategorieAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de la catégorie.",
    };
  }
}

/**
 * Delete a category (Admin only)
 */
export async function deleteCategorieAction(
  id: number
): Promise<ActionResponse> {
  try {
    await CategorieModel.delete(id);
    revalidatePath("/dashboard/categories");

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteCategorieAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la catégorie.",
    };
  }
}
