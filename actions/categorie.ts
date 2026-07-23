// actions/categorie.ts
"use server";

import { CategorieModel, CreateCategorieInput } from "@/models/categorie";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: {
    animauxCount?: number;
    culturesCount?: number;
    animauxList?: any[];
    culturesList?: any[];
  };
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
 * Get all categories for reassignment
 */
export async function getCategoriesForReassignment(
  excludeId: number,
  type: string
): Promise<ActionResponse> {
  try {
    const categories = await db.categorie.findMany({
      where: {
        id: { not: excludeId },
        type: type as any,
      },
      select: {
        id: true,
        nom: true,
      },
    });

    return { success: true, data: categories };
  } catch (error: any) {
    console.error("Error fetching categories for reassignment:", error);
    return {
      success: false,
      error: "Impossible de récupérer les catégories pour réaffectation.",
    };
  }
}

/**
 * Delete a category with reassignment options (Admin only)
 */
export async function deleteCategorieWithReassignmentAction(
  id: number,
  reassignData?: {
    animauxToReassign?: { id: number; categorieId: number }[];
    culturesToReassign?: { id: number; categorieId: number }[];
  }
): Promise<ActionResponse> {
  try {
    // Vérifier d'abord si la catégorie existe
    const categorie = await db.categorie.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        _count: {
          select: {
            animaux: true,
            cultures: true,
          },
        },
      },
    });

    if (!categorie) {
      return { success: false, error: "Cette catégorie n'existe plus." };
    }

    // Si des réaffectations sont demandées, les traiter dans une transaction
    if (reassignData) {
      const { animauxToReassign, culturesToReassign } = reassignData;

      // Utiliser une transaction pour garantir la cohérence
      await db.$transaction(async (tx) => {
        // Réaffecter les animaux
        if (animauxToReassign && animauxToReassign.length > 0) {
          for (const item of animauxToReassign) {
            await tx.animal.update({
              where: { id: item.id },
              data: { categorieId: item.categorieId },
            });
          }
        }

        // Réaffecter les cultures
        if (culturesToReassign && culturesToReassign.length > 0) {
          for (const item of culturesToReassign) {
            await tx.culture.update({
              where: { id: item.id },
              data: { categorieId: item.categorieId },
            });
          }
        }

        // Supprimer la catégorie maintenant qu'elle n'est plus utilisée
        await tx.categorie.delete({
          where: { id },
        });
      });

      revalidatePath("/dashboard/categories");
      return { success: true };
    }

    // Sinon, vérifier si elle a des dépendances
    const linkedAnimaux = categorie._count.animaux;
    const linkedCultures = categorie._count.cultures;

    if (linkedAnimaux > 0 || linkedCultures > 0) {
      // Récupérer les détails des éléments liés
      const details: any = {};

      if (linkedAnimaux > 0) {
        const animaux = await db.animal.findMany({
          where: { categorieId: id },
          select: { id: true, numero: true },
          take: 5,
        });
        details.animauxList = animaux;
      }

      if (linkedCultures > 0) {
        const cultures = await db.culture.findMany({
          where: { categorieId: id },
          select: { id: true, nom: true },
          take: 5,
        });
        details.culturesList = cultures;
      }

      const parts = [
        linkedAnimaux > 0
          ? `${linkedAnimaux} animal${linkedAnimaux > 1 ? "aux" : ""}`
          : null,
        linkedCultures > 0
          ? `${linkedCultures} culture${linkedCultures > 1 ? "s" : ""}`
          : null,
      ].filter(Boolean);

      return {
        success: false,
        error: `Impossible de supprimer « ${categorie.nom} » car cette catégorie est encore utilisée par ${parts.join(" et ")}.`,
        details: {
          animauxCount: linkedAnimaux,
          culturesCount: linkedCultures,
          animauxList: details.animauxList || [],
          culturesList: details.culturesList || [],
        },
      };
    }

    // Si aucune dépendance, supprimer directement
    await CategorieModel.delete(id);
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteCategorieWithReassignmentAction:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la catégorie.",
    };
  }
}

/**
 * Delete a category (Admin only) - Simple version without reassignment
 */
export async function deleteCategorieAction(id: number): Promise<ActionResponse> {
  try {
    const categorie = await db.categorie.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        _count: {
          select: {
            animaux: true,
            cultures: true,
          },
        },
      },
    });

    if (!categorie) {
      return { success: false, error: "Cette catégorie n'existe plus." };
    }

    const linkedAnimaux = categorie._count.animaux;
    const linkedCultures = categorie._count.cultures;

    if (linkedAnimaux > 0 || linkedCultures > 0) {
      const details = [
        linkedAnimaux > 0
          ? `${linkedAnimaux} animal${linkedAnimaux > 1 ? "aux" : ""}`
          : null,
        linkedCultures > 0
          ? `${linkedCultures} culture${linkedCultures > 1 ? "s" : ""}`
          : null,
      ]
        .filter(Boolean)
        .join(" et ");

      return {
        success: false,
        error: `Impossible de supprimer « ${categorie.nom} » car cette catégorie est encore utilisée par ${details}.`,
      };
    }

    await CategorieModel.delete(id);
    revalidatePath("/dashboard/categories");

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteCategorieAction:", error);

    if (error?.code === "P2003") {
      return {
        success: false,
        error:
          "Impossible de supprimer cette catégorie car elle est encore liée à des animaux ou des cultures.",
      };
    }

    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la catégorie.",
    };
  }
}