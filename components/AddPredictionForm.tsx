// components/AddPredictionForm.tsx - Version avec palette APP
"use client";

import { useState } from "react";
import { addPredictionAction } from "@/actions/prediction";
import { 
  FaTractor, 
  FaCoins, 
  FaMoneyBillWave, 
  FaPaw, 
  FaCloudSun, 
  FaChartLine,
  FaBuilding,
  FaMagic,
  FaLightbulb,
  FaExclamationTriangle,
  FaRocket,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const TYPES_PREDICTION = [
  { value: "RENDEMENT_CULTURE", label: "Prédiction de rendement des cultures", icon: FaTractor },
  { value: "REVENUS", label: "Prédiction des revenus du mois prochain", icon: FaCoins },
  { value: "DEPENSES", label: "Prédiction des dépenses", icon: FaMoneyBillWave },
  { value: "MALADIE_ANIMAL", label: "Détection de maladies animales", icon: FaPaw },
  { value: "METEO", label: "Prédiction météorologique", icon: FaCloudSun },
  { value: "AUTRE", label: "Autre analyse", icon: FaChartLine },
];

interface AddPredictionFormProps {
  fermes: { id: number; nom: string }[];
  userId: number;
}

export default function AddPredictionForm({ fermes, userId }: AddPredictionFormProps) {
  const [type, setType] = useState(TYPES_PREDICTION[0].value);
  const [resultat, setResultat] = useState("");
  const [confiance, setConfiance] = useState("");
  const [fermeId, setFermeId] = useState(fermes[0]?.id?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await addPredictionAction({
      type,
      resultat,
      confiance: confiance ? parseFloat(confiance) : undefined,
      fermeId: parseInt(fermeId),
      createdById: userId,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: "✅ Prédiction générée et enregistrée !" });
      setResultat("");
      setConfiance("");
    } else {
      setMessage({ type: "error", text: res.error || "Une erreur est survenue." });
    }
  };

  const selectedIcon = TYPES_PREDICTION.find(t => t.value === type)?.icon || FaChartLine;
  const SelectedIcon = selectedIcon;

  return (
    <div className="space-y-4">
      {/* Header avec palette APP */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-xl">
          <FaMagic className="text-[#3C6C5F] dark:text-[#9DAE7A]" size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#29453E] dark:text-white">
            Générer une Prédiction
          </h3>
          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">
            Basée sur vos données agricoles
          </p>
        </div>
      </div>

      {/* Info avec palette APP */}
      <div className="p-3 bg-[#FFF3DA] dark:bg-[#2a3f38]/50 rounded-xl border border-[#FFC490]/30 dark:border-[#FFC490]/10 text-xs text-[#29453E] dark:text-[#9DAE7A] flex items-start gap-2">
        <FaLightbulb className="mt-0.5 flex-shrink-0 text-[#D4A574]" />
        <span>L'IA analysera vos données de ferme pour générer une prédiction. Vous pouvez aussi saisir manuellement un résultat.</span>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        {/* Ferme */}
        <div>
          <label className="block text-sm font-medium text-[#29453E] dark:text-[#9DAE7A] mb-1.5">
            Ferme <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBuilding className="text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40" />
            </div>
            <select
              required
              value={fermeId}
              onChange={(e) => setFermeId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#0d1a15] border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent outline-none transition-all"
            >
              {fermes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type de prédiction */}
        <div>
          <label className="block text-sm font-medium text-[#29453E] dark:text-[#9DAE7A] mb-1.5">
            Type de prédiction <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SelectedIcon className="text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40" />
            </div>
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#0d1a15] border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent outline-none transition-all"
            >
              {TYPES_PREDICTION.map((t) => {
                const Icon = t.icon;
                return (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Résultat */}
        <div>
          <label className="block text-sm font-medium text-[#29453E] dark:text-[#9DAE7A] mb-1.5">
            Résultat / Analyse <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={resultat}
            onChange={(e) => setResultat(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#0d1a15] border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent outline-none transition-all resize-none placeholder:text-[#3C6C5F]/40 dark:placeholder:text-[#9DAE7A]/40"
            placeholder="Ex: Rendement estimé à 4.2 tonnes/ha pour cette saison..."
          />
        </div>

        {/* Score de confiance */}
        <div>
          <label className="block text-sm font-medium text-[#29453E] dark:text-[#9DAE7A] mb-1.5">
            Score de confiance (%)
            <span className="text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 text-xs ml-1">(optionnel, 0–100)</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={confiance}
            onChange={(e) => setConfiance(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#0d1a15] border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent outline-none transition-all placeholder:text-[#3C6C5F]/40 dark:placeholder:text-[#9DAE7A]/40"
            placeholder="85"
          />
          {confiance && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    parseFloat(confiance) >= 80
                      ? "bg-[#3C6C5F]"
                      : parseFloat(confiance) >= 50
                      ? "bg-[#D4A574]"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(parseFloat(confiance), 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-[#3C6C5F] dark:text-[#9DAE7A] w-10">
                {confiance}%
              </span>
            </div>
          )}
        </div>

        {/* Bouton avec palette APP */}
        <button
          type="submit"
          disabled={loading || fermes.length === 0}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-medium active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-[#3C6C5F]/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Génération en cours...
            </div>
          ) : (
            <>
              <FaRocket className="text-white" />
              Générer la prédiction
            </>
          )}
        </button>

        {/* Message d'erreur si pas de ferme */}
        {fermes.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-[#D4A574] dark:text-[#FFC490] justify-center">
            <FaExclamationTriangle />
            <span>Vous devez d'abord créer une ferme.</span>
          </div>
        )}

        {/* Messages de succès/erreur avec palette APP */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-sm font-medium border flex items-start gap-2 ${
              message.type === "success"
                ? "bg-[#DDF3E8] dark:bg-[#2a3f38]/50 text-[#29453E] dark:text-[#9DAE7A] border-[#9DAE7A]/30 dark:border-[#9DAE7A]/10"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
            }`}
          >
            {message.type === "success" ? (
              <FaCheckCircle className="mt-0.5 flex-shrink-0 text-[#3C6C5F]" />
            ) : (
              <FaTimesCircle className="mt-0.5 flex-shrink-0 text-red-500" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}