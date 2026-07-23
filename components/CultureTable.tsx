// components/CultureTable.tsx - Version avec recherche vocale
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { deleteCultureAction } from "@/actions/culture";
import {
  Wheat,
  Plus,
  Search,
  Pencil,
  Trash2,
  Sprout,
  Calendar,
  Building,
  Map,
  Wheat as WheatIcon,
  Sprout as SproutIcon,
  Calendar as CalendarIcon,
  Building2,
  MapPin,
  Package,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  TreePine,
  Flower2,
  Leaf,
  Apple,
  Tractor,
  Droplets,
  Sun,
  Moon,
  Cloud,
  Thermometer,
  Wind,
  Compass,
  Target,
  Award,
  Trophy,
  Star,
  Sparkles,
  Rocket,
  Zap,
  Crown,
  Gem,
  Diamond,
  Medal,
  BadgeCheck,
  Heart,
  Smile,
  Laugh,
  Coffee,
  Music,
  Camera,
  Video,
  Mic,
  Headphones,
  BookOpen,
  FolderOpen,
  Save,
  Download,
  Printer,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Gift,
  Box,
  Truck,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Wallet,
  Coins,
  PieChart,
  BarChart3,
  LineChart,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MicOff,
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

interface Culture {
  id: number;
  nom: string;
  datePlantation: Date;
  quantitePrevue: number;
  etat: string;
  terrain: {
    id: number;
    nom: string;
    superficie: number;
    ferme: {
      id: number;
      nom: string;
    };
  };
  categorie: {
    id: number;
    nom: string;
  };
}

interface CultureTableProps {
  user: {
    id: number;
    role: Role;
  };
  initialCultures: Culture[];
}

const STATUT_LABEL: Record<string, { label: string; color: string }> = {
  PLANTEE: { label: "Plantée", color: "bg-[#9DAE7A]/20 text-[#3C6C5F] border-[#9DAE7A]" },
  EN_CROISSANCE: { label: "En croissance", color: "bg-blue-50 text-blue-700 border-blue-200" },
  RECOLTEE: { label: "Récoltée", color: "bg-[#FFC490]/20 text-[#29453E] border-[#FFC490]" },
  PERDUE: { label: "Perdue", color: "bg-red-50 text-red-700 border-red-200" },
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

//  Composant AlertDialog personnalisé pour les cultures
interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isDeleting?: boolean;
  cultureName?: string;
}

const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Supprimer",
  cancelText = "Annuler",
  type = "danger",
  isDeleting = false,
  cultureName,
}: AlertDialogProps) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-600",
          iconBg: "bg-red-50",
          border: "border-red-200",
          confirmBg: "bg-red-600 hover:bg-red-700",
          confirmHover: "hover:bg-red-700",
          shadowColor: "shadow-red-500/20",
        };
      case "warning":
        return {
          icon: "text-amber-600",
          iconBg: "bg-amber-50",
          border: "border-amber-200",
          confirmBg: "bg-amber-600 hover:bg-amber-700",
          confirmHover: "hover:bg-amber-700",
          shadowColor: "shadow-amber-500/20",
        };
      case "info":
        return {
          icon: "text-blue-600",
          iconBg: "bg-blue-50",
          border: "border-blue-200",
          confirmBg: "bg-blue-600 hover:bg-blue-700",
          confirmHover: "hover:bg-blue-700",
          shadowColor: "shadow-blue-500/20",
        };
      default:
        return {
          icon: "text-red-600",
          iconBg: "bg-red-50",
          border: "border-red-200",
          confirmBg: "bg-red-600 hover:bg-red-700",
          confirmHover: "hover:bg-red-700",
          shadowColor: "shadow-red-500/20",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-[#FFC490]/20 overflow-hidden animate-scaleIn">
        <div className={`p-6 border-b ${styles.border} bg-gradient-to-r from-[#FFF3DA]/30 to-white`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <AlertCircle size={24} className={styles.icon} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#29453E]">{title}</h3>
              <p className="text-sm text-[#3C6C5F]/70 mt-1">{message}</p>
              {cultureName && (
                <p className="text-sm font-semibold text-[#29453E] mt-2">
                  Culture : <span className="text-[#3C6C5F]">"{cultureName}"</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#FAFAFA]">
          <div className="bg-amber-50 border-2 border-amber-200/50 rounded-2xl p-4 mb-2">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Cette action est irréversible
                </p>
                <p className="text-xs text-amber-700/80 mt-1">
                  Toutes les données associées à cette culture seront définitivement supprimées.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-[#FFC490]/20 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-2.5 rounded-xl border-2 border-[#E8E3DC] text-[#29453E] font-medium hover:bg-[#FFF3DA] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-300 shadow-lg ${styles.shadowColor} flex items-center justify-center gap-2 ${styles.confirmBg}`}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Suppression...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

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

export default function CultureTable({ user, initialCultures }: CultureTableProps) {
  const [cultures, setCultures] = useState<Culture[]>(initialCultures || []);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // État pour le dialogue de confirmation
  const [alertOpen, setAlertOpen] = useState(false);
  const [cultureToDelete, setCultureToDelete] = useState<{ id: number; nom: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = user?.role === Role.ADMIN || user?.role === Role.AGRICULTEUR;
  const canView = user?.role === Role.EMPLOYE || user?.role === Role.VETERINAIRE || canManage;
  const ITEMS_PER_PAGE = 5;

  const handleDelete = (id: number, nom: string) => {
    setCultureToDelete({ id, nom });
    setAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!cultureToDelete) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteCultureAction(cultureToDelete.id);
      
      if (result.success) {
        setCultures((old) => old.filter((c) => c.id !== cultureToDelete.id));
        setAlertOpen(false);
        setCultureToDelete(null);
      } else {
        setError(result.error || "Erreur lors de la suppression.");
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const closeAlert = () => {
    if (!isDeleting) {
      setAlertOpen(false);
      setCultureToDelete(null);
    }
  };

  const filteredCultures = cultures.filter((culture) =>
    (culture.nom + " " + culture.categorie.nom + " " + culture.terrain.nom + " " + culture.terrain.ferme.nom)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCultures.length / ITEMS_PER_PAGE);
  const paginatedCultures = filteredCultures.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!canView) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <Sprout size={44} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Accès restreint</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          Vous n'avez pas les autorisations nécessaires pour voir cette page.
        </p>
      </div>
    );
  }

  if (cultures.length === 0) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <Sprout size={48} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Aucune culture enregistrée</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          {canManage 
            ? "Commencez par ajouter votre première culture."
            : "Aucune culture n'est actuellement enregistrée dans le système."}
        </p>
        {canManage && (
          <Link
            href="/dashboard/cultures/add"
            className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl"
          >
            <Plus size={18} />
            Ajouter une culture
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertOpen}
        onClose={closeAlert}
        onConfirm={confirmDelete}
        title="Supprimer la culture"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette culture ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        isDeleting={isDeleting}
        cultureName={cultureToDelete?.nom}
      />

      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 overflow-hidden transition-all hover:shadow-xl">
        {/* HEADER */}
        <div className="p-6 border-b border-[#FFC490]/20 bg-gradient-to-r from-[#FFF3DA]/30 to-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#DDF3E8] flex items-center justify-center shadow-sm">
                <Sprout size={22} className="text-[#3C6C5F]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
                  Liste des Cultures
                  <Sparkles size={16} className="text-[#FFC490]" />
                </h2>
                <p className="text-sm text-[#3C6C5F]/60">
                  {filteredCultures.length} culture(s) trouvée(s)
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/*  Recherche avec voix */}
              <VoiceSearch
                value={search}
                onChange={setSearch}
                placeholder="Rechercher par nom, catégorie, terrain, ferme..."
                onListeningChange={setIsVoiceListening}
              />

              {canManage && (
                <Link
                  href="/dashboard/cultures/add"
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
                <span className="w-2 h-2 rounded-full bg-[#3C6C5F] animate-ping" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-[#3C6C5F] animate-ping" style={{ animationDelay: '0.4s' }}></span>
              </div>
              <span className="font-semibold">🎤 Recherche vocale active - Parlez maintenant...</span>
              <span className="text-xs text-[#3C6C5F]/60">(Cliquez sur le micro pour arrêter)</span>
            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="m-5 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm flex items-center gap-2 animate-slideDown">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFF3DA] text-[#29453E] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 text-left font-semibold">Culture</th>
                <th className="px-6 py-4 text-left font-semibold">Catégorie</th>
                <th className="px-6 py-4 text-left font-semibold">Terrain / Ferme</th>
                <th className="px-6 py-4 text-left font-semibold">Superficie</th>
                <th className="px-6 py-4 text-left font-semibold">Date Plantation</th>
                <th className="px-6 py-4 text-left font-semibold">Qte Prévue</th>
                <th className="px-6 py-4 text-left font-semibold">Statut</th>
                {canManage && (
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {paginatedCultures.map((culture) => {
                const statut = STATUT_LABEL[culture.etat] || STATUT_LABEL.PLANTEE;
                return (
                  <tr
                    key={culture.id}
                    className="border-b border-[#FFC490]/10 hover:bg-[#FFF3DA]/30 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sprout size={18} className="text-[#3C6C5F]" />
                        </div>
                        <span className="font-semibold text-[#29453E]">
                          {culture.nom}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#29453E]">
                        {culture.categorie.nom}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="flex items-center gap-1.5 text-sm text-[#29453E]">
                          <MapPin size={14} className="text-[#3C6C5F]/40" />
                          {culture.terrain.nom}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[#3C6C5F]/60">
                          <Building2 size={12} className="text-[#3C6C5F]/30" />
                          {culture.terrain.ferme.nom}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3DA] text-[#29453E] text-xs font-semibold border border-[#FFC490]/30">
                        <RulerIcon size={12} />
                        {culture.terrain.superficie} ha
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-[#29453E]">
                        <Calendar size={14} className="text-[#3C6C5F]/40" />
                        {formatDate(culture.datePlantation)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#29453E] text-sm">
                        {culture.quantitePrevue} kg
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statut.color}`}>
                        {statut.label}
                      </span>
                    </td>

                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/cultures/${culture.id}/edit`}
                            className="p-2.5 rounded-xl bg-[#DDF3E8] text-[#3C6C5F] hover:bg-[#3C6C5F] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            onClick={() => handleDelete(culture.id, culture.nom)}
                            disabled={deletingId === culture.id}
                            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
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
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
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
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-bounce {
          animation: bounce 0.8s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

// Ajout de l'icône Ruler manquante
function RulerIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 21L3 3" />
      <path d="M17 7l-4 4" />
      <path d="M13 3l-4 4" />
      <path d="M9 9l-4 4" />
    </svg>
  );
}