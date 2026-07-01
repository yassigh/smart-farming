"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCultureAction, updateCultureAction } from "@/actions/culture";
import { Role } from "@prisma/client";
import {
  Wheat,
  Sprout,
  Calendar,
  Building,
  X,
  Plus,
  Scale,
  Map,
  Save,
  ArrowLeft,
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

interface CultureData {
  id?: number;
  nom?: string;
  datePlantation?: string | Date;
  quantitePrevue?: number;
  etat?: string;
  terrainId?: number;
  categorieId?: number;
}

interface AddCultureFormProps {
  user: {
    id: number;
    role: Role;
  };
  terrains: Terrain[];
  categories: Categorie[];
  initialData?: CultureData;
  isEdit?: boolean;
}

const STATUTS = [
  { value: "PLANTEE", label: "🌱 Plantée" },
  { value: "EN_CROISSANCE", label: "📈 En croissance" },
  { value: "RECOLTEE", label: "🌾 Récoltée" },
  { value: "PERDUE", label: "❌ Perdue" },
];

export default function AddCultureForm({
  user,
  terrains,
  categories,
  initialData = {},
  isEdit = false,
}: AddCultureFormProps) {
  const router = useRouter();

  const fmtDate = (d: string | Date | undefined) => {
    if (!d) return new Date().toISOString().split("T")[0];
    return new Date(d).toISOString().split("T")[0];
  };

  const [nom, setNom] = useState(initialData.nom || "");
  const [categorieId, setCategorieId] = useState(
    initialData.categorieId?.toString() || categories[0]?.id?.toString() || ""
  );
  const [terrainId, setTerrainId] = useState(
    initialData.terrainId?.toString() || terrains[0]?.id?.toString() || ""
  );
  const [datePlantation, setDatePlantation] = useState(fmtDate(initialData.datePlantation));
  const [quantitePrevue, setQuantitePrevue] = useState(
    initialData.quantitePrevue?.toString() || ""
  );
  const [etat, setEtat] = useState(initialData.etat || "PLANTEE");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      nom,
      datePlantation: new Date(datePlantation),
      quantitePrevue: parseFloat(quantitePrevue),
      etat,
      terrainId: parseInt(terrainId),
      categorieId: parseInt(categorieId),
    };

    const response = isEdit && initialData.id
      ? await updateCultureAction(initialData.id, payload)
      : await addCultureAction(payload);
    
    setLoading(false);

    if (response.success) {
      setMessage({
        type: "success",
        text: isEdit ? "Culture mise à jour avec succès !" : "Culture créée avec succès !",
      });
      setTimeout(() => {
        router.push("/dashboard/cultures");
        router.refresh();
      }, 1200);
    } else {
      setMessage({ type: "error", text: response.error || "Une erreur est survenue." });
    }
  };

  if (terrains.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm">
        <p className="text-amber-800 font-semibold mb-4 text-sm">
          ⚠️ Aucun terrain n'est configuré. Vous devez d'abord créer un terrain avant d'ajouter une culture.
        </p>
        <button
          onClick={() => router.push("/dashboard/terrains")}
          className="px-5 py-2.5 bg-[#3C6C5F] hover:bg-[#29453E] text-white rounded-xl font-semibold text-sm transition-all"
        >
          Aller aux Terrains
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm">
        <p className="text-amber-800 font-semibold mb-4 text-sm">
          ⚠️ Aucune catégorie "CULTURE" n'est disponible. Veuillez demander à l'administrateur d'en créer une dans "Gestion des Catégories".
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-5 py-2.5 bg-[#3C6C5F] hover:bg-[#29453E] text-white rounded-xl font-semibold text-sm transition-all"
        >
          Retour au Tableau de bord
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* IDENTIFICATION */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 pb-3">
          Informations de la Culture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nom */}
          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Nom de la culture *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]/30 text-sm transition-all"
              placeholder="Ex: Blé tendre, Pommes de terre..."
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Catégorie (Type) *
            </label>
            <select
              required
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]/30 text-sm transition-all"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LOCALISATION & RENDEMENT */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 pb-3">
          Localisation &amp; Rendement
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Terrain */}
          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Terrain associé *
            </label>
            <div className="relative">
              <Map size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DAE7A]" />
              <select
                required
                value={terrainId}
                onChange={(e) => setTerrainId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]/30 text-sm transition-all appearance-none"
              >
                {terrains.map((t) => (
                  <option key={t.id} value={t.id.toString()}>
                    {t.nom} ({t.ferme.nom} — {t.ferme.nom ? "" : ""} {t.id} )
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantité Prévue */}
          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Quantité récolte prévue (kg) *
            </label>
            <div className="relative">
              <Scale size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DAE7A]" />
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={quantitePrevue}
                onChange={(e) => setQuantitePrevue(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]/30 text-sm transition-all"
                placeholder="Ex: 5000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PLANIFICATION & ETAT */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 pb-3">
          Planification &amp; Statut
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Date Plantation */}
          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Date de plantation *
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DAE7A]" />
              <input
                type="date"
                required
                value={datePlantation}
                onChange={(e) => setDatePlantation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]/30 text-sm transition-all"
              />
            </div>
          </div>

          {/* État */}
          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              État / Statut *
            </label>
            <select
              required
              value={etat}
              onChange={(e) => setEtat(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]/30 text-sm transition-all"
            >
              {STATUTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages de retour */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* BOUTONS */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          disabled={loading}
          onClick={() => router.push("/dashboard/cultures")}
          className="flex items-center gap-2 flex-1 justify-center py-3.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 flex-1 justify-center py-3.5 rounded-xl bg-[#3C6C5F] text-white font-bold hover:bg-[#29453E] disabled:opacity-50 transition-all text-sm shadow-md cursor-pointer"
        >
          {isEdit ? <Save size={16} /> : <Plus size={16} />}
          {loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer la Culture"}
        </button>
      </div>
    </form>
  );
}