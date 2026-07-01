"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTraitementAction } from "@/actions/animal";
import { Stethoscope, ArrowLeft } from "lucide-react";

interface Animal {
  id: number;
  numero: string;
  type: string;
  terrain: {
    ferme: {
      nom: string;
    };
  };
}

interface Veterinaire {
  id: number;
  nom: string;
  prenom: string;
}

interface Props {
  animals: Animal[];
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

export default function AddGeneralTraitementForm({
  animals,
  veterinaires,
  currentVeterinaireId,
}: Props) {
  const router = useRouter();
  const [animalId, setAnimalId] = useState(animals[0]?.id?.toString() || "");
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
    if (!animalId) {
      setMessage({ type: "error", text: "Veuillez sélectionner un animal." });
      return;
    }
    setLoading(true);
    setMessage(null);

    const res = await addTraitementAction({
      medicament,
      description,
      dosage: dosage || undefined,
      observation: observation || undefined,
      date,
      dateFin: dateFin || undefined,
      animalId: animalId,
      veterinaireId: vetId,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: "Traitement enregistré avec succès !" });
      setTimeout(() => {
        router.push("/dashboard/traitements");
        router.refresh();
      }, 1200);
    } else {
      setMessage({ type: "error", text: res.error || "Une erreur est survenue." });
    }
  };

  if (animals.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center shadow-sm max-w-xl mx-auto">
        <p className="text-amber-800 font-semibold mb-4">
          Aucun animal disponible. Créez d'abord un animal avant d'ajouter un traitement.
        </p>
        <button
          onClick={() => router.push("/dashboard/animaux")}
          className="px-5 py-2.5 bg-[#2A453E] hover:bg-[#3C6C60] text-white rounded-xl font-semibold text-sm transition-all"
        >
          Aller aux Animaux
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sélection de l'animal */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 pb-3">
          Sélection de l'animal
        </h2>
        <div>
          <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
            Animal à traiter *
          </label>
          <select
            required
            value={animalId}
            onChange={(e) => setAnimalId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all"
          >
            <option value="" disabled>Sélectionner un animal</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id.toString()}>
                {a.numero} ({a.type} — {a.terrain.ferme.nom})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Médicament / Type */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 pb-3">
          Détails du traitement
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Type de traitement *
            </label>
            <select
              required
              value={medicament}
              onChange={(e) => setMedicament(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all"
            >
              <option value="" disabled>Sélectionner un type</option>
              {TYPES_TRAITEMENT.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Dosage
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Ex: 500mg / 2x par jour"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Date de début *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Date de fin (optionnel)
            </label>
            <input
              type="date"
              value={dateFin}
              min={date}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
            Description *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez le traitement effectué..."
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
            Observation (optionnel)
          </label>
          <textarea
            rows={2}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Observations supplémentaires..."
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all resize-none"
          />
        </div>
      </div>

      {/* Vétérinaire responsable */}
      {veterinaires.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
            Vétérinaire responsable
          </label>
          <select
            value={vetId}
            onChange={(e) => setVetId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all"
          >
            {veterinaires.map((v) => (
              <option key={v.id} value={v.id.toString()}>
                Dr. {v.prenom} {v.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message */}
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

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          disabled={loading}
          onClick={() => router.push("/dashboard/traitements")}
          className="flex items-center gap-2 flex-1 justify-center py-3.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 flex-1 justify-center py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold disabled:opacity-50 transition-all text-sm shadow-md cursor-pointer"
        >
          <Stethoscope size={16} />
          {loading ? "Enregistrement..." : "Enregistrer le traitement"}
        </button>
      </div>
    </form>
  );
}
