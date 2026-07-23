// actions/notification.ts
"use server";

import { db } from "@/lib/db";
import { Role } from "@prisma/client";

//  Nouvelle fonction pour récupérer le nom complet d'un utilisateur
export async function getUserFullName(userId: number): Promise<string | null> {
  try {
    const user = await db.utilisateur.findUnique({
      where: { id: userId },
      select: { prenom: true, nom: true }
    });
    if (!user) return null;
    return `${user.prenom} ${user.nom}`;
  } catch (error) {
    console.error("Erreur récupération nom utilisateur:", error);
    return null;
  }
}

// Créer une notification pour un utilisateur spécifique
export async function createNotificationForUser(
  utilisateurId: number,
  titre: string,
  message: string,
  acteurNom?: string | null,
  acteurId?: number
) {
  try {
    // Formater le message avec le nom de l'acteur si fourni
    let finalActeurNom = acteurNom;
    if (!finalActeurNom) {
      finalActeurNom = await getActeurNomFromSession();
    }

    let formattedMessage = message;
    if (finalActeurNom) {
      formattedMessage = `👤 Par ${finalActeurNom} — ${message}`;
    }

    const notification = await db.notification.create({
      data: {
        titre,
        message: formattedMessage,
        statut: "NON_LUE",
        utilisateurId,
        dateEnvoi: new Date()
      }
    });
    return { success: true, notification };
  } catch (error) {
    console.error("Erreur création notification:", error);
    return { success: false, error };
  }
}

// Créer des notifications pour tous les AGRICULTEURS
export async function notifyAllAgriculteurs(
  titre: string,
  message: string,
  acteurNom?: string | null,
  acteurId?: number
) {
  try {
    const agriculteurs = await db.utilisateur.findMany({
      where: { role: Role.AGRICULTEUR }
    });

    if (agriculteurs.length === 0) return { success: true, count: 0 };

    // Formater le message avec le nom de l'acteur
    let finalActeurNom = acteurNom;
    if (!finalActeurNom) {
      finalActeurNom = await getActeurNomFromSession();
    }

    let formattedMessage = message;
    if (finalActeurNom) {
      formattedMessage = `👤 Par ${finalActeurNom} — ${message}`;
    }

    const notifications = await db.$transaction(
      agriculteurs.map((user) =>
        db.notification.create({
          data: {
            titre,
            message: formattedMessage,
            statut: "NON_LUE",
            utilisateurId: user.id,
            dateEnvoi: new Date()
          }
        })
      )
    );

    return { success: true, count: notifications.length };
  } catch (error) {
    console.error("Erreur notification agriculteurs:", error);
    return { success: false, error };
  }
}

// Créer des notifications pour tous les VÉTÉRINAIRES
export async function notifyAllVeterinaires(
  titre: string,
  message: string,
  acteurNom?: string | null
) {
  try {
    const veterinaires = await db.utilisateur.findMany({
      where: { role: Role.VETERINAIRE }
    });

    if (veterinaires.length === 0) return { success: true, count: 0 };

    // Formater le message avec le nom de l'acteur
    let finalActeurNom = acteurNom;
    if (!finalActeurNom) {
      finalActeurNom = await getActeurNomFromSession();
    }

    let formattedMessage = message;
    if (finalActeurNom) {
      formattedMessage = `👤 Par ${finalActeurNom} — ${message}`;
    }

    const notifications = await db.$transaction(
      veterinaires.map((user) =>
        db.notification.create({
          data: {
            titre,
            message: formattedMessage,
            statut: "NON_LUE",
            utilisateurId: user.id,
            dateEnvoi: new Date()
          }
        })
      )
    );

    return { success: true, count: notifications.length };
  } catch (error) {
    console.error("Erreur notification veterinaires:", error);
    return { success: false, error };
  }
}

import { cookies } from "next/headers";

async function getActeurNomFromSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("session_user_id")?.value;
    if (sessionUserId) {
      return await getUserFullName(parseInt(sessionUserId));
    }
  } catch (error) {
    console.error("Erreur lecture session pour notification:", error);
  }
  return null;
}

// Créer des notifications pour des rôles spécifiques
export async function notifyRoles(
  roles: Role[],
  titre: string,
  message: string,
  acteurNom?: string | null
) {
  try {
    const users = await db.utilisateur.findMany({
      where: { role: { in: roles } }
    });

    if (users.length === 0) return { success: true, count: 0 };

    let finalActeurNom = acteurNom;
    if (!finalActeurNom) {
      finalActeurNom = await getActeurNomFromSession();
    }

    let formattedMessage = message;
    if (finalActeurNom) {
      formattedMessage = `👤 Par ${finalActeurNom} — ${message}`;
    }

    const notifications = await db.$transaction(
      users.map((user) =>
        db.notification.create({
          data: {
            titre,
            message: formattedMessage,
            statut: "NON_LUE",
            utilisateurId: user.id,
            dateEnvoi: new Date()
          }
        })
      )
    );

    return { success: true, count: notifications.length };
  } catch (error) {
    console.error("Erreur notification rôles:", error);
    return { success: false, error };
  }
}

// Créer des notifications pour TOUS les utilisateurs du système
export async function notifyAllSystemUsers(
  titre: string,
  message: string,
  acteurNom?: string | null
) {
  return notifyRoles([Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE], titre, message, acteurNom);
}

// Récupérer les notifications d'un utilisateur
export async function getUserNotifications(utilisateurId: number) {
  try {
    const notifications = await db.notification.findMany({
      where: { utilisateurId },
      orderBy: { dateEnvoi: "desc" },
      take: 50
    });

    const unreadCount = await db.notification.count({
      where: { 
        utilisateurId,
        statut: "NON_LUE"
      }
    });

    return {
      success: true,
      notifications,
      unreadCount
    };
  } catch (error) {
    console.error("Erreur récupération notifications:", error);
    return { success: false, error };
  }
}

// Marquer une notification comme lue
export async function markNotificationAsRead(notificationId: number) {
  try {
    const notification = await db.notification.update({
      where: { id: notificationId },
      data: { statut: "LUE" }
    });
    return { success: true, notification };
  } catch (error) {
    console.error("Erreur mise à jour notification:", error);
    return { success: false, error };
  }
}

// Marquer toutes les notifications comme lues
export async function markAllNotificationsAsRead(utilisateurId: number) {
  try {
    const result = await db.notification.updateMany({
      where: { 
        utilisateurId,
        statut: "NON_LUE"
      },
      data: { statut: "LUE" }
    });
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Erreur mise à jour notifications:", error);
    return { success: false, error };
  }
}