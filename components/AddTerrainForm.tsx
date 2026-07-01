// components/AddTerrainForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTerrainAction, updateTerrainAction } from "@/actions/terrain";
import dynamic from "next/dynamic";
import {
  MapPinned,
  Ruler,
  TreePine,
  Building2,
  MapPin,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Compass,
  Droplets,
  Mountain
} from "lucide-react";

// Dynamically import the MapSelector to prevent SSR errors (window is not defined)
const MapSelector = dynamic(() => import("./MapSelector"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-zinc-50 border-2 border-dashed border-[#E8E3DC] flex items-center justify-center text-[#3C6C5F]/50 text-sm font-medium animate-pulse">
      Chargement de la carte interactive...
    </div>
  ),
});

interface Ferme {
  id: number;
  nom: string;
}

interface TerrainData {
  id?: number;
  nom: string;
  superficie: number;
  typeSol: string;
  localisation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  fermeId: number;
}

interface AddTerrainFormProps {
  fermes: Ferme[];
  initialData?: TerrainData;
  isEdit?: boolean;
}

export default function AddTerrainForm({
  fermes,
  initialData,
  isEdit = false,
}: AddTerrainFormProps) {
  const router = useRouter();
  const [nom, setNom] = useState(initialData?.nom || "");
  const [superficie, setSuperficie] = useState(initialData?.superficie?.toString() || "");
  const [typeSol, setTypeSol] = useState(initialData?.typeSol || "");
  const [localisation, setLocalisation] = useState(initialData?.localisation || "");
  const [fermeId, setFermeId] = useState(initialData?.fermeId?.toString() || fermes[0]?.id?.toString() || "");
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const typeSolOptions = [
    { value: "Argileux", icon: Droplets },
    { value: "Sableux", icon: Mountain },
    { value: "Limoneux", icon: TreePine },
    { value: "Humifère", icon: Sparkles },
    { value: "Calcaire", icon: Compass },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!fermeId) {
      setMessage({ type: "error", text: "Veuillez sélectionner une ferme." });
      setLoading(false);
      return;
    }

    const payload = {
      nom,
      superficie: parseFloat(superficie),
      typeSol,
      localisation: localisation || undefined,
      fermeId: parseInt(fermeId),
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    };

    const response = isEdit && initialData?.id
      ? await updateTerrainAction(initialData.id, payload)
      : await addTerrainAction(payload);

    setLoading(false);

    if (response.success) {
      setMessage({
        type: "success",
        text: isEdit ? "Terrain modifié avec succès !" : "Terrain ajouté avec succès !"
      });

      if (!isEdit) {
        setNom("");
        setSuperficie("");
        setTypeSol("");
        setLocalisation("");
        setLatitude("");
        setLongitude("");
      }
      
      setTimeout(() => {
        router.push("/dashboard/terrains");
        router.refresh();
      }, 1500);
    } else {
      setMessage({ type: "error", text: response.error || "Une erreur est survenue." });
    }
  };

  if (fermes.length === 0) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-4 border border-[#FFC490]/30">
          <Building2 size={36} className="text-[#3C6C5F]" />
        </div>
        <h3 className="text-xl font-bold text-[#29453E]">Aucune ferme disponible</h3>
        <p className="text-[#3C6C5F]/70 mt-2 max-w-sm mx-auto">
          Vous devez d'abord créer une ferme avant de pouvoir ajouter un terrain.
        </p>
        <button
          onClick={() => router.push("/dashboard/fermes")}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20"
        >
          Aller aux Fermes
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-8 transition-all hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center shadow-lg shadow-[#3C6C5F]/20">
          <MapPinned className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
            {isEdit ? "Modifier le Terrain" : "Nouveau Terrain"}
            <Sparkles className="w-4 h-4 text-[#FFC490]" />
          </h2>
          <p className="text-sm text-[#3C6C5F]/70">
            {isEdit
              ? "Mettez à jour les informations de votre parcelle"
              : "Ajoutez une nouvelle parcelle à votre exploitation"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-[#29453E] mb-2">
              Nom du Terrain
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all duration-200 text-sm"
                placeholder="Ex: Parcelle Est"
              />
            </div>
          </div>

          {/* Superficie */}
          <div>
            <label className="block text-sm font-semibold text-[#29453E] mb-2">
              Superficie (hectares)
              <span className="text-red-500 ml-1">*</span>
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
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all duration-200 text-sm"
                placeholder="Ex: 5.25"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type de Sol */}
          <div>
            <label className="block text-sm font-semibold text-[#29453E] mb-2">
              Type de Sol
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <TreePine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
              <select
                required
                value={typeSol}
                onChange={(e) => setTypeSol(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all duration-200 text-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>Sélectionner le type de sol</option>
                {typeSolOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
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

          {/* Ferme */}
          <div>
            <label className="block text-sm font-semibold text-[#29453E] mb-2">
              Associer à la Ferme
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
              <select
                required
                value={fermeId}
                onChange={(e) => setFermeId(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all duration-200 text-sm appearance-none cursor-pointer"
              >
                {fermes.map((ferme) => (
                  <option key={ferme.id} value={ferme.id.toString()}>
                    {ferme.nom}
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
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-sm font-semibold text-[#29453E] mb-2">
            Localisation
            <span className="text-[#3C6C5F]/50 text-xs ml-1">(Optionnel - Description textuelle)</span>
          </label>
          <div className="relative">
            <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3C6C5F]/40" />
            <input
              type="text"
              value={localisation}
              onChange={(e) => setLocalisation(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all duration-200 text-sm"
              placeholder="Ex: Près du fleuve, secteur nord-ouest"
            />
          </div>
        </div>

        {/* Coordonnées GPS / Carte */}
        <div className="border-t border-[#E8E3DC] pt-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#29453E] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#3C6C5F]" />
              Coordonnées GPS & Positionnement
              <span className="text-[#3C6C5F]/50 text-xs font-normal">(Optionnel)</span>
            </h3>
            <p className="text-xs text-[#3C6C5F]/60 mt-1">
              Placez un point sur la carte ci-dessous pour remplir automatiquement les coordonnées GPS de cette parcelle, ou saisissez-les manuellement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#29453E] mb-1.5">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all text-xs"
                placeholder="Ex: 36.401234"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#29453E] mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 focus:bg-white transition-all text-xs"
                placeholder="Ex: 10.612345"
              />
            </div>
          </div>

          <MapSelector
            latitude={latitude ? parseFloat(latitude) : null}
            longitude={longitude ? parseFloat(longitude) : null}
            onChange={(lat, lng) => {
              setLatitude(lat.toFixed(6));
              setLongitude(lng.toFixed(6));
            }}
          />
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

        {/* Action buttons */}
        <div className="flex gap-4 pt-4 border-t border-[#E8E3DC]">
          <button
            type="button"
            disabled={loading}
            onClick={() => router.push("/dashboard/terrains")}
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
                <MapPinned size={16} />
                {isEdit ? "Enregistrer les modifications" : "Créer le Terrain"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}