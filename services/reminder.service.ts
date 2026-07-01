// services/reminder.service.ts
import { db } from "@/lib/db";
import { createNotificationForUser } from "@/actions/notification";

export class ReminderService {
  static async checkAndSendReminders() {
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // Vérifier les rappels de vaccination
    const vaccinations = await db.vaccination.findMany({
      where: {
        dateRappel: {
          gte: today,
          lte: sevenDaysLater,
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

    // Vérifier les traitements en cours
    const treatments = await db.traitement.findMany({
      where: {
        dateFin: {
          gte: today,
          lte: sevenDaysLater,
        },
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

    // Envoyer les notifications
    for (const vacc of vaccinations) {
      if (!vacc.dateRappel) continue;
      
      const daysUntil = Math.ceil((vacc.dateRappel.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const urgency = daysUntil <= 1 ? "⚠️ URGENT" : daysUntil <= 3 ? "🔔 Rappel" : "📅 À venir";
      
      const message = `${urgency} : Vaccination ${vacc.nomVaccin} pour l'animal ${vacc.animal.numero} (${vacc.animal.type}) - Rappel le ${vacc.dateRappel.toLocaleDateString('fr-FR')}`;
      
      if (vacc.veterinaireId) {
        await createNotificationForUser(
          vacc.veterinaireId,
          `💉 Rappel de vaccination - ${urgency}`,
          message
        );
      }
      
      if (vacc.animal.terrain.ferme.agriculteurId) {
        await createNotificationForUser(
          vacc.animal.terrain.ferme.agriculteurId,
          `💉 Rappel de vaccination - ${urgency}`,
          message
        );
      }
    }

    for (const treat of treatments) {
      if (!treat.dateFin) continue;
      
      const daysUntil = Math.ceil((treat.dateFin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const urgency = daysUntil <= 1 ? "⚠️ URGENT" : daysUntil <= 3 ? "🔔 Rappel" : "📅 À venir";
      
      const message = `${urgency} : Traitement "${treat.medicament}" pour l'animal ${treat.animal.numero} (${treat.animal.type}) - Fin prévue le ${treat.dateFin.toLocaleDateString('fr-FR')}`;
      
      if (treat.veterinaireId) {
        await createNotificationForUser(
          treat.veterinaireId,
          `💊 Rappel de traitement - ${urgency}`,
          message
        );
      }
      
      if (treat.animal.terrain.ferme.agriculteurId) {
        await createNotificationForUser(
          treat.animal.terrain.ferme.agriculteurId,
          `💊 Rappel de traitement - ${urgency}`,
          message
        );
      }
    }

    return {
      success: true,
      vaccinationsSent: vaccinations.length,
      treatmentsSent: treatments.length,
    };
  }
}