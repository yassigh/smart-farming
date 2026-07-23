// models/predictionIA.ts
export type TypePrediction = 
  | "RENDEMENT"
  | "REVENUS" 
  | "DEPENSES"
  | "MALADIE"
  | "METEO"
  | "IRRIGATION"
  | "RECOLTE";

export type NiveauRisque = "FAIBLE" | "MOYEN" | "ELEVE";

export interface PredictionIA {
  resultat: string;
  confiance: number;
  recommandation?: string;
  risque?: NiveauRisque;
  facteurs?: string[];
}

export interface FarmHealthScore {
  score: number;
  niveau: "EXCELLENT" | "BON" | "MOYEN" | "FAIBLE";
  details: {
    rendement: number;
    animaux: number;
    finances: number;
  };
  recommandations: string[];
}

export interface AnalyseComplete {
  healthScore: FarmHealthScore;
  predictions: Array<PredictionIA & { type: string; id?: number }>;
  resume: string;
}