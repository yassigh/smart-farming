"use client";

import { useState } from "react";
import { addRevenuAction } from "@/actions/revenu";
import {
  Milk,
  Wheat,
  Rabbit,
  HandCoins,
  Egg,
  Tent,
  Store,
  Plus,
  Calendar,
  Building,
  Tag,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Check,
  TrendingUp,
} from "lucide-react";

const SOURCES_REVENU = [
  { value: "VENTE_LAIT", label: "Vente de lait", icon: <Milk size={16} /> },
  { value: "VENTE_RECOLTES", label: "Vente de récoltes", icon: <Wheat size={16} /> },
  { value: "VENTE_ANIMAUX", label: "Vente d'animaux", icon: <Rabbit size={16} /> },
  { value: "SUBVENTIONS", label: "Subventions agricoles", icon: <HandCoins size={16} /> },
  { value: "VENTE_OEUFS", label: "Vente d'œufs", icon: <Egg size={16} /> },
  { value: "AGROTOURISME", label: "Agrotourisme", icon: <Tent size={16} /> },
  { value: "AUTRE", label: "Autre", icon: <Store size={16} /> },
];

interface AddRevenuFormProps {
  fermes: { id: number; nom: string }[];
  userId: number;
}

export default function AddRevenuForm({ fermes, userId }: AddRevenuFormProps) {
  const [montant, setMontant] = useState("");
  const [source, setSource] = useState(SOURCES_REVENU[0].value);
  const [description, setDescription] = useState("");
  const [fermeId, setFermeId] = useState(fermes[0]?.id?.toString() ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await addRevenuAction({
      montant: parseFloat(montant),
      source,
      description: description || undefined,
      fermeId: parseInt(fermeId),
      createdById: userId,
      date: new Date(date),
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: "Revenu enregistré avec succès !" });
      setMontant("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    } else {
      setMessage({ type: "error", text: res.error || "Une erreur est survenue." });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-emerald-50 rounded-lg">
          <TrendingUp size={18} className="text-emerald-600" />
        </div>
        <h2 className="font-semibold text-gray-900">Nouveau Revenu</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ferme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ferme <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              required
              value={fermeId}
              onChange={(e) => setFermeId(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
            >
              {fermes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Source du revenu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
            >
              {SOURCES_REVENU.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Montant + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Montant (DZD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
          </label>
          <div className="relative">
            <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
              placeholder="Détails supplémentaires..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || fermes.length === 0}
          className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Check size={18} />
          {loading ? "Enregistrement..." : "Enregistrer le revenu"}
        </button>

        {fermes.length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Vous devez d'abord créer une ferme.
            </p>
          </div>
        )}

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            )}
            <p
              className={`text-sm font-medium ${
                message.type === "success" ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}