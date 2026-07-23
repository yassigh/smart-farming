// components/TerrainTable.tsx - Version avec recherche vocale
"use client";

import { deleteTerrainAction } from "@/actions/terrain";
import {
  Pencil,
  Trash2,
  MapPinned,
  Search,
  Plus,
  Building2,
  Ruler,
  TreePine,
  MapPin,
  Sparkles,
  Compass,
  Droplets,
  Mountain,
  Wind,
  Mic,
  MicOff,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { Role } from "@prisma/client";
import dynamic from "next/dynamic";

const TerrainsMapView = dynamic(() => import("./TerrainsMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-3xl bg-zinc-50 border-2 border-dashed border-[#FFC490]/20 flex items-center justify-center text-[#3C6C5F]/50 text-sm font-medium animate-pulse mb-6">
      Chargement de la carte des terrains...
    </div>
  ),
});

//  Déclaration des types pour Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Déclaration globale pour window
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface Terrain {
  id: number;
  nom: string;
  superficie: number;
  typeSol: string;
  localisation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ferme: {
    id: number;
    nom: string;
  };
}

interface Props {
  initialTerrains: Terrain[];
  user: {
    role: Role;
  };
}

const typeSolIcons: Record<string, any> = {
  Argileux: Droplets,
  Sableux: Mountain,
  Limoneux: TreePine,
  Humifère: Sparkles,
  Calcaire: Compass,
};

//  Composant de recherche vocale
interface VoiceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onListeningChange?: (isListening: boolean) => void;
}

function VoiceSearch({
  value,
  onChange,
  placeholder = "Rechercher...",
  onListeningChange,
}: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hasSpeechRecognition =
      typeof window !== "undefined" &&
      (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

    if (!hasSpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    if (recognitionRef.current) {
      recognitionRef.current.lang = "fr-FR";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
        if (inputRef.current) {
          inputRef.current.value = transcript;
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Erreur de reconnaissance vocale:", event.error);
        let errorMessage = "Erreur de reconnaissance";
        if (event.error === "not-allowed") {
          errorMessage = "🎤 Accès au microphone refusé";
        } else if (event.error === "no-speech") {
          errorMessage = "🎤 Aucune parole détectée";
        } else if (event.error === "audio-capture") {
          errorMessage = "🎤 Aucun microphone trouvé";
        }
        setError(errorMessage);
        setIsListening(false);
        if (onListeningChange) onListeningChange(false);

        setTimeout(() => setError(null), 3000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (onListeningChange) onListeningChange(false);
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
        if (onListeningChange) onListeningChange(true);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Erreur lors de l'arrêt:", e);
        }
      }
      setIsListening(false);
      if (onListeningChange) onListeningChange(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          if (inputRef.current) {
            inputRef.current.focus();
          }
        } catch (e) {
          console.error("Erreur lors du démarrage:", e);
          setError("🎤 Impossible de démarrer le microphone");
          setTimeout(() => setError(null), 3000);
        }
      } else {
        setError("🎤 Reconnaissance vocale non disponible");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#FFC490]/30 bg-[#FAFAFA] text-sm text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all w-full sm:w-48 focus:w-60"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={
            isListening ? "🎤 Écoute en cours..." : error || placeholder
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isListening}
          className={`pl-10 pr-12 py-2.5 rounded-xl border-2 transition-all w-full sm:w-48 focus:w-60 text-sm text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:ring-4 ${
            isListening
              ? "border-[#3C6C5F] ring-4 ring-[#3C6C5F]/20 bg-[#DDF3E8]"
              : error
                ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200"
                : "border-[#FFC490]/30 bg-[#FAFAFA] focus:border-[#3C6C5F] focus:ring-[#3C6C5F]/10"
          }`}
        />
        <button
          onClick={toggleListening}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all duration-300 ${
            isListening
              ? "bg-[#3C6C5F] text-white animate-pulse shadow-lg shadow-[#3C6C5F]/30"
              : error
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-[#FFF3DA] text-[#3C6C5F] hover:bg-[#FFC490]/30 hover:scale-110"
          }`}
          title={isListening ? "Arrêter l'écoute" : "Recherche vocale"}
        >
          {isListening ? <Mic size={18} /> : <Mic size={18} />}
        </button>
      </div>

      {isListening && (
        <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#3C6C5F] animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></span>
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#3C6C5F] animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></span>
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#3C6C5F] animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></span>
          <span className="text-[10px] font-semibold text-[#3C6C5F]/70 ml-1">
            Écoute...
          </span>
        </div>
      )}

      {error && !isListening && (
        <div className="absolute -bottom-6 left-0 right-0 text-[10px] font-semibold text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export default function TerrainTable({ initialTerrains, user }: Props) {
  const [terrains, setTerrains] = useState(initialTerrains || []);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [centerTerrainId, setCenterTerrainId] = useState<number | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // States for modern alerts & dialogs
  const [terrainToDelete, setTerrainToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const ITEMS_PER_PAGE = 5;

  async function confirmDelete() {
    if (!terrainToDelete) return;
    setIsDeleting(true);
    setNotification(null);

    const result = await deleteTerrainAction(terrainToDelete);

    if (result.success) {
      setTerrains((old) => old.filter((t) => t.id !== terrainToDelete));
      setNotification({
        type: "success",
        message: "Terrain supprimé avec succès.",
      });
    } else {
      setNotification({
        type: "error",
        message: result.error || "Erreur lors de la suppression.",
      });
    }

    setIsDeleting(false);
    setTerrainToDelete(null);
  }

  const filteredTerrains = useMemo(() => {
    if (!terrains || terrains.length === 0) return [];

    return terrains.filter((terrain) =>
      (
        terrain.nom +
        " " +
        terrain.typeSol +
        " " +
        terrain.ferme.nom +
        " " +
        (terrain.localisation || "")
      )
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [terrains, search]);

  const totalPages = Math.ceil(filteredTerrains.length / ITEMS_PER_PAGE);
  const paginatedTerrains = filteredTerrains.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const canManage =
    user?.role === Role.ADMIN || user?.role === Role.AGRICULTEUR;
  const canView =
    user?.role === Role.EMPLOYE || user?.role === Role.VETERINAIRE || canManage;

  // Si l'utilisateur n'a pas le droit de voir les terrains
  if (!canView) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <MapPinned size={44} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Accès restreint</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          Vous n'avez pas les autorisations nécessaires pour voir cette page.
        </p>
      </div>
    );
  }

  //  Vérifier si terrains est un tableau et s'il est vide
  if (!terrains || terrains.length === 0) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <MapPinned size={44} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Aucun terrain</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          Aucun terrain n'est actuellement enregistré dans le système.
        </p>
        {canManage && (
          <Link
            href="/dashboard/terrains/add"
            className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl"
          >
            <Plus size={18} />
            Ajouter un terrain
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 overflow-hidden transition-all hover:shadow-xl">
      {/* HEADER - Même style que FermeTable */}
      <div className="p-6 border-b border-[#FFC490]/20 bg-gradient-to-r from-[#FFF3DA]/30 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DDF3E8] flex items-center justify-center shadow-sm">
              <MapPinned size={22} className="text-[#3C6C5F]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
                Liste des Terrains
                <Sparkles size={16} className="text-[#FFC490]" />
              </h2>
              <p className="text-sm text-[#3C6C5F]/60">
                {filteredTerrains.length} terrain(s) trouvé(s)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/*  Recherche avec voix */}
            <VoiceSearch
              value={search}
              onChange={setSearch}
              placeholder="Rechercher par nom, type de sol, ferme, localisation..."
              onListeningChange={setIsVoiceListening}
            />

            {canManage && (
              <Link
                href="/dashboard/terrains/add"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md shadow-[#3C6C5F]/20 hover:shadow-lg"
              >
                <Plus size={16} />
                Ajouter
              </Link>
            )}
          </div>
        </div>

        {/*  Indicateur de recherche vocale active */}
        {isVoiceListening && (
          <div className="mt-3 flex items-center gap-2 text-sm text-[#3C6C5F] bg-[#DDF3E8] px-4 py-2 rounded-xl border border-[#3C6C5F]/20 animate-pulse">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3C6C5F] animate-ping"></span>
              <span
                className="w-2 h-2 rounded-full bg-[#3C6C5F] animate-ping"
                style={{ animationDelay: "0.2s" }}
              ></span>
              <span
                className="w-2 h-2 rounded-full bg-[#3C6C5F] animate-ping"
                style={{ animationDelay: "0.4s" }}
              ></span>
            </div>
            <span className="font-semibold">
              🎤 Recherche vocale active - Parlez maintenant...
            </span>
            <span className="text-xs text-[#3C6C5F]/60">
              (Cliquez sur le micro pour arrêter)
            </span>
          </div>
        )}
      </div>

      {/* MAP VIEW OF ALL TERRAINS */}
      <div className="px-6 pt-6">
        <TerrainsMapView
          terrains={terrains}
          centerOnTerrainId={centerTerrainId}
          onClearCenter={() => setCenterTerrainId(null)}
        />
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          className={`m-6 p-4 rounded-2xl border-2 flex items-center justify-between shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-4 ${
            notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-[#DDF3E8] border-[#9DAE7A]/40 text-[#29453E]"
          }`}
        >
          <div className="flex items-center gap-3 font-medium">
            <span className="text-xl">
              {notification.type === "error" ? "⚠️" : "✅"}
            </span>
            {notification.message}
          </div>
          <button
            onClick={() => setNotification(null)}
            className={`p-1.5 rounded-lg transition-colors ${
              notification.type === "error"
                ? "hover:bg-red-100"
                : "hover:bg-[#3C6C5F]/10"
            }`}
          >
            ✕
          </button>
        </div>
      )}

      {/* TABLE - Même style que FermeTable (sans padding supplémentaire) */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FFF3DA] text-[#29453E] text-xs uppercase tracking-wider">
              <th className="px-6 py-4 text-left font-semibold">Terrain</th>
              <th className="px-6 py-4 text-left font-semibold">Superficie</th>
              <th className="px-6 py-4 text-left font-semibold">Type de sol</th>
              <th className="px-6 py-4 text-left font-semibold">Ferme</th>
              <th className="px-6 py-4 text-left font-semibold">
                Localisation
              </th>
              {canManage && (
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedTerrains.map((terrain) => {
              const TypeIcon = typeSolIcons[terrain.typeSol] || TreePine;
              return (
                <tr
                  key={terrain.id}
                  className="border-b border-[#FFC490]/10 hover:bg-[#FFF3DA]/30 transition-all duration-200 group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPinned size={18} className="text-[#3C6C5F]" />
                      </div>
                      <span className="font-semibold text-[#29453E]">
                        {terrain.nom}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3DA] text-[#29453E] text-xs font-semibold border border-[#FFC490]/30">
                      <Ruler size={12} />
                      {terrain.superficie} ha
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DDF3E8] text-[#3C6C5F] text-xs font-semibold border border-[#9DAE7A]/30">
                      <TypeIcon size={12} />
                      {terrain.typeSol}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-[#3C6C5F]/80">
                      <Building2 size={14} className="text-[#3C6C5F]/40" />
                      {terrain.ferme.nom}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {terrain.localisation ? (
                        <span className="flex items-center gap-1.5 text-sm text-[#3C6C5F]/80 font-medium">
                          <MapPin size={14} className="text-[#3C6C5F]/40" />
                          {terrain.localisation}
                        </span>
                      ) : (
                        <span className="text-xs text-[#3C6C5F]/40 italic">
                          Localisation non spécifiée
                        </span>
                      )}

                      {typeof terrain.latitude === "number" &&
                      typeof terrain.longitude === "number" ? (
                        <button
                          onClick={() => setCenterTerrainId(terrain.id)}
                          className="flex items-center gap-1.5 text-[11px] text-[#3C6C5F] hover:text-[#29453E] hover:underline transition-colors mt-0.5 text-left w-fit"
                          title="Centrer la carte sur ce terrain"
                        >
                          <Compass size={12} className="text-[#FFC490]" />
                          <span>
                            GPS: {terrain.latitude.toFixed(5)},{" "}
                            {terrain.longitude.toFixed(5)}
                          </span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-400 italic">
                          Pas de coordonnées GPS
                        </span>
                      )}
                    </div>
                  </td>

                  {canManage && (
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/terrains/${terrain.id}/edit`}
                          className="p-2.5 rounded-xl bg-[#DDF3E8] text-[#3C6C5F] hover:bg-[#3C6C5F] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          onClick={() => setTerrainToDelete(terrain.id)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-[#FFC490]/20 bg-[#FAFAFA]">
          <p className="text-xs text-[#3C6C5F]/50">
            Page {currentPage} sur {totalPages}
          </p>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                  currentPage === page
                    ? "bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white shadow-md shadow-[#3C6C5F]/20"
                    : "bg-[#FFF3DA] text-[#29453E] hover:bg-[#FFC490]/40"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {terrainToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29453E]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-[#FFC490]/30 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-[#29453E] mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-center text-[#3C6C5F]/70 mb-6">
              Êtes-vous sûr de vouloir supprimer ce terrain ? Cette action est
              irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTerrainToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-[#FAFAFA] text-[#29453E] border border-[#FFC490]/20 hover:bg-[#FFF3DA] transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isDeleting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
