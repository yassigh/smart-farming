// actions/predictionIA.ts
"use server";

import { db } from "@/lib/db";
import { SimpleAIService } from "@/lib/ai/simpleAIService";
import { revalidatePath } from "next/cache";
import { notifyAllSystemUsers, getUserFullName } from "./notification";

const aiService = new SimpleAIService();

/**
 * Génère toutes les prédictions pour une ferme
 */
export async function generateAllPredictions(fermeId: number, userId: number) {
  try {
    const analysis = await aiService.generateFullAnalysis(fermeId);
    
    if (!analysis) {
      return { success: false, error: "Ferme non trouvée" };
    }

    // Sauvegarder chaque prédiction
    const savedPredictions = [];
    for (const pred of analysis.predictions) {
      const saved = await db.prediction.create({
        data: {
          type: pred.type,
          resultat: pred.resultat,
          confiance: pred.confiance,
          fermeId: fermeId,
          createdById: userId,
        },
      });

      // Sauvegarder la recommandation
      if (pred.recommandation) {
        await db.conseil.create({
          data: {
            description: pred.recommandation,
            predictionId: saved.id,
            date: new Date(),
          },
        });
      }

      savedPredictions.push({ ...saved, ...pred });
    }

    // Notification
    const user = await db.utilisateur.findUnique({ where: { id: userId } });
    await notifyAllSystemUsers(
      "🤖 Analyse IA générée",
      `Une analyse complète de la ferme a été réalisée avec ${analysis.predictions.length} prédictions.`,
      user ? `${user.prenom} ${user.nom}` : undefined
    );

    revalidatePath("/dashboard/predictions");
    
    return { 
      success: true, 
      data: {
        ...analysis,
        savedPredictions,
      }
    };
  } catch (error) {
    console.error("Erreur génération IA:", error);
    return { success: false, error: "Erreur lors de la génération" };
  }
}

/**
 * Récupère le score de santé d'une ferme
 */
export async function getFarmHealthScore(fermeId: number) {
  try {
    const ferme = await db.ferme.findUnique({
      where: { id: fermeId },
      include: {
        terrains: {
          include: {
            cultures: true,
            animaux: true,
          },
        },
        depenses: true,
        revenus: true,
      },
    });
    
    if (!ferme) return { success: false, error: "Ferme non trouvée" };
    
    // Utiliser le service IA
    const healthScore = await aiService['calculateHealthScore'](ferme);
    return { success: true, data: healthScore };
  } catch (error) {
    console.error("Erreur calcul score:", error);
    return { success: false, error: "Erreur de calcul" };
  }
}

/**
 * Répond à une question de l'assistant
 */
export async function askAssistant(fermeId: number, question: string) {
  try {
    const reponse = await aiService.askQuestion(fermeId, question);
    return { success: true, data: reponse };
  } catch (error) {
    console.error("Erreur assistant:", error);
    return { success: false, error: "Erreur de réponse" };
  }
}