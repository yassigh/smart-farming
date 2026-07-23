// components/FermeTable.tsx - Version avec design unifié et recherche vocale
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { deleteFermeAction } from "@/actions/ferme";
import {
  Pencil,
  Trash2,
  Warehouse,
  Search,
  Plus,
  MapPin,
  Ruler,
  User,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  Building2,
  Users,
  Mic,
  MicOff,
  AlertCircle,
} from "lucide-react";
import { Role } from "@prisma/client";

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
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
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
  new(): SpeechRecognition;
}

// Déclaration globale pour window
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface Ferme {
  id: number;
  nom: string;
  adresse: string;
  superficie: number;
  agriculteur: { id: number; nom: string; prenom: string };
}

interface Props {
  initialFermes: Ferme[];
  user: { id: number; role: Role };
}

//  Composant de recherche vocale
interface VoiceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onListeningChange?: (isListening: boolean) => void;
}

function VoiceSearch({ value, onChange, placeholder = "Rechercher...", onListeningChange }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hasSpeechRecognition = typeof window !== 'undefined' && 
      (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

    if (!hasSpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = 'fr-FR';
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
        console.error('Erreur de reconnaissance vocale:', event.error);
        let errorMessage = 'Erreur de reconnaissance';
        if (event.error === 'not-allowed') {
          errorMessage = '🎤 Accès au microphone refusé';
        } else if (event.error === 'no-speech') {
          errorMessage = '🎤 Aucune parole détectée';
        } else if (event.error === 'audio-capture') {
          errorMessage = '🎤 Aucun microphone trouvé';
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
        } catch (e) {
          // Ignorer les erreurs d'abort
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Erreur lors de l\'arrêt:', e);
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
          console.error('Erreur lors du démarrage:', e);
          setError('🎤 Impossible de démarrer le microphone');
          setTimeout(() => setError(null), 3000);
        }
      } else {
        setError('🎤 Reconnaissance vocale non disponible');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
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
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
        <input
          ref={inputRef}
          type="text"
          placeholder={isListening ? "🎤 Écoute en cours..." : error || placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isListening}
          className={`pl-10 pr-12 py-2.5 rounded-xl border-2 transition-all w-full sm:w-48 focus:w-60 text-sm text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:ring-4 ${
            isListening 
              ? 'border-[#3C6C5F] ring-4 ring-[#3C6C5F]/20 bg-[#DDF3E8]' 
              : error 
                ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                : 'border-[#FFC490]/30 bg-[#FAFAFA] focus:border-[#3C6C5F] focus:ring-[#3C6C5F]/10'
          }`}
        />
        <button
          onClick={toggleListening}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all duration-300 ${
            isListening
              ? 'bg-[#3C6C5F] text-white animate-pulse shadow-lg shadow-[#3C6C5F]/30'
              : error
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-[#FFF3DA] text-[#3C6C5F] hover:bg-[#FFC490]/30 hover:scale-110'
          }`}
          title={isListening ? "Arrêter l'écoute" : "Recherche vocale"}
        >
          {isListening ? <Mic size={18} /> : <Mic size={18} />}
        </button>
      </div>
      
      {isListening && (
        <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3C6C5F] animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#3C6C5F] animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#3C6C5F] animate-bounce" style={{ animationDelay: '300ms' }}></span>
          <span className="text-[10px] font-semibold text-[#3C6C5F]/70 ml-1">Écoute...</span>
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

export default function FermeTable({ initialFermes, user }: Props) {
  const [fermes, setFermes] = useState(initialFermes || []);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const canManage = user?.role === Role.ADMIN || user?.role === Role.AGRICULTEUR;
  const ITEMS_PER_PAGE = 8;

  // Notification auto-fermante
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function handleDelete(id: number) {
    if (!confirm("Voulez-vous vraiment supprimer cette ferme ?")) return;
    setDeletingId(id);
    setError(null);
    
    const result = await deleteFermeAction(id);
    if (result.success) {
      setFermes((old) => old.filter((f) => f.id !== id));
      setNotification({ type: 'success', message: "Ferme supprimée avec succès." });
    } else {
      setError(result.error || "Erreur lors de la suppression.");
      setNotification({ type: 'error', message: result.error || "Erreur lors de la suppression." });
    }
    setDeletingId(null);
  }

  const filteredFermes = useMemo(() =>
    fermes.filter((f) =>
      (f.nom + " " + f.adresse + " " + f.agriculteur.nom + " " + f.agriculteur.prenom)
        .toLowerCase().includes(search.toLowerCase())
    ), [fermes, search]);

  const totalPages = Math.ceil(filteredFermes.length / ITEMS_PER_PAGE);
  const paginated = filteredFermes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  //  Si l'utilisateur n'a pas les droits
  const canView = user?.role === Role.EMPLOYE || user?.role === Role.VETERINAIRE || canManage;

  if (!canView) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <Warehouse size={44} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Accès restreint</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          Vous n'avez pas les autorisations nécessaires pour voir cette page.
        </p>
      </div>
    );
  }

  //  Si aucune ferme
  if (fermes.length === 0) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <Warehouse size={48} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Aucune ferme</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          {canManage 
            ? "Commencez par ajouter votre première ferme."
            : "Aucune ferme n'est actuellement enregistrée dans le système."}
        </p>
        {canManage && (
          <Link
            href="/dashboard/fermes/add"
            className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl"
          >
            <Plus size={18} />
            Ajouter une ferme
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 overflow-hidden transition-all hover:shadow-xl">
      {/* HEADER */}
      <div className="p-6 border-b border-[#FFC490]/20 bg-gradient-to-r from-[#FFF3DA]/30 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DDF3E8] flex items-center justify-center shadow-sm">
              <Warehouse size={22} className="text-[#3C6C5F]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
                Liste des Fermes
                <Sparkles size={16} className="text-[#FFC490]" />
              </h2>
              <p className="text-sm text-[#3C6C5F]/60">
                {filteredFermes.length} ferme(s) trouvée(s)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/*  Recherche avec voix */}
            <VoiceSearch
              value={search}
              onChange={setSearch}
              placeholder="Rechercher par nom, adresse, propriétaire..."
              onListeningChange={setIsVoiceListening}
            />

            {canManage && (
              <Link
                href="/dashboard/fermes/add"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md shadow-[#3C6C5F]/20 hover:shadow-lg"
              >
                <Plus size={16} />
                Ajouter
              </Link>
            )}
          </div>
        </div>

        {/* Indicateur de recherche vocale active */}
        {isVoiceListening && (
          <div className="mt-3 flex items-center gap-2 text-sm text-[#3C6C5F] bg-[#DDF3E8] px-4 py-2 rounded-xl border border-[#3C6C5F]/20 animate-pulse">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3C6C5F] animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-[#3C6C5F] animate-ping" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 rounded-full bg-[#3C6C5F] animate-ping" style={{ animationDelay: '0.4s' }}></span>
            </div>
            <span className="font-semibold">🎤 Recherche vocale active - Parlez maintenant...</span>
            <span className="text-xs text-[#3C6C5F]/60">(Cliquez sur le micro pour arrêter)</span>
          </div>
        )}
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`m-6 p-4 rounded-2xl border-2 flex items-center justify-between shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'error' 
            ? "bg-red-50 border-red-200 text-red-700" 
            : "bg-[#DDF3E8] border-[#9DAE7A]/40 text-[#29453E]"
        }`}>
          <div className="flex items-center gap-3 font-medium">
            <span className="text-xl">{notification.type === 'error' ? '⚠️' : '✅'}</span>
            {notification.message}
          </div>
          <button 
            onClick={() => setNotification(null)}
            className={`p-1.5 rounded-lg transition-colors ${
              notification.type === 'error' ? "hover:bg-red-100" : "hover:bg-[#3C6C5F]/10"
            }`}
          >
            ✕
          </button>
        </div>
      )}

      {/* ERROR */}
      {error && !notification && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm flex items-center gap-2 animate-slideDown">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FFF3DA] text-[#29453E] text-xs uppercase tracking-wider">
              <th className="px-6 py-4 text-left font-semibold">Ferme</th>
              <th className="px-6 py-4 text-left font-semibold">Adresse</th>
              <th className="px-6 py-4 text-left font-semibold">Superficie</th>
              <th className="px-6 py-4 text-left font-semibold">Propriétaire</th>
              {canManage && (
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#FFC490]/10">
            {paginated.map((ferme) => (
              <tr
                key={ferme.id}
                className="hover:bg-[#FFF3DA]/30 transition-all duration-200 group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Warehouse size={18} className="text-[#3C6C5F]" />
                    </div>
                    <span className="font-bold text-[#29453E] text-sm">
                      {ferme.nom}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-[#3C6C5F]/80">
                    <MapPin size={14} className="text-[#3C6C5F]/40" />
                    {ferme.adresse}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3DA] text-[#29453E] text-xs font-semibold border border-[#FFC490]/30">
                    <Ruler size={12} />
                    {ferme.superficie} ha
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-[#3C6C5F]/80">
                    <User size={14} className="text-[#3C6C5F]/40" />
                    {ferme.agriculteur.prenom} {ferme.agriculteur.nom}
                  </span>
                </td>

                {canManage && (
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/fermes/${ferme.id}/edit`}
                        className="p-2.5 rounded-xl bg-[#DDF3E8] text-[#3C6C5F] hover:bg-[#3C6C5F] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <Pencil size={16} />
                      </Link>

                      <button
                        onClick={() => handleDelete(ferme.id)}
                        disabled={deletingId === ferme.id}
                        className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-[#FFC490]/20 bg-[#FAFAFA]">
          <p className="text-xs text-[#3C6C5F]/50">
            Page {currentPage} sur {totalPages} — {filteredFermes.length} résultats
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl border-2 border-[#FFC490]/30 bg-white text-[#29453E] hover:bg-[#FFF3DA] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            
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
            
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl border-2 border-[#FFC490]/30 bg-white text-[#29453E] hover:bg-[#FFF3DA] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-bounce {
          animation: bounce 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}