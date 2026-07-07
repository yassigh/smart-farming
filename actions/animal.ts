// actions/animal.ts
"use server";

import { revalidatePath } from "next/cache";
import { AnimalService } from "@/services/animal.service";
import {
  notifyAllSystemUsers,
  createNotificationForUser,
  getUserFullName,
} from "./notification";
import { db } from "@/lib/db";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ── Animal CRUD ────────────────────────────────────────────────────────────

export async function addAnimalAction(
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const animal = await AnimalService.create({
      ...data,
      poids: parseFloat(data.poids),
      dateNaissance: new Date(data.dateNaissance),
      terrainId: parseInt(data.terrainId),
      categorieId: parseInt(data.categorieId),
    });

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;

    // 🔔 Notifier tous les utilisateurs du système avec le nom de l'auteur
    await notifyAllSystemUsers(
      "🐄 Nouvel animal ajouté",
      `Un nouvel animal (${animal.type} - ${animal.race}) a été ajouté.`,
      acteurNom
    );

    // 🔔 Notifier l'agriculteur propriétaire si différent de l'acteur
    try {
      const animalWithDetails = await db.animal.findUnique({
        where: { id: animal.id },
        include: {
          terrain: {
            include: {
              ferme: { include: { agriculteur: true } },
            },
          },
        },
      });

      const proprietaire = animalWithDetails?.terrain?.ferme?.agriculteur;
      if (proprietaire && proprietaire.id !== acteurId) {
        await createNotificationForUser(
          proprietaire.id,
          " Animal enregistré sur votre ferme",
          `${acteurNom ?? "Un utilisateur"} a ajouté l'animal ${animal.type} (${animal.race}) sur votre ferme.`
        );
      }
    } catch (notifError) {
      console.error("Erreur notification spécifique:", notifError);
    }

    revalidatePath("/dashboard/animaux");
    return { success: true, data: animal };
  } catch (error: any) {
    console.error("addAnimalAction:", error);
    return { success: false, error: "Erreur lors de la création de l'animal." };
  }
}

export async function updateAnimalAction(
  id: number,
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const animal = await AnimalService.update(id, {
      ...data,
      poids: data.poids !== undefined ? parseFloat(data.poids) : undefined,
      dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
      terrainId: data.terrainId ? parseInt(data.terrainId) : undefined,
      categorieId: data.categorieId ? parseInt(data.categorieId) : undefined,
    });

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;

    await notifyAllSystemUsers(
      "✏️ Animal modifié",
      `L'animal ${animal.type} (${animal.race}) a été mis à jour.`,
      acteurNom
    );

    revalidatePath("/dashboard/animaux");
    revalidatePath(`/dashboard/animaux/${id}`);
    return { success: true, data: animal };
  } catch (error: any) {
    console.error("updateAnimalAction:", error);
    return { success: false, error: "Erreur lors de la mise à jour de l'animal." };
  }
}

// actions/animal.ts - Modifiez la fonction deleteAnimalAction

export async function deleteAnimalAction(
  id: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    // Vérifier d'abord si l'animal existe et récupérer ses relations
    const animal = await db.animal.findUnique({
      where: { id },
      include: {
        traitements: {
          select: { id: true }
        },
        vaccinations: {
          select: { id: true }
        },
        terrain: {
          include: {
            ferme: { include: { agriculteur: true } }
          }
        }
      },
    });

    if (!animal) {
      return { success: false, error: "Animal non trouvé." };
    }

    // Vérifier si l'animal a des traitements ou vaccinations
    const hasTraitements = animal.traitements && animal.traitements.length > 0;
    const hasVaccinations = animal.vaccinations && animal.vaccinations.length > 0;

    // Si l'animal a des traitements ou vaccinations, on les supprime d'abord
    if (hasTraitements || hasVaccinations) {
      // Supprimer les traitements
      if (hasTraitements) {
        await db.traitement.deleteMany({
          where: { animalId: id }
        });
      }

      // Supprimer les vaccinations
      if (hasVaccinations) {
        await db.vaccination.deleteMany({
          where: { animalId: id }
        });
      }
    }

    // Maintenant on peut supprimer l'animal
    await AnimalService.delete(id);

    // Notifications
    if (animal) {
      const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
      
      // Notifier tout le système
      await notifyAllSystemUsers(
        "🗑️ Animal supprimé",
        `L'animal ${animal.type} (${animal.race}) a été supprimé.`,
        acteurNom
      );

      // Notifier le propriétaire si différent
      const proprietaire = animal.terrain?.ferme?.agriculteur;
      if (proprietaire && proprietaire.id !== acteurId) {
        await createNotificationForUser(
          proprietaire.id,
          "🗑️ Animal supprimé de votre ferme",
          `${acteurNom ?? "Un utilisateur"} a supprimé l'animal ${animal.type} (${animal.race}) de votre ferme.`
        );
      }
    }

    revalidatePath("/dashboard/animaux");
    return { success: true };
  } catch (error: any) {
    console.error("deleteAnimalAction:", error);
    return { 
      success: false, 
      error: "Erreur lors de la suppression de l'animal." 
    };
  }
}

// ── Traitements ────────────────────────────────────────────────────────────

export async function addTraitementAction(
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const traitement = await AnimalService.addTraitement({
      ...data,
      date: new Date(data.date),
      dateFin: data.dateFin ? new Date(data.dateFin) : undefined,
      animalId: parseInt(data.animalId),
      veterinaireId: parseInt(data.veterinaireId),
    });

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;

    await notifyAllSystemUsers(
      "💊 Nouveau traitement",
      `Un nouveau traitement (${traitement.medicament}) a été ajouté.`,
      acteurNom
    );

    try {
      const animalWithFerme = await db.animal.findUnique({
        where: { id: traitement.animalId },
        include: {
          terrain: {
            include: {
              ferme: { include: { agriculteur: true } },
            },
          },
        },
      });

      const proprietaire = animalWithFerme?.terrain?.ferme?.agriculteur;
      if (proprietaire) {
        await createNotificationForUser(
          proprietaire.id,
          "💊 Traitement enregistré",
          `${acteurNom ?? "Un vétérinaire"} a ajouté un traitement (${traitement.medicament}) pour l'animal ${animalWithFerme?.type}.`
        );
      }
    } catch (notifError) {
      console.error("Erreur notification agriculteur:", notifError);
    }

    revalidatePath(`/dashboard/animaux/${data.animalId}`);
    revalidatePath("/dashboard/animaux");
    revalidatePath("/dashboard/traitements");
    return { success: true, data: traitement };
  } catch (error: any) {
    console.error("addTraitementAction:", error);
    return { success: false, error: "Erreur lors de l'ajout du traitement." };
  }
}

export async function deleteTraitementAction(
  id: number,
  animalId: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    await AnimalService.deleteTraitement(id);

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      "🗑️ Traitement supprimé",
      "Un traitement a été supprimé.",
      acteurNom
    );

    revalidatePath(`/dashboard/animaux/${animalId}`);
    revalidatePath("/dashboard/animaux");
    revalidatePath("/dashboard/traitements");
    return { success: true };
  } catch (error: any) {
    console.error("deleteTraitementAction:", error);
    return { success: false, error: "Erreur lors de la suppression du traitement." };
  }
}

// ── Vaccinations ───────────────────────────────────────────────────────────

export async function addVaccinationAction(
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const vaccination = await AnimalService.addVaccination({
      ...data,
      dateAdministered: new Date(data.dateAdministered),
      dateRappel: data.dateRappel ? new Date(data.dateRappel) : undefined,
      animalId: parseInt(data.animalId),
      veterinaireId: parseInt(data.veterinaireId),
    });

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;

    await notifyAllSystemUsers(
      "💉 Nouvelle vaccination",
      `Une vaccination (${vaccination.nomVaccin}) a été enregistrée.`,
      acteurNom
    );

    try {
      const animalWithFerme = await db.animal.findUnique({
        where: { id: vaccination.animalId },
        include: {
          terrain: {
            include: {
              ferme: { include: { agriculteur: true } },
            },
          },
        },
      });

      const proprietaire = animalWithFerme?.terrain?.ferme?.agriculteur;
      if (proprietaire) {
        await createNotificationForUser(
          proprietaire.id,
          "💉 Vaccination enregistrée",
          `${acteurNom ?? "Un vétérinaire"} a enregistré la vaccination (${vaccination.nomVaccin}) pour l'animal ${animalWithFerme?.type}.`
        );
      }
    } catch (notifError) {
      console.error("Erreur notification agriculteur:", notifError);
    }

    revalidatePath(`/dashboard/animaux/${data.animalId}`);
    return { success: true, data: vaccination };
  } catch (error: any) {
    console.error("addVaccinationAction:", error);
    return { success: false, error: "Erreur lors de l'ajout de la vaccination." };
  }
}

export async function deleteVaccinationAction(
  id: number,
  animalId: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    await AnimalService.deleteVaccination(id);

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      "🗑️ Vaccination supprimée",
      "Une vaccination a été supprimée.",
      acteurNom
    );

    revalidatePath(`/dashboard/animaux/${animalId}`);
    return { success: true };
  } catch (error: any) {
    console.error("deleteVaccinationAction:", error);
    return { success: false, error: "Erreur lors de la suppression de la vaccination." };
  }
}