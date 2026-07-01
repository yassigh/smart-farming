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
      setMessage({ type: "success", text: "Prédiction générée et enregistrée !" });
      setResultat("");
      setConfiance("");
    } else {
      setMessage({ type: "error", text: res.error || "Une erreur est survenue." });
    }
  };

  const selectedIcon = TYPES_PREDICTION.find(t => t.value === type)?.icon || FaChartLine;
  const SelectedIcon = selectedIcon;

  return (
    <div className="w-full p-8 bg-[#FFF3DA] border border-[#FFC490]/30 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#FFC490]/30 flex items-center justify-center text-[#3C6C5F] text-xl">
          <FaMagic />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#29453E]">
            Générer une Prédiction
          </h2>
          <p className="text-xs text-[#3C6C5F]/70">
            Basée sur vos données agricoles
          </p>
        </div>
      </div>

      <div className="my-4 p-3 rounded-xl bg-[#FFC490]/20 border border-[#FFC490]/40 text-xs text-[#29453E] flex items-start gap-2">
        <FaLightbulb className="text-[#3C6C5F] mt-0.5 flex-shrink-0" />
        <span>L'IA analysera vos données de ferme pour générer une prédiction. Vous pouvez aussi saisir manuellement un résultat.</span>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        {/* Ferme */}
        <div>
          <label className="block text-sm font-medium text-[#29453E] mb-1.5">
            Ferme <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBuilding className="text-[#3C6C5F]" />
            </div>
            <select
              required
              value={fermeId}
              onChange={(e) => setFermeId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#FFC490]/50 text-[#29453E] focus:ring-2 focus:ring-[#3C6C5F]/20 focus:border-[#3C6C5F] outline-none transition-all"
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
          <label className="block text-sm font-medium text-[#29453E] mb-1.5">
            Type de prédiction <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SelectedIcon className="text-[#3C6C5F]" />
            </div>
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#FFC490]/50 text-[#29453E] focus:ring-2 focus:ring-[#3C6C5F]/20 focus:border-[#3C6C5F] outline-none transition-all"
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
          <label className="block text-sm font-medium text-[#29453E] mb-1.5">
            Résultat / Analyse <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={resultat}
            onChange={(e) => setResultat(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#FFC490]/50 text-[#29453E] focus:ring-2 focus:ring-[#3C6C5F]/20 focus:border-[#3C6C5F] outline-none transition-all resize-none"
            placeholder="Ex: Rendement estimé à 4.2 tonnes/ha pour cette saison..."
          />
        </div>

        {/* Score de confiance */}
        <div>
          <label className="block text-sm font-medium text-[#29453E] mb-1.5">
            Score de confiance (%)
            <span className="text-[#3C6C5F]/60 text-xs ml-1">(optionnel, 0–100)</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={confiance}
            onChange={(e) => setConfiance(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#FFC490]/50 text-[#29453E] focus:ring-2 focus:ring-[#3C6C5F]/20 focus:border-[#3C6C5F] outline-none transition-all"
            placeholder="85"
          />
          {confiance && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#FFC490]/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    parseFloat(confiance) >= 80
                      ? "bg-[#3C6C5F]"
                      : parseFloat(confiance) >= 50
                      ? "bg-[#9DAE7A]"
                      : "bg-[#FFC490]"
                  }`}
                  style={{ width: `${Math.min(parseFloat(confiance), 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-[#29453E] w-10">
                {confiance}%
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || fermes.length === 0}
          className="w-full py-3 px-4 rounded-lg bg-[#3C6C5F] text-white font-medium hover:bg-[#29453E] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-[#3C6C5F]/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>Génération en cours...</>
          ) : (
            <>
              <FaRocket className="text-white" />
              Générer la prédiction
            </>
          )}
        </button>

        {fermes.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-[#3C6C5F] justify-center">
            <FaExclamationTriangle className="text-[#FFC490]" />
            <span>Vous devez d'abord créer une ferme.</span>
          </div>
        )}

        {message && (
          <div
            className={`p-3.5 rounded-lg text-sm font-medium border flex items-start gap-2 ${
              message.type === "success"
                ? "bg-[#9DAE7A]/20 text-[#29453E] border-[#9DAE7A]/40"
                : "bg-[#FFC490]/20 text-[#29453E] border-[#FFC490]/40"
            }`}
          >
            {message.type === "success" ? (
              <FaCheckCircle className="text-[#3C6C5F] mt-0.5 flex-shrink-0" />
            ) : (
              <FaTimesCircle className="text-[#FFC490] mt-0.5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}