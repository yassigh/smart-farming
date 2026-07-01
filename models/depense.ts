import { db } from "@/lib/db";

export interface CreateDepenseInput {
  date: Date;
  montant: number;
  type: string;
  description?: string;
  fermeId: number;
  createdById: number;
}

export const DepenseModel = {
  async getAll() {
  return db.depense.findMany({
    orderBy: {
      date: "desc",
    },
    include: {
      ferme: true,
      createdBy: true,
    },
  });
},

  async getByFerme(fermeId: number) {
    return db.depense.findMany({
      where: { fermeId },
      orderBy: { date: "desc" },
      include: { ferme: true, createdBy: true },
    });
  },

  async getByUser(userId: number) {
  return db.depense.findMany({
    where: {
      createdById: userId,
    },
    orderBy: {
      date: "desc",
    },
    include: {
      ferme: true,
      createdBy: true,
    },
  });
},

  async create(data: CreateDepenseInput) {
    return db.depense.create({ data });
  },

  async update(id: number, data: Partial<CreateDepenseInput>) {
    return db.depense.update({ where: { id }, data });
  },

  async delete(id: number) {
    return db.depense.delete({ where: { id } });
  },

  /** Totaux agrégés pour un tableau de bord */
  async getTotalByFerme(fermeId: number) {
    const result = await db.depense.aggregate({
      where: { fermeId },
      _sum: { montant: true },
    });
    return result._sum.montant ?? 0;
  },
};
