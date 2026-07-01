// components/AddFermeForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addFermeAction, updateFermeAction } from "@/actions/ferme";
import { Role } from "@prisma/client";
import {
  Warehouse,
  MapPin,
  Ruler,
  User,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";

interface Agriculteur {
  id: number;
  nom: string;
  prenom: string;
}

interface AddFermeFormProps {
  initialData?: {
    id: number;
    nom: string;
    adresse: string;
    superficie: number;
    agriculteurId: number;
  };
  agriculteurs?: Agriculteur[];
  currentUserId: number;
  currentUserRole: Role;
}

export default function AddFermeForm({
  initialData,
  agriculteurs = [],
  currentUserId,
  currentUserRole,
}: AddFermeFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const [nom, setNom] = useState(initialData?.nom || "");
  const [adresse, setAdresse] = useState(initialData?.adresse || "");
  const [superficie, setSuperficie] = useState(initialData?.superficie?.toString() || "");
  const [agriculteurId, setAgriculteurId] = useState(
    initialData?.agriculteurId?.toString() || 
    (currentUserRole === Role.AGRICULTEUR ? currentUserId.toString() : agriculteurs[0]?.id?.toString() || "")
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const ownerId = currentUserRole === Role.AGRICULTEUR ? currentUserId : parseInt(agriculteurId);

    if (!ownerId) {
      setMessage({ type: "error", text: "Veuillez sélectionner un propriétaire (Agriculteur)." });
      setLoading(false);
      return;
    }

    const payload = {
      nom,
      adresse,
      superficie: parseFloat(superficie),
      agriculteurId: ownerId,
    };

    let response;
    if (isEditMode && initialData) {
      response = await updateFermeAction(initialData.id, payload);
    } else {
      response = await addFermeAction(payload);
    }

    setLoading(false);

    if (response.success) {
      setMessage({ 
        type: "success", 
        text: isEditMode ? "Ferme modifiée avec succès !" : "Ferme créée avec succès !" 
      });

      if (!isEditMode) {
        setNom("");
        setAdresse("");
        setSuperficie("");
      }

      setTimeout(() => {
        router.push("/dashboard/fermes");
        router.refresh();
      }, 1500);
    } else {
      setMessage({ type: "error", text: response.error || "Une erreur est survenue." });
    }
  };

  return (
    <div className="bg-white border border-[#FFC490]/20 rounded-2xl shadow-sm p-6">
      {/* Header comme la page Catégories */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center shadow-lg shadow-[#3C6C5F]/20">
          <Plus className="w-6 h-6 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#29453E]">
            {isEditMode ? "Modifier la Ferme" : "Nouvelle Ferme"}
          </h2>
          <p className="text-sm text-[#3C6C5F]/70">
            {isEditMode ? "Modifiez les informations de la ferme" : "Ajoutez une nouvelle ferme à votre exploitation"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nom */}
        <div>
          <label className="block text-sm font-semibold text-[#29453E] mb-1.5">
            Nom de la Ferme <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all duration-200 text-sm"
              placeholder="Ex: Ferme du Soleil"
            />
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-semibold text-[#29453E] mb-1.5">
            Adresse de la Ferme <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
            <input
              type="text"
              required
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all duration-200 text-sm"
              placeholder="Ex: Rue de la Plaine, 75000 Ville"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Superficie */}
          <div>
            <label className="block text-sm font-semibold text-[#29453E] mb-1.5">
              Superficie (ha) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                value={superficie}
                onChange={(e) => setSuperficie(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all duration-200 text-sm"
                placeholder="Ex: 45.50"
              />
            </div>
          </div>

          {/* Propriétaire - seulement pour ADMIN */}
          {currentUserRole === Role.ADMIN && (
            <div>
              <label className="block text-sm font-semibold text-[#29453E] mb-1.5">
                Propriétaire <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
                {agriculteurs.length === 0 ? (
                  <div className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 text-sm">
                    ⚠️ Aucun agriculteur trouvé
                  </div>
                ) : (
                  <select
                    required
                    value={agriculteurId}
                    onChange={(e) => setAgriculteurId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    {agriculteurs.map((agri) => (
                      <option key={agri.id} value={agri.id.toString()}>
                        {agri.prenom} {agri.nom}
                      </option>
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
          )}
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
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

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => router.push("/dashboard/fermes")}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-[#E8E3DC] text-[#3C6C5F] font-semibold hover:bg-[#F8F6F3] hover:border-[#3C6C5F]/30 transition-all duration-200 text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || (currentUserRole === Role.ADMIN && agriculteurs.length === 0)}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Plus size={18} />
                {isEditMode ? "Modifier la Ferme" : "Ajouter la Ferme"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}