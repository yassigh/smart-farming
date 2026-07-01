// components/AddTraitementForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTraitementAction } from "@/actions/animal";
import {
  Stethoscope,
  ArrowLeft,
  Sparkles,
  Calendar,
  Clock,
  Pill,
  FileText,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Syringe,
  HeartPulse
} from "lucide-react";

interface Veterinaire {
  id: number;
  nom: string;
  prenom: string;
}

interface Props {
  animalId: number;
  animalNumero: string;
  veterinaires: Veterinaire[];
  currentVeterinaireId: number;
}

const TYPES_TRAITEMENT = [
  "Antibiotique",
  "Anti-inflammatoire",
  "Antiparasitaire",
  "Soins chirurgicaux",
  "Hydratation",
  "Vitamines / Compléments",
  "Pansement / Soins locaux",
  "Autre",
];

export default function AddTraitementForm({
  animalId,
  animalNumero,
  veterinaires,
  currentVeterinaireId,
}: Props) {
  const router = useRouter();
  const [medicament, setMedicament] = useState("");
  const [description, setDescription] = useState("");
  const [dosage, setDosage] = useState("");
  const [observation, setObservation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateFin, setDateFin] = useState("");
  const [vetId, setVetId] = useState(currentVeterinaireId.toString());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await addTraitementAction({
      medicament,
      description,
      dosage: dosage || undefined,
      observation: observation || undefined,
      date,
      dateFin: dateFin || undefined,
      animalId: animalId.toString(),
      veterinaireId: vetId,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: "Traitement enregistré avec succès !" });
      setTimeout(() => {
        router.push(`/dashboard/animaux/${animalId}`);
        router.refresh();
      }, 1500);
    } else {
      setMessage({ type: "error", text: res.error || "Une erreur est survenue." });
    }
  };

  return (
    <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-8 transition-all hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center shadow-lg shadow-[#3C6C5F]/20">
          <Stethoscope className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
            Nouveau Traitement
            <Sparkles className="w-4 h-4 text-[#FFC490]" />
          </h2>
          <p className="text-sm text-[#3C6C5F]/70">
            Enregistrez un traitement médical pour l'animal
          </p>
        </div>
      </div>

      {/* Info animal */}
      <div className="flex items-center gap-3 p-4 bg-[#FFF3DA] border border-[#FFC490]/30 rounded-2xl mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#3C6C5F]/10 flex items-center justify-center">
          <HeartPulse size={20} className="text-[#3C6C5F]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#29453E]">
            Traitement pour l'animal :{" "}
            <span className="font-bold text-[#3C6C5F]">#{animalNumero}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Détails du traitement */}
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#E8E3DC] p-6 space-y-5">
          <h3 className="text-xs font-bold text-[#3C6C5F]/60 uppercase tracking-widest flex items-center gap-2 border-b border-[#E8E3DC] pb-3">
            <Pill size={14} />
            Détails du traitement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                Type de traitement
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Syringe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <select
                  required
                  value={medicament}
                  onChange={(e) => setMedicament(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm appearance-none cursor-pointer"
                >
                  <option value="" disabled>Sélectionner un type</option>
                  {TYPES_TRAITEMENT.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                Dosage
              </label>
              <div className="relative">
                <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Ex: 500mg / 2x par jour"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                Date de début
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                Date de fin
                <span className="text-[#3C6C5F]/50 text-xs ml-1">(Optionnel)</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <input
                  type="date"
                  value={dateFin}
                  min={date}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#29453E] mb-2">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-5 h-5 text-[#3C6C5F]/40" />
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le traitement effectué..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#29453E] mb-2">
              Observation
              <span className="text-[#3C6C5F]/50 text-xs ml-1">(Optionnel)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-5 h-5 text-[#3C6C5F]/40" />
              <textarea
                rows={2}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Observations supplémentaires..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Vétérinaire */}
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#E8E3DC] p-6 space-y-5">
          <h3 className="text-xs font-bold text-[#3C6C5F]/60 uppercase tracking-widest flex items-center gap-2 border-b border-[#E8E3DC] pb-3">
            <User size={14} />
            Vétérinaire responsable
          </h3>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
            <select
              value={vetId}
              onChange={(e) => setVetId(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm appearance-none cursor-pointer"
            >
              {veterinaires.map((v) => (
                <option key={v.id} value={v.id.toString()}>
                  Dr. {v.prenom} {v.nom}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${
              message.type === "success"
                ? "bg-[#DDF3E8] border-[#9DAE7A] text-[#29453E]"
                : "bg-red-50 border-red-200 text-red-700"
            } animate-in slide-in-from-top-2 duration-300`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-4 border-t border-[#E8E3DC]">
          <button
            type="button"
            disabled={loading}
            onClick={() => router.push(`/dashboard/animaux/${animalId}`)}
            className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-[#E8E3DC] text-[#3C6C5F] font-semibold hover:bg-[#F8F6F3] hover:border-[#3C6C5F]/30 transition-all duration-200 text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Stethoscope size={16} />
                Enregistrer le traitement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}