// actions/message.ts
"use server";

import { MessageModel } from "@/models/message";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(
  expediteurId: number,
  destinataireId: number,
  contenu: string
) {
  try {
    if (!contenu?.trim()) {
      return { success: false, error: "Le message ne peut pas être vide." };
    }
    const message = await MessageModel.send(expediteurId, destinataireId, contenu.trim());
    return { success: true, data: message };
  } catch (error) {
    console.error("Erreur sendMessageAction:", error);
    return { success: false, error: "Erreur lors de l'envoi du message." };
  }
}

export async function getMessagesAction(userId1: number, userId2: number) {
  try {
    const messages = await MessageModel.getConversation(userId1, userId2);
    return { success: true, data: messages };
  } catch (error) {
    console.error("Erreur getMessagesAction:", error);
    return { success: false, error: "Erreur lors de la récupération des messages." };
  }
}

export async function markMessagesReadAction(destinataireId: number, expediteurId: number) {
  try {
    await MessageModel.markAsRead(destinataireId, expediteurId);
    return { success: true };
  } catch (error) {
    console.error("Erreur markMessagesReadAction:", error);
    return { success: false, error: "Erreur lors de la mise à jour." };
  }
}

export async function getUnreadCountAction(userId: number) {
  try {
    const count = await MessageModel.getUnreadCount(userId);
    return { success: true, data: count };
  } catch (error) {
    return { success: false, data: 0 };
  }
}
