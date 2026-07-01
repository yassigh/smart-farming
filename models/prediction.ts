import { db } from "@/lib/db";

export type TypePrediction =
  | "RENDEMENT_CULTURE"
  | "REVENUS"
  | "DEPENSES"
  | "MALADIE_ANIMAL"
  | "METEO"
  | "AUTRE";

export interface CreatePredictionInput {
  type: TypePrediction | string;
  resultat: string;
  confiance?: number;
  fermeId: number;
  createdById: number;
}

export const PredictionModel = {
  async getAll() {
    return db.prediction.findMany({
      orderBy: { date: "desc" },
      include: { ferme: true, createdBy: true, conseils: true },
    });
  },

  async getByFerme(fermeId: number) {
    return db.prediction.findMany({
      where: { fermeId },
      orderBy: { date: "desc" },
      include: { ferme: true, createdBy: true, conseils: true },
    });
  },

  async getByUser(createdById: number) {
    return db.prediction.findMany({
      where: { createdById },
      orderBy: { date: "desc" },
      include: { ferme: true, createdBy: true, conseils: true },
    });
  },

  async create(data: CreatePredictionInput) {
    return db.prediction.create({ data });
  },

  async delete(id: number) {
    return db.prediction.delete({ where: { id } });
  },
};
