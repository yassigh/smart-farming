"use server";

import { UtilisateurModel, CreateUtilisateurInput } from "@/models/utilisateur";
import { revalidatePath } from "next/cache";
import { notifyAllSystemUsers, getUserFullName } from "./notification";
import { db } from "@/lib/db";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Controller action to add a new user.
 * It validates the inputs, interacts with the Model layer, and revalidates the view path.
 */
export async function addUtilisateurAction(
  data: CreateUtilisateurInput,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    // 1. Simple validation
    if (!data.nom || !data.prenom || !data.email || !data.motDePasse || !data.role) {
      return { success: false, error: "Tous les champs obligatoires doivent être remplis." };
    }

    // 2. Check if email already exists via the Model
    const existingUser = await UtilisateurModel.getByEmail(data.email);
    if (existingUser) {
      return { success: false, error: "Un utilisateur avec cet email existe déjà." };
    }

    // 3. Create user via the Model
    const newUser = await UtilisateurModel.create(data);

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      " Nouvel utilisateur",
      `L'utilisateur ${newUser.prenom} ${newUser.nom} a été ajouté (${newUser.role}).`,
      acteurNom
    );

    // 4. Revalidate the view to show the new user instantly
    revalidatePath("/utilisateurs");

    return { success: true, data: newUser };
  } catch (error: any) {
    console.error("Error in addUtilisateurAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la création de l'utilisateur." };
  }
}


export async function updateUtilisateurAction(
  id: number,
  data: Partial<CreateUtilisateurInput>,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const updatedUser = await UtilisateurModel.update(id, data);

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      " Utilisateur modifié",
      `Le profil de ${updatedUser.prenom} ${updatedUser.nom} a été mis à jour.`,
      acteurNom
    );

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/utilisateurs");

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      error: "Erreur lors de la modification du profil.",
    };
  }
}



/**
 * Controller action to delete a user.
 */
export async function deleteUtilisateurAction(
  id: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const user = await db.utilisateur.findUnique({ where: { id }, select: { nom: true, prenom: true } });
    // Call the Model to delete the user
    await UtilisateurModel.delete(id);

    if (user) {
      const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
      await notifyAllSystemUsers(
        " Utilisateur supprimé",
        `L'utilisateur ${user.prenom} ${user.nom} a été supprimé.`,
        acteurNom
      );
    }

    // Revalidate the view path
    revalidatePath("/utilisateurs");

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteUtilisateurAction:", error);
    return { success: false, error: "Une erreur est survenue lors de la suppression." };
  }
}
