// components/AddDepenseForm.tsx

"use client";

import { useState } from "react";
import { addDepenseAction } from "@/actions/depense";
import {
  Sprout,
  Package,
  Rabbit,
  Users,
  Syringe,
  Wrench,
  Fuel,
  Store,
  Calendar,
  Building,
  DollarSign,
  FileText,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react";

const TYPES_DEPENSE = [
  { value: "SEMENCES", label: "Semences", icon: <Sprout size={14} /> },
  { value: "ENGRAIS", label: "Engrais", icon: <Package size={14} /> },
  { value: "NOURRITURE_ANIMAUX", label: "Nourriture", icon: <Rabbit size={14} /> },
  { value: "SALAIRES", label: "Salaires", icon: <Users size={14} /> },
  { value: "MEDICAMENTS", label: "Médicaments", icon: <Syringe size={14} /> },
  { value: "EQUIPEMENT", label: "Équipement", icon: <Wrench size={14} /> },
  { value: "CARBURANT", label: "Carburant", icon: <Fuel size={14} /> },
  { value: "AUTRE", label: "Autre", icon: <Store size={14} /> },
];

interface AddDepenseFormProps {
  fermes: { id: number; nom: string }[];
  userId: number;
}

export default function AddDepenseForm({ fermes, userId }: AddDepenseFormProps) {
  const [montant, setMontant] = useState("");
  const [type, setType] = useState(TYPES_DEPENSE[0].value);
  const [description, setDescription] = useState("");
  const [fermeId, setFermeId] = useState(fermes[0]?.id?.toString() ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const res = await addDepenseAction({
      montant: parseFloat(montant),
      type,
      description: description || undefined,
      fermeId: parseInt(fermeId),
      createdById: userId,
      date: new Date(date),
    });

    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setMontant("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Ferme */}
      <div>
        <label className="block text-xs font-medium text-[#3C6C5F] mb-1">
          Ferme
        </label>
        <div className="relative">
          <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
          <select
            required
            value={fermeId}
            onChange={(e) => setFermeId(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8E3DC] bg-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 outline-none transition-all"
          >
            {fermes.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-[#3C6C5F] mb-1">
          Type
        </label>
        <div className="relative">
          <select
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full pl-3 pr-3 py-2 text-sm rounded-xl border border-[#E8E3DC] bg-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 outline-none transition-all"
          >
            {TYPES_DEPENSE.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Montant + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#3C6C5F] mb-1">
            Montant (DT)
          </label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8E3DC] bg-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 outline-none transition-all"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#3C6C5F] mb-1">
            Date
          </label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8E3DC] bg-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-[#3C6C5F] mb-1">
          Description <span className="text-[#3C6C5F]/40">(optionnel)</span>
        </label>
        <div className="relative">
          <FileText size={14} className="absolute left-3 top-2.5 text-[#3C6C5F]/40" />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8E3DC] bg-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 outline-none transition-all"
            placeholder="Détails..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || fermes.length === 0}
        className="w-full py-2.5 rounded-xl bg-[#3C6C5F] text-white font-medium hover:bg-[#29453E] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : success ? (
          <>
            <Check size={16} />
            Enregistré !
          </>
        ) : (
          <>
            <Check size={16} />
            Enregistrer
          </>
        )}
      </button>

      {fermes.length === 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
          <AlertCircle size={14} className="text-amber-600" />
          <p className="text-xs text-amber-700">Créez d'abord une ferme</p>
        </div>
      )}
    </form>
  );
}