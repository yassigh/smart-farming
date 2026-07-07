// models/message.ts
import { db } from "@/lib/db";

export const MessageModel = {
  // Récupérer la conversation entre deux utilisateurs
  async getConversation(userId1: number, userId2: number) {
    return db.message.findMany({
      where: {
        OR: [
          { expediteurId: userId1, destinataireId: userId2 },
          { expediteurId: userId2, destinataireId: userId1 },
        ],
      },
      include: {
        expediteur: {
          select: { id: true, nom: true, prenom: true, image: true, role: true },
        },
        destinataire: {
          select: { id: true, nom: true, prenom: true, image: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  // Envoyer un message
  async send(expediteurId: number, destinataireId: number, contenu: string) {
    return db.message.create({
      data: { expediteurId, destinataireId, contenu },
      include: {
        expediteur: {
          select: { id: true, nom: true, prenom: true, image: true, role: true },
        },
        destinataire: {
          select: { id: true, nom: true, prenom: true, image: true, role: true },
        },
      },
    });
  },

  // Marquer les messages comme lus
  async markAsRead(destinataireId: number, expediteurId: number) {
    return db.message.updateMany({
      where: { destinataireId, expediteurId, lu: false },
      data: { lu: true },
    });
  },

  // Nombre de messages non lus pour un utilisateur
  async getUnreadCount(userId: number) {
    return db.message.count({
      where: { destinataireId: userId, lu: false },
    });
  },

  // Derniers interlocuteurs (pour une liste de conversations)
  async getInterlocuteurs(userId: number) {
    const messages = await db.message.findMany({
      where: {
        OR: [{ expediteurId: userId }, { destinataireId: userId }],
      },
      include: {
        expediteur: {
          select: { id: true, nom: true, prenom: true, image: true, role: true },
        },
        destinataire: {
          select: { id: true, nom: true, prenom: true, image: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Dédupliquer par interlocuteur
    const seen = new Set<number>();
    const conversations = [];
    for (const msg of messages) {
      const otherId =
        msg.expediteurId === userId ? msg.destinataireId : msg.expediteurId;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push(msg);
      }
    }
    return conversations;
  },
};
