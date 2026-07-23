// models/presence.ts

import { db } from "@/lib/db";
import { StatutPresence } from "@prisma/client";

export const PresenceModel = {
  /**
   * Fetch all presence records for today (calendar day)
   */
  async getAllToday() {
    const today = new Date();
    const start = new Date(today);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setUTCHours(23, 59, 59, 999);

    return await db.presence.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  },

  /**
   * Fetch all presence records for a specific date
   */
  async getByDate(date: Date) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    return await db.presence.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  },

  /**
   * Fetch full presence history for a user, sorted newest to oldest
   */
  async getByUtilisateur(userId: number) {
    return await db.presence.findMany({
      where: { utilisateurId: userId },
      orderBy: { date: "desc" },
    });
  },

  /**
   * Create or update (upsert style) presence for a user on a given date
   */
  async savePresence(userId: number, date: Date, statut: StatutPresence, paye: boolean) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    // Check if there is already a presence record for this user on this day
    const existing = await db.presence.findFirst({
      where: {
        utilisateurId: userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    if (existing) {
      return await db.presence.update({
        where: { id: existing.id },
        data: {
          statut,
          paye,
        },
      });
    } else {
      return await db.presence.create({
        data: {
          utilisateurId: userId,
          date,
          statut,
          paye,
        },
      });
    }
  },

  /**
   * Update the medical certificate URL for a presence record
   */
  async updateCertificat(presenceId: number, certificatUrl: string) {
    return await db.presence.update({
      where: { id: presenceId },
      data: {
        certificatMedical: certificatUrl,
      },
    });
  },

  /**
   * Get the count of days worked (status PRESENT) for a user in the current month
   */
  async getWorkedDaysCountInMonth(userId: number, year: number, month: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return await db.presence.count({
      where: {
        utilisateurId: userId,
        statut: "PRESENT",
        date: {
          gte: start,
          lte: end,
        },
      },
    });
  },

  /**
   * Get overall monthly stats for a user
   */
  async getMonthlyStats(userId: number, year: number, month: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const presences = await db.presence.findMany({
      where: {
        utilisateurId: userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const stats = {
      present: 0,
      absent: 0,
      malade: 0,
    };

    presences.forEach((p) => {
      if (p.statut === StatutPresence.PRESENT) stats.present++;
      else if (p.statut === StatutPresence.ABSENT) stats.absent++;
      else if (p.statut === StatutPresence.MALADE) stats.malade++;
    });

    return stats;
  },

  /**
   * Get worked days count for a user up to a specific date
   */
  async getWorkedDaysUpToDate(userId: number, date: Date) {
    const targetDate = new Date(date);
    targetDate.setUTCHours(23, 59, 59, 999);

    return await db.presence.count({
      where: {
        utilisateurId: userId,
        statut: StatutPresence.PRESENT,
        date: {
          lte: targetDate,
        },
      },
    });
  },

  /**
   * Get worked days for all users up to a specific date
   */
  async getAllWorkedDaysUpToDate(date: Date) {
    const targetDate = new Date(date);
    targetDate.setUTCHours(23, 59, 59, 999);

    const users = await db.utilisateur.findMany({
      select: { id: true },
    });

    const workedDaysMap: Record<number, number> = {};
    for (const user of users) {
      const count = await db.presence.count({
        where: {
          utilisateurId: user.id,
          statut: StatutPresence.PRESENT,
          date: {
            lte: targetDate,
          },
        },
      });
      workedDaysMap[user.id] = count;
    }

    return workedDaysMap;
  },
};