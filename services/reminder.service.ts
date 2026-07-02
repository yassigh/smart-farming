// services/reminder.service.ts
import { db } from "@/lib/db";
import { createNotificationForUser } from "@/actions/notification";

export class ReminderService {
  static async checkAndSendReminders() {
    const now = new Date();

    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);

    const endIn7Days = new Date(now);
    endIn7Days.setDate(endIn7Days.getDate() + 7);
    endIn7Days.setHours(23, 59, 59, 999);

    const vaccinations = await db.vaccination.findMany({
      where: {
        dateRappel: {
          gte: startToday,
          lte: endIn7Days,
        },
        statut: "A_JOUR",
      },
      include: {
        animal: {
          include: {
            terrain: {
              include: {
                ferme: {
                  include: {
                    agriculteur: true,
                  },
                },
              },
            },
          },
        },
        veterinaire: true,
      },
    });

    for (const vacc of vaccinations) {
      if (!vacc.dateRappel || !vacc.veterinaireId) continue;

      const reminderDate = new Date(vacc.dateRappel);
      reminderDate.setHours(0, 0, 0, 0);

      const daysUntil = Math.ceil(
        (reminderDate.getTime() - startToday.getTime()) / (1000 * 60 * 60 * 24)
      );

      const urgency =
        daysUntil <= 0 ? "⚠️ Aujourd'hui" : daysUntil <= 1 ? "⚠️ URGENT" : daysUntil <= 3 ? "🔔 Rappel" : "📅 À venir";

      const message = `${urgency} : Vaccination ${vacc.nomVaccin} pour l'animal ${vacc.animal.numero} (${vacc.animal.type}) - Rappel le ${vacc.dateRappel.toLocaleDateString("fr-FR")}`;

      await createNotificationForUser(
        vacc.veterinaireId,
        `💉 Rappel de vaccination - ${urgency}`,
        message
      );
    }

    return {
      success: true,
      vaccinationsSent: vaccinations.length,
    };
  }
}