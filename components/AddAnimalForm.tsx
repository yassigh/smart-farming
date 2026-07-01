// components/AddAnimalForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAnimalAction, updateAnimalAction } from "@/actions/animal";
import {
  PawPrint,
  ArrowLeft,
  Sparkles,
  Ruler,
  Calendar,
  MapPin,
  Building2,
  HeartPulse,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Droplets,
  Shield,
  User,
  Hash,
  Tags,
  Package
} from "lucide-react";

interface Terrain {
  id: number;
  nom: string;
  ferme: { nom: string };
}

interface Categorie {
  id: number;
  nom: string;
}

interface AnimalData {
  id?: number;
  numero?: string;
  type?: string;
  race?: string;
  sexe?: "MALE" | "FEMELLE";
  poids?: number;
  dateNaissance?: string | Date;
  etatSante?: string;
  terrainId?: number;
  categorieId?: number;
}

interface Props {
  terrains: Terrain[];
  categories: Categorie[];
  initialData?: AnimalData;
  isEdit?: boolean;
}

const ESPECES = [
  "Vache", "Mouton", "Chèvre", "Poule", "Lapin",
  "Cheval", "Âne", "Porc", "Dinde", "Canard", "Autre",
];

const ETATS_SANTE = ["Sain", "Malade", "En traitement", "Blessé", "Décédé"];

export default function AddAnimalForm({
  terrains,
  categories,
  initialData = {},
  isEdit = false,
}: Props) {
  const router = useRouter();

  const fmt = (d: string | Date | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const [numero, setNumero] = useState(initialData.numero || "");
  const [type, setType] = useState(initialData.type || "");
  const [race, setRace] = useState(initialData.race || "");
  const [sexe, setSexe] = useState<"MALE" | "FEMELLE">(initialData.sexe || "MALE");
  const [poids, setPoids] = useState(initialData.poids?.toString() || "");
  const [dateNaissance, setDateNaissance] = useState(fmt(initialData.dateNaissance));
  const [etatSante, setEtatSante] = useState(initialData.etatSante || "Sain");
  const [terrainId, setTerrainId] = useState(initialData.terrainId?.toString() || terrains[0]?.id?.toString() || "");
  const [categorieId, setCategorieId] = useState(initialData.categorieId?.toString() || categories[0]?.id?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const data = {
      numero,
      type,
      race,
      sexe,
      poids: parseFloat(poids),
      dateNaissance: new Date(dateNaissance),
      etatSante,
      terrainId: parseInt(terrainId),
      categorieId: parseInt(categorieId),
    };

    const res = isEdit && initialData.id
      ? await updateAnimalAction(initialData.id, data)
      : await addAnimalAction(data);

    setLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: isEdit ? "Animal mis à jour avec succès !" : "Animal ajouté avec succès !" });
      setTimeout(() => {
        router.push("/dashboard/animaux");
        router.refresh();
      }, 1500);
    } else {
      setMessage({ type: "error", text: res.error || "Une erreur est survenue." });
    }
  };

  if (terrains.length === 0) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-4 border border-[#FFC490]/30">
          <MapPin size={36} className="text-[#3C6C5F]" />
        </div>
        <h3 className="text-xl font-bold text-[#29453E]">Aucun terrain disponible</h3>
        <p className="text-[#3C6C5F]/70 mt-2 max-w-sm mx-auto">
          Vous devez d'abord créer un terrain avant de pouvoir ajouter un animal.
        </p>
        <button
          onClick={() => router.push("/dashboard/terrains")}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20"
        >
          Aller aux Terrains
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-8 transition-all hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center shadow-lg shadow-[#3C6C5F]/20">
          <PawPrint className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
            {isEdit ? "Modifier l'animal" : "Ajouter un animal"}
            <Sparkles className="w-4 h-4 text-[#FFC490]" />
          </h2>
          <p className="text-sm text-[#3C6C5F]/70">
            {isEdit ? "Modifiez les informations de l'animal" : "Ajoutez un nouvel animal à votre exploitation"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Identification */}
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#E8E3DC] p-6 space-y-5">
          <h3 className="text-xs font-bold text-[#3C6C5F]/60 uppercase tracking-widest flex items-center gap-2 border-b border-[#E8E3DC] pb-3">
            <Hash size={14} />
            Identification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                N° d'identification
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <input
                  type="text"
                  required
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ex: BOV-2024-001"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                Espèce
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Tags className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <select
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm appearance-none cursor-pointer"
                >
                  <option value="" disabled>Sélectionner une espèce</option>
                  {ESPECES.map((s) => (
                    <option key={s} value={s}>{s}</option>
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
                Race
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <input
                  type="text"
                  required
                  value={race}
                  onChange={(e) => setRace(e.target.value)}
                  placeholder="Ex: Holstein, Merino…"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                Sexe
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["MALE", "FEMELLE"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSexe(s)}
                    className={`py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 ${
                      sexe === s
                        ? "border-[#3C6C5F] bg-[#DDF3E8] text-[#3C6C5F] shadow-sm"
                        : "border-[#E8E3DC] text-[#3C6C5F]/50 hover:border-[#9DAE7A] hover:bg-[#F8F6F3]"
                    }`}
                  >
                    {s === "MALE" ? "♂ Mâle" : "♀ Femelle"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Données physiques */}
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#E8E3DC] p-6 space-y-5">
          <h3 className="text-xs font-bold text-[#3C6C5F]/60 uppercase tracking-widest flex items-center gap-2 border-b border-[#E8E3DC] pb-3">
            <Package size={14} />
            Données physiques & Santé
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                Poids (kg)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={poids}
                  onChange={(e) => setPoids(e.target.value)}
                  placeholder="Ex: 350"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                Date de naissance
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <input
                  type="date"
                  required
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                État de santé
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <select
                  required
                  value={etatSante}
                  onChange={(e) => setEtatSante(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm appearance-none cursor-pointer"
                >
                  {ETATS_SANTE.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Localisation */}
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#E8E3DC] p-6 space-y-5">
          <h3 className="text-xs font-bold text-[#3C6C5F]/60 uppercase tracking-widest flex items-center gap-2 border-b border-[#E8E3DC] pb-3">
            <MapPin size={14} />
            Localisation & Catégorie
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                Terrain associé
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                <select
                  required
                  value={terrainId}
                  onChange={(e) => setTerrainId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm appearance-none cursor-pointer"
                >
                  {terrains.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.nom} — {t.ferme.nom}
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

            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-2">
                Catégorie
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Tags className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                {categories.length === 0 ? (
                  <div className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 text-sm">
                    ⚠️ Aucune catégorie disponible
                  </div>
                ) : (
                  <select
                    required
                    value={categorieId}
                    onChange={(e) => setCategorieId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-white text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id.toString()}>{c.nom}</option>
                    ))}
                  </select>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
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
            onClick={() => router.push("/dashboard/animaux")}
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
                <PawPrint size={16} />
                {isEdit ? "Mettre à jour" : "Ajouter l'animal"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}