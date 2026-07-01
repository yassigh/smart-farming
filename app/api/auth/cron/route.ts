// app/api/cron/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotificationForUser } from "@/actions/notification";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // Vérifier la clé secrète
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier les présences du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Trouver les utilisateurs qui ont déjà enregistré leur présence aujourd'hui
    const usersWithPresence = await db.presence.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      select: { utilisateurId: true }
    });

    const userIdsWithPresence = usersWithPresence.map(p => p.utilisateurId);

    // Trouver les utilisateurs sans présence
    const usersWithoutPresence = await db.utilisateur.findMany({
      where: {
        id: { notIn: userIdsWithPresence },
        role: { 
          in: [Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] 
        }
      },
      select: {
        id: true,
        prenom: true,
        nom: true,
        role: true
      }
    });

    // Envoyer des rappels
    let remindersSent = 0;
    const errors = [];

    for (const user of usersWithoutPresence) {
      try {
        const result = await createNotificationForUser(
          user.id,
          "⚠️ Rappel de présence",
          `Bonjour ${user.prenom} ${user.nom}, n'oubliez pas d'enregistrer votre présence pour aujourd'hui ${new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}.`
        );
        
        if (result.success) {
          remindersSent++;
        } else {
          errors.push({ userId: user.id, error: result.error });
        }
      } catch (userError) {
        errors.push({ userId: user.id, error: String(userError) });
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      totalUsers: usersWithoutPresence.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erreur cron:", error);
    return NextResponse.json({ 
      success: false,
      error: "Erreur serveur", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}