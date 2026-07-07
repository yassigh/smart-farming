// actions/employe.ts
"use server";

import { db } from "@/lib/db";
import { EmployeModel } from "@/models/employe";
import { revalidatePath } from "next/cache";
import { createNotificationForUser } from "./notification";

export async function assignTerrainAction(
  employeFermeId: number,
  terrainId: number | null,
  acteurId?: number
) {
  try {
    await EmployeModel.assignTerrain(employeFermeId, terrainId);

    // Notifier l'employé
    const ef = await db.employeFerme.findUnique({
      where: { id: employeFermeId },
      include: {
        employe: true,
        terrainAssigne: true,
      },
    });

    if (ef && terrainId) {
      await createNotificationForUser(
        ef.employeId,
        "📍 Terrain assigné",
        `Vous avez été assigné au terrain "${ef.terrainAssigne?.nom}" par votre agriculteur.`
      );
    }

    revalidatePath("/dashboard/employes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erreur assignTerrainAction:", error);
    return { success: false, error: "Erreur lors de l'assignation du terrain." };
  }
}

export async function assignAnimauxAction(
  employeFermeId: number,
  animalIds: number[],
  acteurId?: number
) {
  try {
    await EmployeModel.assignAnimaux(employeFermeId, animalIds);

    // Notifier l'employé
    const ef = await db.employeFerme.findUnique({
      where: { id: employeFermeId },
      select: { employeId: true },
    });

    if (ef) {
      await createNotificationForUser(
        ef.employeId,
        "🐾 Animaux assignés",
        `Votre liste d'animaux a été mise à jour par votre agriculteur (${animalIds.length} animal(aux)).`
      );
    }

    revalidatePath("/dashboard/employes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erreur assignAnimauxAction:", error);
    return { success: false, error: "Erreur lors de l'assignation des animaux." };
  }
}

export async function assignCulturesAction(
  employeFermeId: number,
  cultureIds: number[],
  acteurId?: number
) {
  try {
    await EmployeModel.assignCultures(employeFermeId, cultureIds);

    // Notifier l'employé
    const ef = await db.employeFerme.findUnique({
      where: { id: employeFermeId },
      select: { employeId: true },
    });

    if (ef) {
      await createNotificationForUser(
        ef.employeId,
        "🌾 Cultures assignées",
        `Votre liste de cultures a été mise à jour par votre agriculteur (${cultureIds.length} culture(s)).`
      );
    }

    revalidatePath("/dashboard/employes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erreur assignCulturesAction:", error);
    return { success: false, error: "Erreur lors de l'assignation des cultures." };
  }
}

export async function updateRoleDescriptionAction(
  employeFermeId: number,
  roleDescription: string
) {
  try {
    await EmployeModel.updateRoleDescription(employeFermeId, roleDescription);
    revalidatePath("/dashboard/employes");
    return { success: true };
  } catch (error) {
    console.error("Erreur updateRoleDescriptionAction:", error);
    return { success: false, error: "Erreur lors de la mise à jour du rôle." };
  }
}

export async function getEmployesByAgriculteurAction(agriculteurId: number) {
  try {
    const employes = await EmployeModel.getByAgriculteur(agriculteurId);
    return { success: true, data: employes };
  } catch (error) {
    console.error("Erreur getEmployesByAgriculteurAction:", error);
    return { success: false, error: "Erreur lors de la récupération des employés." };
  }
}

export async function addEmployeFermeAction(data: {
  employeId: number;
  fermeId: number;
  poste: string;
  salaire: number;
  dateEmbauche: string;
}) {
  try {
    const existing = await db.employeFerme.findFirst({
      where: {
        employeId: data.employeId,
        fermeId: data.fermeId,
      },
    });

    if (existing) {
      return { success: false, error: "Cet employé est déjà rattaché à cette ferme." };
    }

    const newEmployeFerme = await db.employeFerme.create({
      data: {
        employeId: data.employeId,
        fermeId: data.fermeId,
        poste: data.poste,
        salaire: data.salaire,
        dateEmbauche: new Date(data.dateEmbauche),
      },
    });

    await createNotificationForUser(
      data.employeId,
      "🏡 Rattaché à une ferme",
      `Vous avez été rattaché à une nouvelle ferme en tant que "${data.poste}".`
    );

    revalidatePath("/dashboard/employes");
    revalidatePath("/dashboard");
    return { success: true, data: newEmployeFerme };
  } catch (error) {
    console.error("Erreur addEmployeFermeAction:", error);
    return { success: false, error: "Erreur lors du rattachement de l'employé." };
  }
}

export async function removeEmployeFermeAction(employeFermeId: number) {
  try {
    const ef = await db.employeFerme.findUnique({
      where: { id: employeFermeId },
      include: { ferme: true },
    });

    if (!ef) {
      return { success: false, error: "Rattachement introuvable." };
    }

    await db.employeFerme.delete({
      where: { id: employeFermeId },
    });

    await createNotificationForUser(
      ef.employeId,
      "🚪 Retiré de la ferme",
      `Vous avez été retiré de la ferme "${ef.ferme.nom}".`
    );

    revalidatePath("/dashboard/employes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erreur removeEmployeFermeAction:", error);
    return { success: false, error: "Erreur lors du détachement de l'employé." };
  }
}
