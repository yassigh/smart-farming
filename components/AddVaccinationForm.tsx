"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addVaccinationAction } from "@/actions/animal";
import { Syringe, ArrowLeft } from "lucide-react";

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

const VACCINS_COURANTS = [
  "FMD (Fièvre aphteuse)",
  "PPCB (Péripneumonie bovine)",
  "Charbon symptomatique",
  "Brucellose",
  "Rage",
  "Newcastle",
  "Marek",
  "Pasteurellose",
  "Autre",
];

export default function AddVaccinationForm({
  animalId,
  animalNumero,
  veterinaires,
  currentVeterinaireId,
}: Props) {
  const router = useRouter();
  const [nomVaccin, setNomVaccin] = useState("");
  const [dateAdministered, setDateAdministered] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dateRappel, setDateRappel] = useState("");
  const [statut, setStatut] = useState("A_JOUR");
  const [vetId, setVetId] = useState(currentVeterinaireId.toString());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await addVaccinationAction({
      nomVaccin,
      dateAdministered,
      dateRappel: dateRappel || undefined,
      statut,
      animalId: animalId.toString(),
      veterinaireId: vetId,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: "Vaccination enregistrée avec succès !" });
      setTimeout(() => {
        router.push(`/dashboard/animaux/${animalId}`);
        router.refresh();
      }, 1200);
    } else {
      setMessage({ type: "error", text: res.error || "Une erreur est survenue." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info animal */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
        <Syringe size={20} className="text-blue-600 shrink-0" />
        <p className="text-sm text-blue-800 font-semibold">
          Vaccination pour l'animal :{" "}
          <span className="font-black">{animalNumero}</span>
        </p>
      </div>

      {/* Détails vaccin */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 pb-3">
          Détails de la vaccination
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nom du vaccin */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Nom du vaccin *
            </label>
            <select
              required
              value={nomVaccin}
              onChange={(e) => setNomVaccin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all"
            >
              <option value="" disabled>Sélectionner un vaccin</option>
              {VACCINS_COURANTS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Date d'administration */}
          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Date d'administration *
            </label>
            <input
              type="date"
              required
              value={dateAdministered}
              onChange={(e) => setDateAdministered(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all"
            />
          </div>

          {/* Date de rappel */}
          <div>
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Prochaine dose / Rappel (optionnel)
            </label>
            <input
              type="date"
              value={dateRappel}
              min={dateAdministered}
              onChange={(e) => setDateRappel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#3C6C60]/30 text-sm transition-all"
            />
          </div>

          {/* Statut */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
              Statut *
            </label>
            <div className="flex gap-3">
              {[
                { value: "A_JOUR", label: "À jour", cls: "text-emerald-700 border-emerald-400 bg-emerald-50" },
                { value: "EN_RETARD", label: " En retard", cls: "text-amber-700 border-amber-400 bg-amber-50" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatut(s.value)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    statut === s.value
                      ? `border-current ${s.cls}`
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vétérinaire */}
      {veterinaires.length > 1 && (
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
          onClick={() => router.push(`/dashboard/animaux/${animalId}`)}
          className="flex items-center gap-2 flex-1 justify-center py-3.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all text-sm"
        >
          <ArrowLeft size={16} />
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 flex-1 justify-center py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 transition-all text-sm shadow-md cursor-pointer"
        >
          <Syringe size={16} />
          {loading ? "Enregistrement..." : "Enregistrer la vaccination"}
        </button>
      </div>
    </form>
  );
}
