// actions/culture.ts
"use server";

import { revalidatePath } from "next/cache";
import { CultureService } from "@/services/culture.service";
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

// ── Culture CRUD ───────────────────────────────────────────────────────────

export async function addCultureAction(
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const culture = await CultureService.create({
      nom: data.nom,
      datePlantation: new Date(data.datePlantation),
      quantitePrevue: parseFloat(data.quantitePrevue),
      etat: data.etat,
      terrainId: parseInt(data.terrainId),
      categorieId: parseInt(data.categorieId),
    });

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;

    // 🔔 Notifier tous les utilisateurs du système avec le nom de l'auteur
    await notifyAllSystemUsers(
      "🌾 Nouvelle culture ajoutée",
      `La culture "${culture.nom}" a été ajoutée.`,
      acteurNom
    );

    // 🔔 Notifier l'agriculteur propriétaire si différent de l'acteur
    try {
      const cultureWithDetails = await db.culture.findUnique({
        where: { id: culture.id },
        include: {
          terrain: {
            include: {
              ferme: {
                include: {
                  agriculteur: true // ✅ Correction: agriculteur est inclus via la relation
                }
              }
            },
          },
        },
      });

      const proprietaire = cultureWithDetails?.terrain?.ferme?.agriculteur;
      if (proprietaire && proprietaire.id !== acteurId) {
        await createNotificationForUser(
          proprietaire.id,
          "✅ Culture ajoutée sur votre terrain",
          `${acteurNom ?? "Un utilisateur"} a ajouté la culture "${culture.nom}" sur votre terrain.`
        );
      }
    } catch (notifError) {
      console.error("Erreur notification agriculteur:", notifError);
    }

    revalidatePath("/dashboard/cultures");
    revalidatePath("/dashboard/fermes");
    return { success: true, data: culture };
  } catch (error: any) {
    console.error("addCultureAction:", error);
    return { success: false, error: "Erreur lors de la création de la culture." };
  }
}

export async function updateCultureAction(
  id: number,
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    // Récupérer l'ancien nom pour les notifications
    const oldCulture = await db.culture.findUnique({
      where: { id },
      select: { nom: true }
    });

    const culture = await CultureService.update(id, {
      nom: data.nom,
      datePlantation: data.datePlantation ? new Date(data.datePlantation) : undefined,
      quantitePrevue: data.quantitePrevue !== undefined ? parseFloat(data.quantitePrevue) : undefined,
      etat: data.etat,
      terrainId: data.terrainId ? parseInt(data.terrainId) : undefined,
      categorieId: data.categorieId ? parseInt(data.categorieId) : undefined,
    });

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;

    await notifyAllSystemUsers(
      "✏️ Culture modifiée",
      `La culture "${oldCulture?.nom || culture.nom}" a été mise à jour.`,
      acteurNom
    );

    revalidatePath("/dashboard/cultures");
    revalidatePath(`/dashboard/cultures/${id}`);
    revalidatePath("/dashboard/fermes");
    return { success: true, data: culture };
  } catch (error: any) {
    console.error("updateCultureAction:", error);
    return { success: false, error: "Erreur lors de la mise à jour de la culture." };
  }
}

export async function deleteCultureAction(
  id: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    // Vérifier d'abord si la culture existe et récupérer ses relations
    const culture = await db.culture.findUnique({
      where: { id },
      include: {
        recoltes: {
          select: { id: true, quantite: true, date: true }
        },
        terrain: {
          include: {
            ferme: {
              include: {
                agriculteur: true // ✅ Correction
              }
            }
          }
        }
      },
    });

    if (!culture) {
      return { success: false, error: "Culture non trouvée." };
    }

    // Vérifier si la culture a des récoltes associées
    const hasRecoltes = culture.recoltes && culture.recoltes.length > 0;

    // Si la culture a des récoltes, on les supprime d'abord
    if (hasRecoltes) {
      const recoltesCount = culture.recoltes.length;
      console.log(`Suppression de ${recoltesCount} récolte(s) associée(s) à la culture "${culture.nom}"`);
      
      await db.recolte.deleteMany({
        where: { cultureId: id }
      });
    }

    // Maintenant on peut supprimer la culture
    await CultureService.delete(id);

    // Notifications
    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    
    // Notifier tout le système
    await notifyAllSystemUsers(
      "🗑️ Culture supprimée",
      `La culture "${culture.nom}" a été supprimée${hasRecoltes ? ` ainsi que ses ${culture.recoltes.length} récolte(s) associée(s)` : ''}.`,
      acteurNom
    );

    // Notifier le propriétaire si différent
    const proprietaire = culture.terrain?.ferme?.agriculteur;
    if (proprietaire && proprietaire.id !== acteurId) {
      await createNotificationForUser(
        proprietaire.id,
        "🗑️ Culture supprimée de votre ferme",
        `${acteurNom ?? "Un utilisateur"} a supprimé la culture "${culture.nom}" de votre ferme${hasRecoltes ? ` ainsi que ses récoltes associées` : ''}.`
      );
    }

    revalidatePath("/dashboard/cultures");
    revalidatePath("/dashboard/fermes");
    revalidatePath("/dashboard/recoltes");
    return { success: true };
  } catch (error: any) {
    console.error("deleteCultureAction:", error);
    
    // Gestion d'erreur plus spécifique
    let errorMessage = "Erreur lors de la suppression de la culture. Veuillez réessayer.";
    
    if (error.code === 'P2003') {
      errorMessage = "Impossible de supprimer cette culture car elle a des données associées. Veuillez d'abord supprimer les récoltes liées.";
    } else if (error.message?.includes('Foreign key constraint')) {
      errorMessage = "Cette culture ne peut pas être supprimée car elle a des récoltes associées. La suppression en cascade a échoué.";
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

// ── Récoltes ───────────────────────────────────────────────────────────────

export async function addRecolteAction(
  data: any,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    const recolte = await db.recolte.create({
      data: {
        date: new Date(data.dateRecolte),
        quantite: parseFloat(data.quantiteReelle),
        cultureId: parseInt(data.cultureId),
      },
      include: {
        culture: {
          include: {
            terrain: {
              include: {
                ferme: {
                  include: {
                    agriculteur: true // ✅ Correction
                  }
                }
              }
            }
          }
        }
      }
    });

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;

    // Notifier le système
    await notifyAllSystemUsers(
      "🌾 Nouvelle récolte",
      `Une nouvelle récolte (${recolte.quantite} kg) a été enregistrée.`,
      acteurNom
    );

    try {
      const proprietaire = recolte.culture?.terrain?.ferme?.agriculteur;
      if (proprietaire && proprietaire.id !== acteurId) {
        await createNotificationForUser(
          proprietaire.id,
          "🌾 Récolte enregistrée",
          `${acteurNom ?? "Un utilisateur"} a enregistré une récolte (${recolte.quantite} kg) pour la culture "${recolte.culture?.nom}".`
        );
      }
    } catch (notifError) {
      console.error("Erreur notification agriculteur:", notifError);
    }

    revalidatePath(`/dashboard/cultures/${data.cultureId}`);
    revalidatePath("/dashboard/cultures");
    revalidatePath("/dashboard/recoltes");
    return { success: true, data: recolte };
  } catch (error: any) {
    console.error("addRecolteAction:", error);
    return { success: false, error: "Erreur lors de l'ajout de la récolte." };
  }
}

export async function deleteRecolteAction(
  id: number,
  cultureId: number,
  acteurId?: number
): Promise<ActionResponse> {
  try {
    // Récupérer les infos de la récolte avant suppression
    const recolte = await db.recolte.findUnique({
      where: { id },
      select: { quantite: true }
    });

    await db.recolte.delete({
      where: { id }
    });

    const acteurNom = acteurId ? await getUserFullName(acteurId) : undefined;
    await notifyAllSystemUsers(
      "🗑️ Récolte supprimée",
      `Une récolte de ${recolte?.quantite || ''} kg a été supprimée.`,
      acteurNom
    );

    revalidatePath(`/dashboard/cultures/${cultureId}`);
    revalidatePath("/dashboard/cultures");
    revalidatePath("/dashboard/recoltes");
    return { success: true };
  } catch (error: any) {
    console.error("deleteRecolteAction:", error);
    return { success: false, error: "Erreur lors de la suppression de la récolte." };
  }
}

// ── Lecture ────────────────────────────────────────────────────────────────

export async function getCultureByIdAction(id: number): Promise<ActionResponse> {
  try {
    const culture = await db.culture.findUnique({
      where: { id },
      include: {
        categorie: true,
        terrain: {
          include: {
            ferme: {
              include: {
                agriculteur: true // ✅ Correction
              }
            }
          }
        },
        recoltes: {
          orderBy: { date: 'desc' }
        }
      }
    });
    
    if (!culture) {
      return { success: false, error: "Culture non trouvée." };
    }
    return { success: true, data: culture };
  } catch (error: any) {
    console.error("getCultureByIdAction:", error);
    return { success: false, error: "Erreur lors de la récupération de la culture." };
  }
}

export async function getCulturesByFermeAction(fermeId: number): Promise<ActionResponse> {
  try {
    const cultures = await db.culture.findMany({
      where: {
        terrain: {
          fermeId: fermeId
        }
      },
      include: {
        categorie: true,
        terrain: {
          include: {
            ferme: {
              include: {
                agriculteur: true // ✅ Correction
              }
            }
          }
        },
        recoltes: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { datePlantation: 'desc' }
    });
    
    return { success: true, data: cultures };
  } catch (error: any) {
    console.error("getCulturesByFermeAction:", error);
    return { success: false, error: "Erreur lors de la récupération des cultures." };
  }
}

export async function getAllCulturesAction(): Promise<ActionResponse> {
  try {
    const cultures = await db.culture.findMany({
      include: {
        categorie: true,
        terrain: {
          include: {
            ferme: {
              include: {
                agriculteur: true // ✅ Correction
              }
            }
          }
        },
        recoltes: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { datePlantation: 'desc' }
    });
    
    return { success: true, data: cultures };
  } catch (error: any) {
    console.error("getAllCulturesAction:", error);
    return { success: false, error: "Erreur lors de la récupération des cultures." };
  }
}

export async function getCulturesByTerrainAction(terrainId: number): Promise<ActionResponse> {
  try {
    const cultures = await db.culture.findMany({
      where: { terrainId },
      include: {
        categorie: true,
        terrain: {
          include: {
            ferme: {
              include: {
                agriculteur: true // ✅ Correction
              }
            }
          }
        },
        recoltes: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { datePlantation: 'desc' }
    });
    return { success: true, data: cultures };
  } catch (error: any) {
    console.error("getCulturesByTerrainAction:", error);
    return { success: false, error: "Erreur lors de la récupération des cultures." };
  }
}