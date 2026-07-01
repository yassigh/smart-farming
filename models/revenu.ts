import { db } from "@/lib/db";

export interface CreateRevenuInput {
  date: Date;
  montant: number;
  source: string;
  description?: string;
  fermeId: number;
  createdById: number;
}

export const RevenuModel = {
  async getAll() {
    return db.revenu.findMany({
      orderBy: { date: "desc" },
      include: { ferme: true, createdBy: true },
    });
  },

  async getByFerme(fermeId: number) {
    return db.revenu.findMany({
      where: { fermeId },
      orderBy: { date: "desc" },
      include: { ferme: true, createdBy: true },
    });
  },

  async getByUser(createdById: number) {
    return db.revenu.findMany({
      where: { createdById },
      orderBy: { date: "desc" },
      include: { ferme: true, createdBy: true },
    });
  },

  async create(data: CreateRevenuInput) {
    return db.revenu.create({ data });
  },

  async update(id: number, data: Partial<CreateRevenuInput>) {
    return db.revenu.update({ where: { id }, data });
  },

  async delete(id: number) {
    return db.revenu.delete({ where: { id } });
  },

  /** Total agrégé pour un tableau de bord */
  async getTotalByFerme(fermeId: number) {
    const result = await db.revenu.aggregate({
      where: { fermeId },
      _sum: { montant: true },
    });
    return result._sum.montant ?? 0;
  },
};
