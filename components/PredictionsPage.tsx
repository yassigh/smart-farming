// components/PredictionsPage.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { deletePredictionAction } from "@/actions/prediction";
import { generateAllPredictions, getFarmHealthScore, askAssistant } from "@/actions/predictionIA";
import { getWeatherData, getWeatherDescription, getWeatherIcon } from "@/actions/openMeteo";
import AddPredictionForm from "./AddPredictionForm";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wheat,
  Cloud,
  Sparkles,
  BarChart3,
  Target,
  Layers,
  Trash2,
  Clock,
  User,
  AlertCircle,
  Sprout,
  HeartPulse,
  Building2,
  Clock as ClockIcon,
  Zap,
  Loader2,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  Lightbulb,
  AlertTriangle,
  Beef,
  Wallet,
  MessageSquare,
  Send,
  LineChart,
  PieChart,
  Calendar,
  Activity,
  Droplets,
  ShieldAlert,
  Award,
  BadgeCheck,
  ArrowRight,
  Leaf,
  Droplet,
  Shield,
  CheckCircle,
  Rocket,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Gauge,
  Thermometer as ThermometerIcon,
  Droplet as DropletIcon,
  Wind as WindIcon,
  CloudRain as CloudRainIcon,
  AlertTriangle as AlertTriangleIcon,
  Sunrise,
  Sunset,
  Calendar as CalendarIcon,
  Bot,
  Star,
  ChevronRight,
  Info,
  BookOpen,
  HandHelping,
  Bug,
  Scissors,
  Milk,
  TreeDeciduous,
  Shrub,
  CircleDot,
  Flame,
  Snowflake,
  Eye,
  CalendarCheck,
  ClipboardList,
  Megaphone,
} from "lucide-react";

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────
type Prediction = {
  id: number;
  type: string;
  resultat: string;
  confiance: number | null;
  date: Date;
  ferme: { nom: string };
  createdBy: { prenom: string; nom: string };
  conseils?: { id: number; description: string; date: Date }[];
};

interface PredictionsPageProps {
  user: { id: number; role: string };
  fermes: { id: number; nom: string }[];
  predictions: Prediction[];
  fermeId?: number;
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  source?: "huggingface" | "local";
  hasFarmContext?: boolean;
};

// ──────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────
const LABEL_TYPE: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  RENDEMENT_CULTURE: {
    label: "Rendement",
    icon: <Sprout size={14} />,
    color: "text-emerald-700 border-emerald-300",
    bg: "bg-emerald-50",
  },
  REVENUS: {
    label: "Revenus",
    icon: <TrendingUp size={14} />,
    color: "text-emerald-700 border-emerald-300",
    bg: "bg-emerald-50",
  },
  DEPENSES: {
    label: "Dépenses",
    icon: <TrendingDown size={14} />,
    color: "text-red-700 border-red-300",
    bg: "bg-red-50",
  },
  MALADIE_ANIMAL: {
    label: "Santé animale",
    icon: <HeartPulse size={14} />,
    color: "text-amber-700 border-amber-300",
    bg: "bg-amber-50",
  },
  METEO: {
    label: "Météo",
    icon: <Cloud size={14} />,
    color: "text-blue-700 border-blue-300",
    bg: "bg-blue-50",
  },
  RENDEMENT: {
    label: "Rendement",
    icon: <Wheat size={14} />,
    color: "text-emerald-700 border-emerald-300",
    bg: "bg-emerald-50",
  },
  IRRIGATION: {
    label: "Irrigation",
    icon: <Droplets size={14} />,
    color: "text-blue-700 border-blue-300",
    bg: "bg-blue-50",
  },
  MALADIE: {
    label: "Maladies",
    icon: <ShieldAlert size={14} />,
    color: "text-amber-700 border-amber-300",
    bg: "bg-amber-50",
  },
  FINANCES: {
    label: "Finances",
    icon: <Wallet size={14} />,
    color: "text-emerald-700 border-emerald-300",
    bg: "bg-emerald-50",
  },
  AUTRE: {
    label: "Autre",
    icon: <Sparkles size={14} />,
    color: "text-purple-700 border-purple-300",
    bg: "bg-purple-50",
  },
};

const SUGGESTIONS = [
  { label: "Comment améliorer mon rendement ?", icon: <Sprout size={13} />, color: "hover:bg-emerald-50 hover:border-emerald-300" },
  { label: "Risques de maladies actuels ?", icon: <ShieldAlert size={13} />, color: "hover:bg-amber-50 hover:border-amber-300" },
  { label: "Quand et combien irriguer ?", icon: <Droplets size={13} />, color: "hover:bg-blue-50 hover:border-blue-300" },
  { label: "Analyse financière de ma ferme", icon: <Wallet size={13} />, color: "hover:bg-emerald-50 hover:border-emerald-300" },
  { label: "Impact de la météo sur mes cultures ?", icon: <Cloud size={13} />, color: "hover:bg-sky-50 hover:border-sky-300" },
  { label: "Conseils pour mes animaux", icon: <Beef size={13} />, color: "hover:bg-orange-50 hover:border-orange-300" },
];

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" });
}

// ──────────────────────────────────────────
// Composant graphique bar
// ──────────────────────────────────────────
const BarChart = ({ data }: { data: { label: string; value: number; color?: string }[] }) => {
  const max = Math.max(...data.map((d) => d.value || 0), 1);
  const colors = ["bg-[#3C6C5F]", "bg-[#9DAE7A]", "bg-[#FFC490]", "bg-[#5A8A7A]", "bg-[#D4A574]"];

  if (!data.length || data.every((d) => d.value === 0)) {
    return (
      <div className="w-full h-32 flex items-center justify-center text-[#3C6C5F]/30 dark:text-[#9DAE7A]/30 gap-2">
        <BarChart3 size={20} className="opacity-40" />
        <span className="text-sm">Aucune donnée</span>
      </div>
    );
  }

  return (
    <div className="w-full h-36 flex items-end gap-2 px-2">
      {data.map((item, i) => {
        const height = max > 0 ? (item.value / max) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-[9px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.value}%
            </span>
            <div
              className={`w-full ${item.color || colors[i % colors.length]} rounded-t-lg transition-all duration-700 hover:opacity-75 relative overflow-hidden`}
              style={{ height: `${Math.max(height, 5)}%`, minHeight: "8px" }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-[9px] text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50 truncate w-full text-center font-medium">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ──────────────────────────────────────────
// Composant Score circulaire
// ──────────────────────────────────────────
const CircleScore = ({ score, size = 120 }: { score: number; size?: number }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#3C6C5F" : score >= 60 ? "#D4A574" : "#ef4444";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="transparent" stroke="#FFF3DA" strokeWidth="8"
        className="dark:stroke-[#2a3f38]"
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="transparent" stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-1000"
      />
    </svg>
  );
};

// ──────────────────────────────────────────
// Composant Bulle de chat
// ──────────────────────────────────────────
const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  // Formater le texte avec markdown simple
  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-end`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md ${
        isUser
          ? "bg-gradient-to-br from-[#3C6C5F] to-[#29453E]"
          : "bg-gradient-to-br from-[#D4A574] to-[#FFC490]"
      }`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Label */}
        <span className="text-[10px] text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50 font-medium px-1 flex items-center gap-1">
          {isUser ? "Vous" : (
            <>
              AgriBot
              {message.source === "huggingface" && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full text-[9px] flex items-center gap-0.5">
                  <Sparkles size={8} />
                  IA
                </span>
              )}
              {message.hasFarmContext && (
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full text-[9px] flex items-center gap-0.5">
                  <CheckCircle size={8} />
                  Contexte ferme
                </span>
              )}
            </>
          )}
        </span>

        {/* Bulle */}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white rounded-br-sm"
            : "bg-white dark:bg-[#1a2e28] text-[#29453E] dark:text-[#d4e8d0] border border-[#FFC490]/20 dark:border-[#FFC490]/10 rounded-bl-sm"
        }`}>
          <span
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
        </div>

        {/* Heure */}
        <span className="text-[10px] text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────
// Composant Typing indicator
// ──────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-3 items-end">
    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md bg-gradient-to-br from-[#D4A574] to-[#FFC490]">
      <Bot size={14} />
    </div>
    <div className="bg-white dark:bg-[#1a2e28] border border-[#FFC490]/20 dark:border-[#FFC490]/10 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-[#D4A574]/60 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────
// Composant KPI Card
// ──────────────────────────────────────────
const KpiCard = ({
  label, value, icon, sub, trend,
}: {
  label: string; value: string | number; icon: React.ReactNode; sub?: string; trend?: "up" | "down" | "neutral";
}) => (
  <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-semibold uppercase tracking-wider">{label}</p>
      <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] dark:bg-[#2a3f38] flex items-center justify-center text-[#3C6C5F] dark:text-[#9DAE7A] group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-[#29453E] dark:text-white">{value}</p>
    {sub && (
      <p className={`text-xs mt-1.5 flex items-center gap-1 ${
        trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50"
      }`}>
        {trend === "up" && <TrendingUp size={11} />}
        {trend === "down" && <TrendingDown size={11} />}
        {sub}
      </p>
    )}
  </div>
);

// ══════════════════════════════════════════
// Composant principal
// ══════════════════════════════════════════
export default function PredictionsPage({
  user, fermes, predictions, fermeId: initialFermeId,
}: PredictionsPageProps) {

  // ── State général ──
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [fermeId, setFermeId] = useState<number>(initialFermeId || fermes[0]?.id || 0);

  // ── État IA ──
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [healthScore, setHealthScore] = useState<any>(null);

  // ── État Chat conversationnel ──
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `**Bonjour !** Je suis **AgriBot**, votre assistant agricole intelligent.\n\nJe connais votre ferme et je peux vous donner des conseils personnalisés basés sur vos données réelles (cultures, animaux, finances, météo).\n\nPosez-moi une question ou choisissez une suggestion ci-dessous !`,
      timestamp: new Date(),
      source: "local",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // ── État Météo ──
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [selectedWeatherDay, setSelectedWeatherDay] = useState<number>(0);

  // ── Chargement initial ──
  useEffect(() => {
    if (fermeId > 0) {
      loadHealthScore();
      loadWeatherData();
    }
  }, [fermeId]);

  // ── Scroll chat ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const loadHealthScore = async () => {
    setLoading(true);
    try {
      const result = await getFarmHealthScore(fermeId);
      if (result.success) setHealthScore(result.data);
    } catch (err) {
      console.error("Erreur score santé:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await getWeatherData(36.7538, 3.0588, "Africa/Algiers");
      if (data) setWeatherData(data);
      else setWeatherError("Aucune donnée météo disponible");
    } catch {
      setWeatherError("Erreur de connexion au service météo");
    } finally {
      setWeatherLoading(false);
    }
  };

  const generatePredictions = async () => {
    setGenerating(true);
    try {
      const result = await generateAllPredictions(fermeId, user.id);
      if (result.success) {
        await loadHealthScore();
        window.location.reload();
      }
    } catch (err) {
      console.error("Erreur génération:", err);
    } finally {
      setGenerating(false);
    }
  };

  // ── Envoyer message chat ──
  const sendChatMessage = useCallback(async (messageText?: string) => {
    const text = (messageText || chatInput).trim();
    if (!text || chatLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, fermeId }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply || "Désolé, je n'ai pas pu traiter votre question.",
        timestamp: new Date(),
        source: data.source,
        hasFarmContext: data.hasFarmContext,
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "⚠️ Erreur de connexion. Vérifiez votre connexion et réessayez.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
      chatInputRef.current?.focus();
    }
  }, [chatInput, chatLoading, fermeId]);

  // ── Gestion des prédictions ──
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const result = await deletePredictionAction(id);
      if (result.success) window.location.reload();
    } catch (err) {
      console.error("Erreur suppression:", err);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(null);
    }
  };

  // ── Filtrage ──
  const filteredPredictions = predictions.filter((p) => {
    const matchType = filterType === "all" || p.type === filterType;
    const matchSearch =
      p.resultat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ferme.nom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const avgConfiance =
    predictions.filter((p) => p.confiance !== null).length > 0
      ? predictions.filter((p) => p.confiance !== null).reduce((s, p) => s + (p.confiance ?? 0), 0) /
        predictions.filter((p) => p.confiance !== null).length
      : null;

  const healthDetails = healthScore
    ? (Object.entries(healthScore.details) as [string, number][])
    : [];

  const chartData = healthDetails.map(([key, value]) => ({
    label: key === "rendement" ? "Rend." : key === "animaux" ? "Anim." : "Fin.",
    value,
    color: key === "rendement" ? "bg-[#3C6C5F]" : key === "animaux" ? "bg-[#D4A574]" : "bg-[#9DAE7A]",
  }));

  const getConfidenceColor = (c: number) =>
    c >= 80 ? "bg-[#3C6C5F]" : c >= 50 ? "bg-[#D4A574]" : "bg-red-500";

  const getConfidenceBadgeColor = (c: number) =>
    c >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : c >= 50
      ? "bg-amber-50 text-amber-700 border-amber-300"
      : "bg-red-50 text-red-700 border-red-300";

  const getScoreColor = (s: number) =>
    s >= 80
      ? "text-[#29453E] bg-[#DDF3E8] border-[#9DAE7A]"
      : s >= 60
      ? "text-[#D4A574] bg-[#FFF3DA] border-[#FFC490]"
      : "text-red-600 bg-red-50 border-red-200";

  const getRiskBadge = (risque: string) => {
    switch (risque) {
      case "FAIBLE": return "bg-emerald-50 text-emerald-700 border border-emerald-300";
      case "MOYEN": return "bg-amber-50 text-amber-700 border border-amber-300";
      case "ELEVE": return "bg-red-50 text-red-700 border border-red-300";
      default: return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  // ── Tous les conseils IA sauvegardés ──
  const allConseils = predictions
    .filter((p) => p.conseils && p.conseils.length > 0)
    .flatMap((p) => p.conseils!.map((c) => ({ ...c, predictionType: p.type })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12);

  // ── Conseils statiques enrichis par catégorie ──
  const STATIC_CONSEILS: { categorie: string; icon: React.ReactNode; color: string; bg: string; conseils: { titre: string; description: string; priorite: "haute" | "moyenne" | "basse" }[] }[] = [
    {
      categorie: "Cultures & Rendement",
      icon: <Sprout size={18} />,
      color: "text-emerald-700",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      conseils: [
        { titre: "Rotation des cultures", description: "Alternez les familles de plantes chaque saison pour préserver la fertilité du sol et réduire les maladies.", priorite: "haute" },
        { titre: "Analyse du sol", description: "Effectuez une analyse de sol avant chaque cycle de plantation pour ajuster les apports en engrais.", priorite: "haute" },
        { titre: "Paillage organique", description: "Utilisez du paillage pour conserver l'humidité, réguler la température et limiter les adventices.", priorite: "moyenne" },
        { titre: "Semis échelonnés", description: "Étalez vos semis sur 2-3 semaines pour répartir les récoltes et minimiser les risques météo.", priorite: "moyenne" },
        { titre: "Taille et éclaircissage", description: "Taillez régulièrement les plants et éclaircissez pour favoriser la circulation d'air et la croissance.", priorite: "basse" },
      ],
    },
    {
      categorie: "Santé animale",
      icon: <HeartPulse size={18} />,
      color: "text-rose-700",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      conseils: [
        { titre: "Calendrier vaccinal", description: "Respectez scrupuleusement le calendrier de vaccination pour prévenir les épidémies du cheptel.", priorite: "haute" },
        { titre: "Hygiène des abreuvoirs", description: "Nettoyez les abreuvoirs et mangeoires au moins 2 fois par semaine pour éviter les contaminations.", priorite: "haute" },
        { titre: "Surveillance quotidienne", description: "Inspectez visuellement vos animaux chaque matin : posture, appétit, yeux, état du pelage.", priorite: "moyenne" },
        { titre: "Gestion du stress thermique", description: "En période de forte chaleur, assurez un ombrage suffisant et de l'eau fraîche en permanence.", priorite: "moyenne" },
        { titre: "Vermifugation régulière", description: "Traitez contre les parasites internes selon les recommandations vétérinaires saisonnières.", priorite: "basse" },
      ],
    },
    {
      categorie: "Irrigation & Eau",
      icon: <Droplets size={18} />,
      color: "text-blue-700",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      conseils: [
        { titre: "Irrigation goutte-à-goutte", description: "Privilégiez le goutte-à-goutte pour économiser jusqu'à 50% d'eau par rapport à l'aspersion.", priorite: "haute" },
        { titre: "Horaires d'arrosage", description: "Arrosez tôt le matin (6h-8h) ou en fin de journée (18h-20h) pour limiter l'évaporation.", priorite: "haute" },
        { titre: "Capteurs d'humidité", description: "Installez des sondes tensiométriques pour mesurer l'humidité du sol et irriguer à bon escient.", priorite: "moyenne" },
        { titre: "Récupération d'eau de pluie", description: "Mettez en place des systèmes de collecte d'eau pluviale pour réduire votre consommation.", priorite: "moyenne" },
        { titre: "Qualité de l'eau", description: "Faites tester votre eau d'irrigation annuellement pour détecter les contaminants potentiels.", priorite: "basse" },
      ],
    },
    {
      categorie: "Protection des cultures",
      icon: <ShieldAlert size={18} />,
      color: "text-amber-700",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      conseils: [
        { titre: "Lutte intégrée (IPM)", description: "Combinez méthodes biologiques, culturales et chimiques en dernier recours pour protéger vos cultures.", priorite: "haute" },
        { titre: "Auxiliaires naturels", description: "Favorisez les insectes utiles (coccinelles, chrysopes) en plantant des haies et bandes fleuries.", priorite: "moyenne" },
        { titre: "Surveillance des ravageurs", description: "Installez des pièges à phéromones et inspectez régulièrement pour détecter précocement les infestations.", priorite: "haute" },
        { titre: "Traitement préventif", description: "Appliquez les traitements fongicides préventifs avant les périodes à risque (humidité élevée).", priorite: "moyenne" },
        { titre: "Filets anti-insectes", description: "Utilisez des filets de protection pour les cultures sensibles aux mouches et papillons ravageurs.", priorite: "basse" },
      ],
    },
    {
      categorie: "Gestion financière",
      icon: <Wallet size={18} />,
      color: "text-violet-700",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      conseils: [
        { titre: "Suivi des coûts par parcelle", description: "Enregistrez tous les intrants et heures de travail par parcelle pour calculer la rentabilité réelle.", priorite: "haute" },
        { titre: "Diversification des revenus", description: "Explorez la transformation (confitures, fromages) et la vente directe pour améliorer vos marges.", priorite: "moyenne" },
        { titre: "Assurance récolte", description: "Souscrivez une assurance multirisque climatique pour protéger vos revenus des aléas météo.", priorite: "haute" },
        { titre: "Achats groupés", description: "Rejoignez une coopérative pour bénéficier de tarifs négociés sur les semences et intrants.", priorite: "moyenne" },
        { titre: "Budget prévisionnel", description: "Établissez un budget saisonnier détaillé et suivez les écarts mensuellement pour anticiper les problèmes.", priorite: "basse" },
      ],
    },
  ];

  const [conseilCategorieOuverte, setConseilCategorieOuverte] = useState<string | null>("Cultures & Rendement");

  // ══════════════════════════════════════════
  // RENDU
  // ══════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d1a15] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-5 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-[#3C6C5F] to-[#29453E] rounded-2xl shadow-lg shadow-[#3C6C5F]/20">
                  <Brain className="text-white" size={28} />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#1a2e28] animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#29453E] dark:text-white flex items-center gap-2">
                  IA & Prédictions
                  <span className="text-xs bg-[#FFC490]/20 text-[#D4A574] px-2.5 py-1 rounded-full font-normal flex items-center gap-1">
                    <Sparkles size={11} /> v1.0
                  </span>
                </h1>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <BarChart3 size={13} /> {predictions.length} prédictions
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 size={13} /> {fermes.length} ferme(s)
                  </span>
                  {healthScore && (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getScoreColor(healthScore.score)}`}>
                      <Activity size={11} /> {healthScore.score}/100
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sélecteur de ferme */}
              {fermes.length > 1 && (
                <select
                  value={fermeId}
                  onChange={(e) => setFermeId(Number(e.target.value))}
                  className="px-3 py-2 text-sm rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] outline-none"
                >
                  {fermes.map((f) => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => { setIsRefreshing(true); window.location.reload(); }}
                disabled={isRefreshing}
                className="p-2.5 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all border border-[#FFC490]/20"
              >
                <RefreshCw size={17} className={`text-[#3C6C5F] dark:text-[#9DAE7A] ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={generatePredictions}
                disabled={generating || fermeId === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#3C6C5F]/20 disabled:opacity-50"
              >
                {generating ? (
                  <><Loader2 className="animate-spin" size={17} /> Analyse...</>
                ) : (
                  <><Zap size={17} /> Analyser</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex gap-1.5 bg-white dark:bg-[#1a2e28] rounded-2xl p-1.5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-x-auto">
          {[
            { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
            { id: "weather", label: "Météo", icon: Cloud },
            { id: "conseils", label: "Conseils", icon: Lightbulb },
            { id: "predictions", label: "Prédictions", icon: Target },
            { id: "assistant", label: "Assistant IA", icon: Bot },
            { id: "analytics", label: "Analyses", icon: PieChart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white shadow-md"
                    : "text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] hover:text-[#29453E] dark:hover:text-[#9DAE7A]"
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {tab.id === "assistant" && (
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════
            TAB: DASHBOARD
        ════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="space-y-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KpiCard
                label="Prédictions"
                value={predictions.length}
                icon={<BarChart3 size={19} />}
                sub={`${new Set(predictions.map((p) => p.type)).size} types`}
              />
              <KpiCard
                label="Confiance moy."
                value={avgConfiance !== null ? `${avgConfiance.toFixed(0)}%` : "—"}
                icon={<Target size={19} />}
                sub={avgConfiance !== null && avgConfiance >= 75 ? "Fiabilité élevée" : "Fiabilité modérée"}
                trend={avgConfiance !== null && avgConfiance >= 75 ? "up" : "neutral"}
              />
              <KpiCard
                label="Fermes"
                value={fermes.length}
                icon={<Building2 size={19} />}
                sub={fermes[0]?.nom || ""}
              />
              <KpiCard
                label="Score santé"
                value={healthScore ? `${healthScore.score}/100` : loading ? "…" : "—"}
                icon={<Activity size={19} />}
                sub={healthScore ? healthScore.niveau : ""}
                trend={healthScore?.score >= 70 ? "up" : healthScore?.score < 50 ? "down" : "neutral"}
              />
            </div>

            {/* Score santé + graphiques */}
            {loading ? (
              <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-10 shadow-xl border border-[#FFC490]/20 flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[#3C6C5F]" size={22} />
                <span className="text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70">Calcul du score de santé…</span>
              </div>
            ) : healthScore ? (
              <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Score circulaire */}
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <CircleScore score={healthScore.score} size={130} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-[#29453E] dark:text-white">{healthScore.score}</p>
                          <p className="text-xs text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50">/100</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 flex items-center gap-1.5 ${getScoreColor(healthScore.score)}`}>
                      <Award size={13} /> {healthScore.niveau}
                    </span>
                  </div>

                  {/* Graphique détails */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-[#29453E] dark:text-white flex items-center gap-2">
                        <PieChart size={16} className="text-[#3C6C5F]" />
                        Détails par catégorie
                      </h4>
                      <span className="text-xs text-[#3C6C5F]/50 flex items-center gap-1">
                        <Target size={11} />
                        Moy. {Math.round(healthDetails.reduce((a, [, v]) => a + v, 0) / (healthDetails.length || 1))}%
                      </span>
                    </div>
                    <BarChart data={chartData} />

                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {healthDetails.map(([key, value]) => (
                        <div key={key} className="bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl p-3 text-center border border-[#FFC490]/10 hover:border-[#3C6C5F]/30 transition-colors">
                          <p className="text-[11px] text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center justify-center gap-1 mb-1">
                            {key === "rendement" ? <Sprout size={11} /> : key === "animaux" ? <Beef size={11} /> : <Wallet size={11} />}
                            {key === "rendement" ? "Rendement" : key === "animaux" ? "Animaux" : "Finances"}
                          </p>
                          <p className={`text-xl font-bold ${value >= 70 ? "text-[#29453E] dark:text-[#9DAE7A]" : value >= 50 ? "text-[#D4A574]" : "text-red-500"}`}>
                            {value}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommandations */}
                <div className="mt-5 p-4 bg-gradient-to-r from-[#FFF3DA] to-[#FAFAFA] dark:from-[#2a3f38]/60 dark:to-[#1a2e28] rounded-2xl border border-[#FFC490]/30 dark:border-[#FFC490]/10">
                  <p className="text-sm font-semibold text-[#29453E] dark:text-white mb-3 flex items-center gap-2">
                    <Lightbulb size={15} className="text-[#D4A574]" />
                    Recommandations prioritaires
                  </p>
                  <div className="space-y-2">
                    {healthScore.recommandations.map((rec: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-[#29453E] dark:text-[#d4e8d0] bg-white/70 dark:bg-black/20 p-3 rounded-xl hover:bg-white dark:hover:bg-black/30 transition-all border border-[#FFC490]/10 cursor-default">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-full flex items-center justify-center text-[#3C6C5F] text-xs font-bold border border-[#9DAE7A]/30">
                          {i + 1}
                        </span>
                        <span className="flex-1 leading-relaxed">{rec}</span>
                        <ChevronRight size={14} className="text-[#3C6C5F]/30 dark:text-[#9DAE7A]/30 flex-shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-10 shadow-xl border border-[#FFC490]/20 text-center">
                <Brain size={40} className="text-[#3C6C5F]/30 mx-auto mb-3" />
                <p className="text-[#29453E] dark:text-white font-semibold">Aucun score calculé</p>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-1 mb-4">Cliquez sur "Analyser" pour obtenir le score de santé de votre ferme</p>
                <button
                  onClick={generatePredictions}
                  disabled={generating}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white rounded-xl flex items-center gap-2 mx-auto hover:from-[#29453E] hover:to-[#1f332e] transition-all shadow-lg"
                >
                  {generating ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                  Lancer l'analyse IA
                </button>
              </div>
            )}

            {/* Conseils IA sauvegardés */}
            {allConseils.length > 0 && (
              <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen size={16} className="text-[#D4A574]" />
                  Derniers conseils IA enregistrés
                  <span className="ml-auto text-xs text-[#3C6C5F]/50 bg-[#FFF3DA] dark:bg-[#2a3f38] px-2 py-0.5 rounded-full">
                    {allConseils.length}
                  </span>
                </h4>
                <div className="space-y-2">
                  {allConseils.map((conseil) => {
                    const meta = LABEL_TYPE[conseil.predictionType] ?? LABEL_TYPE.AUTRE;
                    return (
                      <div key={conseil.id} className="flex gap-3 p-3 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl border border-[#FFC490]/10 hover:border-[#3C6C5F]/20 transition-colors group">
                        <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mb-1">{meta.label}</p>
                          <p className="text-sm text-[#29453E] dark:text-[#d4e8d0] leading-relaxed line-clamp-2">
                            {conseil.description}
                          </p>
                        </div>
                        <span className="text-[10px] text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 flex-shrink-0 mt-1">
                          {new Date(conseil.date).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setActiveTab("assistant")}
                  className="mt-4 w-full py-2 text-sm text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] rounded-xl transition-colors flex items-center justify-center gap-2 border border-dashed border-[#3C6C5F]/20"
                >
                  <Bot size={14} />
                  Obtenir de nouveaux conseils via l'Assistant IA
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: MÉTÉO
        ════════════════════════════════════════ */}
        {activeTab === "weather" && (
          <div className="space-y-5">
            {weatherLoading ? (
              <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-12 shadow-xl border border-[#FFC490]/20 flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[#3C6C5F]" size={24} />
                <span className="text-[#3C6C5F]/70">Chargement des données météo…</span>
              </div>
            ) : weatherError ? (
              <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-12 shadow-xl border border-red-200 text-center">
                <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
                <p className="text-red-600 font-semibold">{weatherError}</p>
                <button
                  onClick={loadWeatherData}
                  className="mt-4 px-4 py-2 bg-[#3C6C5F] text-white rounded-xl hover:bg-[#29453E] transition-all flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={15} /> Réessayer
                </button>
              </div>
            ) : weatherData ? (
              <>
                {/* Conditions actuelles */}
                <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-[#29453E] dark:text-white flex items-center gap-2">
                      <Sun size={20} className="text-[#D4A574]" />
                      Conditions actuelles
                      <span className="text-sm font-normal text-[#3C6C5F]/50 ml-1">
                        {new Date().toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long" })}
                      </span>
                    </h3>
                    <button onClick={loadWeatherData} className="p-2 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl hover:bg-[#FFF3DA] transition-all">
                      <RefreshCw size={15} className="text-[#3C6C5F]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-6">
                      <div className="text-6xl">{getWeatherIcon(weatherData.current.weatherCode || 0)}</div>
                      <div>
                        <div className="text-5xl font-bold text-[#29453E] dark:text-white">
                          {weatherData.current.temperature || 0}°
                        </div>
                        <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-1">
                          {getWeatherDescription(weatherData.current.weatherCode || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: <DropletIcon size={16} />, label: "Humidité", value: `${weatherData.current.humidity || 0}%` },
                        { icon: <WindIcon size={16} />, label: "Vent", value: `${weatherData.current.windSpeed || 0} km/h` },
                        { icon: <CloudRainIcon size={16} />, label: "Pluie", value: `${weatherData.current.precipitation || 0} mm` },
                        { icon: <ThermometerIcon size={16} />, label: "Ressenti", value: `${(weatherData.current.temperature || 0) - 2}°C` },
                      ].map((item, i) => (
                        <div key={i} className="bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl p-3 border border-[#FFC490]/10">
                          <div className="flex items-center gap-2 text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mb-1">
                            {item.icon}
                            <span className="text-xs">{item.label}</span>
                          </div>
                          <p className="text-lg font-bold text-[#29453E] dark:text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conseil agricole météo */}
                <div className="bg-gradient-to-r from-[#FFF3DA] to-[#FFF8F0] dark:from-[#2a3f38]/50 dark:to-[#1a2e28] rounded-3xl p-6 border border-[#FFC490]/30 dark:border-[#FFC490]/10">
                  <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-3 flex items-center gap-2">
                    <Lightbulb size={16} className="text-[#D4A574]" />
                    Conseil agricole du jour
                    <span className="ml-auto text-[10px] font-normal text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 flex items-center gap-1">
                      <CalendarCheck size={10} /> Mis à jour automatiquement
                    </span>
                  </h4>
                  <div className="space-y-2 text-sm text-[#29453E] dark:text-[#9DAE7A]">
                    {weatherData.current.precipitation > 5 && (
                      <div className="flex items-start gap-3 p-3 bg-blue-50/80 dark:bg-blue-900/10 rounded-xl border border-blue-200/30 dark:border-blue-800/20">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <CloudRainIcon size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-800 dark:text-blue-300 text-xs mb-0.5">Pluie détectée</p>
                          <span className="text-blue-700/80 dark:text-blue-400/80">Reportez l'irrigation et vérifiez le drainage. Évitez les traitements phytosanitaires.</span>
                        </div>
                      </div>
                    )}
                    {weatherData.current.temperature > 33 && (
                      <div className="flex items-start gap-3 p-3 bg-red-50/80 dark:bg-red-900/10 rounded-xl border border-red-200/30 dark:border-red-800/20">
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                          <Flame size={16} className="text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-800 dark:text-red-300 text-xs mb-0.5">Forte chaleur</p>
                          <span className="text-red-700/80 dark:text-red-400/80">Arrosez tôt le matin (avant 8h), protégez les jeunes plants avec un voile d'ombrage et augmentez l'abreuvement des animaux.</span>
                        </div>
                      </div>
                    )}
                    {weatherData.current.temperature < 5 && (
                      <div className="flex items-start gap-3 p-3 bg-cyan-50/80 dark:bg-cyan-900/10 rounded-xl border border-cyan-200/30 dark:border-cyan-800/20">
                        <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                          <Snowflake size={16} className="text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-cyan-800 dark:text-cyan-300 text-xs mb-0.5">Risque de gel</p>
                          <span className="text-cyan-700/80 dark:text-cyan-400/80">Protégez les cultures sensibles avec des voiles P17. Rentrez les animaux fragiles et vérifiez que l'eau ne gèle pas.</span>
                        </div>
                      </div>
                    )}
                    {weatherData.current.windSpeed > 40 && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50/80 dark:bg-slate-900/10 rounded-xl border border-slate-200/30 dark:border-slate-800/20">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center flex-shrink-0">
                          <WindIcon size={16} className="text-slate-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-300 text-xs mb-0.5">Vents forts</p>
                          <span className="text-slate-700/80 dark:text-slate-400/80">Vérifiez les serres et structures. Protégez les cultures fragiles et reportez les pulvérisations.</span>
                        </div>
                      </div>
                    )}
                    {weatherData.current.humidity > 85 && (
                      <div className="flex items-start gap-3 p-3 bg-amber-50/80 dark:bg-amber-900/10 rounded-xl border border-amber-200/30 dark:border-amber-800/20">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          <Bug size={16} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-amber-800 dark:text-amber-300 text-xs mb-0.5">Humidité élevée</p>
                          <span className="text-amber-700/80 dark:text-amber-400/80">Risque accru de maladies fongiques (mildiou, oïdium). Aérez les serres et surveillez le feuillage.</span>
                        </div>
                      </div>
                    )}
                    {weatherData.current.humidity < 30 && weatherData.current.temperature > 25 && (
                      <div className="flex items-start gap-3 p-3 bg-orange-50/80 dark:bg-orange-900/10 rounded-xl border border-orange-200/30 dark:border-orange-800/20">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                          <DropletIcon size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-orange-800 dark:text-orange-300 text-xs mb-0.5">Air sec et chaud</p>
                          <span className="text-orange-700/80 dark:text-orange-400/80">Augmentez la fréquence d'irrigation. Évitez le travail du sol qui accélère l'évaporation.</span>
                        </div>
                      </div>
                    )}
                    {weatherData.current.precipitation <= 5 && weatherData.current.temperature >= 5 && weatherData.current.temperature <= 33 && weatherData.current.windSpeed <= 40 && weatherData.current.humidity <= 85 && (
                      <div className="flex items-start gap-3 p-3 bg-emerald-50/80 dark:bg-emerald-900/10 rounded-xl border border-emerald-200/30 dark:border-emerald-800/20">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={16} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs mb-0.5">Conditions favorables</p>
                          <span className="text-emerald-700/80 dark:text-emerald-400/80">Journée idéale pour les travaux agricoles, traitements et plantations. Profitez-en !</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prévisions 7 jours */}
                {weatherData.forecast && weatherData.forecast.length > 0 && (
                  <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                    <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-4 flex items-center gap-2">
                      <CalendarIcon size={16} className="text-[#3C6C5F]" />
                      Prévisions 7 jours
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {weatherData.forecast.slice(0, 7).map((day: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedWeatherDay(i)}
                          className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all min-w-[80px] ${
                            selectedWeatherDay === i
                              ? "bg-gradient-to-b from-[#3C6C5F] to-[#29453E] text-white shadow-lg"
                              : "bg-[#FAFAFA] dark:bg-[#0d1a15] text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#DDF3E8] dark:hover:bg-[#2a3f38] border border-[#FFC490]/10"
                          }`}
                        >
                          <span className="text-[11px] font-semibold">
                            {i === 0 ? "Auj." : new Date(day.date).toLocaleDateString("fr-DZ", { weekday: "short" })}
                          </span>
                          <span className="text-2xl">{getWeatherIcon(day.weatherCode || 0)}</span>
                          <span className="text-sm font-bold">{day.maxTemp || 0}°</span>
                          <span className={`text-[10px] ${selectedWeatherDay === i ? "text-white/70" : "text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50"}`}>
                            {day.minTemp || 0}°
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-12 shadow-xl border border-[#FFC490]/20 text-center">
                <Cloud size={40} className="text-[#3C6C5F]/30 mx-auto mb-3" />
                <p className="text-[#3C6C5F]/60">Aucune donnée météo disponible</p>
                <button
                  onClick={loadWeatherData}
                  className="mt-4 px-4 py-2 bg-[#3C6C5F] text-white rounded-xl hover:bg-[#29453E] transition-all mx-auto flex items-center gap-2"
                >
                  <RefreshCw size={15} /> Charger
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: CONSEILS
        ════════════════════════════════════════ */}
        {activeTab === "conseils" && (
          <div className="space-y-5">
            {/* En-tête section */}
            <div className="bg-gradient-to-br from-[#3C6C5F] to-[#29453E] rounded-3xl p-6 shadow-xl text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                    <Lightbulb size={28} className="text-[#FFC490]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      Centre de conseils agricoles
                      <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full font-normal flex items-center gap-1">
                        <Sparkles size={10} /> IA + Experts
                      </span>
                    </h2>
                    <p className="text-sm text-white/70 mt-1">
                      Conseils personnalisés basés sur vos données et les bonnes pratiques agricoles
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-white/50">Conseils IA sauvegardés</p>
                    <p className="text-2xl font-bold text-[#FFC490]">{allConseils.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Colonne gauche : Conseils IA sauvegardés */}
              <div className="lg:col-span-2 space-y-5">
                {/* Conseils IA dynamiques */}
                {allConseils.length > 0 ? (
                  <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-bold text-[#29453E] dark:text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#FFC490] flex items-center justify-center">
                          <Bot size={16} className="text-white" />
                        </div>
                        Conseils IA personnalisés
                      </h3>
                      <span className="text-xs bg-[#FFF3DA] dark:bg-[#2a3f38] text-[#D4A574] px-3 py-1.5 rounded-full font-semibold flex items-center gap-1">
                        <Sparkles size={10} /> {allConseils.length} conseil{allConseils.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {allConseils.map((conseil) => {
                        const meta = LABEL_TYPE[conseil.predictionType] ?? LABEL_TYPE.AUTRE;
                        return (
                          <div key={conseil.id} className="flex gap-4 p-4 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-2xl border border-[#FFC490]/10 hover:border-[#3C6C5F]/30 transition-all hover:shadow-md group">
                            <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0 ${meta.color} group-hover:scale-110 transition-transform`}>
                              {meta.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold ${meta.color} px-2 py-0.5 rounded-full ${meta.bg} border border-current/20`}>{meta.label}</span>
                                <span className="text-[10px] text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 flex items-center gap-1">
                                  <Clock size={9} />
                                  {new Date(conseil.date).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })}
                                </span>
                              </div>
                              <p className="text-sm text-[#29453E] dark:text-[#d4e8d0] leading-relaxed">
                                {conseil.description}
                              </p>
                            </div>
                            <ChevronRight size={16} className="text-[#3C6C5F]/20 dark:text-[#9DAE7A]/20 flex-shrink-0 mt-2 group-hover:text-[#3C6C5F]/50 transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setActiveTab("assistant")}
                      className="mt-5 w-full py-3 text-sm font-semibold text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-gradient-to-r hover:from-[#DDF3E8] hover:to-[#FFF3DA] dark:hover:from-[#2a3f38] dark:hover:to-[#2a3f38] rounded-2xl transition-all flex items-center justify-center gap-2 border-2 border-dashed border-[#3C6C5F]/20 dark:border-[#9DAE7A]/20 hover:border-[#3C6C5F]/40"
                    >
                      <Bot size={16} />
                      Obtenir de nouveaux conseils via l'Assistant IA
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-10 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#FFF3DA] dark:bg-[#2a3f38] flex items-center justify-center mx-auto mb-4">
                      <Bot size={28} className="text-[#D4A574]/60" />
                    </div>
                    <h3 className="text-lg font-bold text-[#29453E] dark:text-white mb-2">Aucun conseil IA encore</h3>
                    <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 max-w-sm mx-auto mb-5">
                      Lancez une analyse IA ou posez une question à l'assistant pour obtenir des conseils personnalisés pour votre ferme.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={generatePredictions}
                        disabled={generating}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white rounded-xl flex items-center gap-2 hover:from-[#29453E] hover:to-[#1f332e] transition-all shadow-lg shadow-[#3C6C5F]/20 text-sm font-semibold"
                      >
                        {generating ? <Loader2 className="animate-spin" size={15} /> : <Zap size={15} />}
                        Analyser ma ferme
                      </button>
                      <button
                        onClick={() => setActiveTab("assistant")}
                        className="px-5 py-2.5 border-2 border-[#3C6C5F]/20 text-[#3C6C5F] dark:text-[#9DAE7A] rounded-xl flex items-center gap-2 hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all text-sm font-semibold"
                      >
                        <MessageSquare size={15} />
                        Poser une question
                      </button>
                    </div>
                  </div>
                )}

                {/* Guide de bonnes pratiques */}
                <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                  <h3 className="text-base font-bold text-[#29453E] dark:text-white flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-[#DDF3E8] dark:bg-[#2a3f38] flex items-center justify-center">
                      <BookOpen size={16} className="text-[#3C6C5F]" />
                    </div>
                    Guide des bonnes pratiques
                    <span className="text-xs text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50 font-normal ml-auto">5 catégories</span>
                  </h3>

                  {/* Accordéon des catégories */}
                  <div className="space-y-3">
                    {STATIC_CONSEILS.map((cat) => {
                      const isOpen = conseilCategorieOuverte === cat.categorie;
                      return (
                        <div key={cat.categorie} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                          isOpen
                            ? `${cat.bg} border-current/20 shadow-md`
                            : "bg-[#FAFAFA] dark:bg-[#0d1a15] border-[#FFC490]/10 hover:border-[#3C6C5F]/20"
                        }`}>
                          <button
                            onClick={() => setConseilCategorieOuverte(isOpen ? null : cat.categorie)}
                            className="w-full flex items-center gap-3 p-4 text-left transition-colors"
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isOpen ? "bg-white/60 dark:bg-black/20" : cat.bg} ${cat.color} transition-all`}>
                              {cat.icon}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-bold ${isOpen ? cat.color : "text-[#29453E] dark:text-white"}`}>{cat.categorie}</p>
                              <p className="text-[11px] text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50">{cat.conseils.length} conseils</p>
                            </div>
                            <ChevronDown size={16} className={`text-[#3C6C5F]/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                          </button>

                          {isOpen && (
                            <div className="px-4 pb-4 space-y-2">
                              {cat.conseils.map((c, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-white/70 dark:bg-black/20 rounded-xl border border-current/5 hover:border-current/15 transition-all">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold border ${
                                    c.priorite === "haute" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800" :
                                    c.priorite === "moyenne" ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800" :
                                    "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                                  }`}>
                                    {c.priorite === "haute" ? <AlertTriangle size={11} /> : c.priorite === "moyenne" ? <CircleDot size={11} /> : <CheckCircle size={11} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#29453E] dark:text-white mb-0.5">{c.titre}</p>
                                    <p className="text-xs text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70 leading-relaxed">{c.description}</p>
                                  </div>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                                    c.priorite === "haute" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                    c.priorite === "moyenne" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  }`}>
                                    {c.priorite}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Colonne droite : Résumé & Stats */}
              <div className="space-y-4">
                {/* Résumé rapide */}
                <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-5 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                  <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-4 flex items-center gap-2">
                    <ClipboardList size={15} className="text-[#3C6C5F]" />
                    Résumé
                  </h4>
                  <div className="space-y-3">
                    {[
                      { icon: <Bot size={14} />, label: "Conseils IA", value: allConseils.length, color: "text-[#D4A574]" },
                      { icon: <BookOpen size={14} />, label: "Bonnes pratiques", value: STATIC_CONSEILS.reduce((a, c) => a + c.conseils.length, 0), color: "text-[#3C6C5F]" },
                      { icon: <AlertTriangle size={14} />, label: "Priorité haute", value: STATIC_CONSEILS.reduce((a, c) => a + c.conseils.filter(x => x.priorite === "haute").length, 0), color: "text-red-600" },
                      { icon: <Target size={14} />, label: "Catégories", value: STATIC_CONSEILS.length, color: "text-violet-600" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl border border-[#FFC490]/10">
                        <span className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-2">
                          <span className={item.color}>{item.icon}</span> {item.label}
                        </span>
                        <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Légende priorités */}
                <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-5 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                  <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-3 flex items-center gap-2">
                    <Info size={15} className="text-[#3C6C5F]" />
                    Niveaux de priorité
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Haute", desc: "Action immédiate recommandée", icon: <AlertTriangle size={12} />, cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
                      { label: "Moyenne", desc: "À planifier cette semaine", icon: <CircleDot size={12} />, cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" },
                      { label: "Basse", desc: "Amélioration continue", icon: <CheckCircle size={12} />, cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" },
                    ].map((p, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border ${p.cls}`}>
                        {p.icon}
                        <div>
                          <p className="text-xs font-bold">{p.label}</p>
                          <p className="text-[10px] opacity-70">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Météo conseil rapide */}
                {weatherData && (
                  <div className="bg-gradient-to-br from-[#FFF3DA] to-[#FFF8F0] dark:from-[#2a3f38]/50 dark:to-[#1a2e28] rounded-3xl p-5 border border-[#FFC490]/30 dark:border-[#FFC490]/10">
                    <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-3 flex items-center gap-2">
                      <Sun size={15} className="text-[#D4A574]" />
                      Météo du jour
                    </h4>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{getWeatherIcon(weatherData.current.weatherCode || 0)}</span>
                      <div>
                        <p className="text-2xl font-bold text-[#29453E] dark:text-white">{weatherData.current.temperature}°C</p>
                        <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{getWeatherDescription(weatherData.current.weatherCode || 0)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 p-2 bg-white/60 dark:bg-black/20 rounded-lg">
                        <DropletIcon size={12} className="text-blue-500" />
                        <span className="text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70">{weatherData.current.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 bg-white/60 dark:bg-black/20 rounded-lg">
                        <WindIcon size={12} className="text-slate-500" />
                        <span className="text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70">{weatherData.current.windSpeed} km/h</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("weather")}
                      className="mt-3 w-full py-2 text-xs font-semibold text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-white/40 dark:hover:bg-black/20 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      Voir les détails météo <ArrowRight size={12} />
                    </button>
                  </div>
                )}

                {/* CTA Assistant */}
                <div className="bg-gradient-to-br from-[#3C6C5F] to-[#29453E] rounded-3xl p-5 text-white shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Megaphone size={18} className="text-[#FFC490]" />
                    <h4 className="font-bold text-sm">Besoin d'aide ?</h4>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed mb-4">
                    L'assistant IA peut analyser vos données en temps réel et vous donner des conseils ultra-personnalisés.
                  </p>
                  <button
                    onClick={() => setActiveTab("assistant")}
                    className="w-full py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-white/10"
                  >
                    <Bot size={15} /> Consulter l'assistant
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: PRÉDICTIONS
        ════════════════════════════════════════ */}
        {activeTab === "predictions" && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
              <AddPredictionForm fermes={fermes} userId={user.id} />
            </div>

            {/* Filtres */}
            <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-4 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
                  <input
                    type="text"
                    placeholder="Rechercher une prédiction…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] outline-none placeholder:text-[#3C6C5F]/40 text-sm"
                  />
                </div>
                <div className="relative">
                  <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-9 pr-8 py-2.5 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] outline-none appearance-none text-sm"
                  >
                    <option value="all">Tous les types</option>
                    {Object.entries(LABEL_TYPE).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Liste des prédictions */}
            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-hidden">
              {filteredPredictions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF3DA] dark:bg-[#2a3f38] flex items-center justify-center mb-4">
                    <Brain size={28} className="text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40" />
                  </div>
                  <h3 className="text-lg font-bold text-[#29453E] dark:text-white">Aucune prédiction</h3>
                  <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-2 max-w-xs">
                    {predictions.length === 0
                      ? "Cliquez sur « Analyser » pour générer vos premières prédictions IA"
                      : "Aucune prédiction ne correspond à vos critères de recherche"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#FFC490]/10 dark:divide-[#FFC490]/5">
                  {filteredPredictions.map((p) => {
                    const meta = LABEL_TYPE[p.type] ?? LABEL_TYPE.AUTRE;
                    return (
                      <div key={p.id} className="p-5 hover:bg-[#FAFAFA] dark:hover:bg-[#0d1a15]/50 transition-colors group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Badges en-tête */}
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${meta.color} ${meta.bg}`}>
                                {meta.icon} {meta.label}
                              </span>
                              <span className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-1 bg-[#FFF3DA] dark:bg-[#2a3f38] px-2 py-1 rounded-full">
                                <Building2 size={11} /> {p.ferme.nom}
                              </span>
                              <span className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-1">
                                <ClockIcon size={11} /> {formatDate(p.date)}
                              </span>
                              {p.confiance !== null && (
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getConfidenceBadgeColor(p.confiance)}`}>
                                  {p.confiance}% confiance
                                </span>
                              )}
                            </div>

                            {/* Résultat */}
                            <p className="text-sm text-[#29453E] dark:text-white leading-relaxed bg-[#FAFAFA] dark:bg-[#0d1a15] p-3 rounded-xl border border-[#FFC490]/10">
                              {p.resultat}
                            </p>

                            {/* Barre de confiance */}
                            {p.confiance !== null && (
                              <div className="mt-2.5 flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${getConfidenceColor(p.confiance)}`}
                                    style={{ width: `${p.confiance}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50 min-w-[32px] text-right">
                                  {p.confiance}%
                                </span>
                              </div>
                            )}

                            {/* Conseils IA liés */}
                            {p.conseils && p.conseils.length > 0 && (
                              <div className="mt-3 space-y-1.5">
                                <p className="text-[11px] font-semibold text-[#D4A574] flex items-center gap-1">
                                  <Lightbulb size={11} /> Conseils IA générés
                                </p>
                                {p.conseils.map((c) => (
                                  <div key={c.id} className="text-xs text-[#29453E]/80 dark:text-[#9DAE7A]/80 bg-[#FFF3DA]/50 dark:bg-[#2a3f38]/50 px-3 py-2 rounded-lg border border-[#FFC490]/20 flex items-start gap-2">
                                    <Lightbulb size={11} className="text-[#D4A574] flex-shrink-0 mt-0.5" />
                                    <span className="leading-relaxed line-clamp-2">{c.description}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className="text-xs text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50 mt-2 flex items-center gap-1">
                              <User size={11} /> Par <span className="font-medium">{p.createdBy.prenom} {p.createdBy.nom}</span>
                            </p>
                          </div>

                          {/* Bouton suppression */}
                          <button
                            onClick={() => setShowDeleteModal(p.id)}
                            disabled={deletingId === p.id}
                            className="shrink-0 p-2 rounded-xl text-red-400/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
                          >
                            {deletingId === p.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: ASSISTANT IA (CHAT CONVERSATIONNEL)
        ════════════════════════════════════════ */}
        {activeTab === "assistant" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Zone principale chat */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1a2e28] rounded-3xl shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 flex flex-col overflow-hidden" style={{ minHeight: "600px" }}>
              {/* En-tête chat */}
              <div className="px-5 py-4 border-b border-[#FFC490]/15 dark:border-[#FFC490]/10 bg-gradient-to-r from-[#FAFAFA] to-white dark:from-[#1a2e28] dark:to-[#0d1a15]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#FFC490] flex items-center justify-center shadow-md">
                        <Bot size={20} className="text-white" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-[#1a2e28]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#29453E] dark:text-white flex items-center gap-2">
                        AgriBot
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles size={9} /> Mistral-7B
                        </span>
                      </h3>
                      <p className="text-xs text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                        En ligne — Données ferme chargées
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatMessages([{
                      id: "welcome-reset",
                      role: "assistant",
                      content: "Conversation réinitialisée. Comment puis-je vous aider avec votre ferme ?",
                      timestamp: new Date(),
                    }])}
                    className="text-xs text-[#3C6C5F]/50 hover:text-[#3C6C5F] dark:text-[#9DAE7A]/50 dark:hover:text-[#9DAE7A] flex items-center gap-1 px-2 py-1 hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] rounded-lg transition-colors"
                  >
                    <RefreshCw size={11} /> Effacer
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAFA]/50 dark:bg-[#0d1a15]/50" style={{ maxHeight: "450px" }}>
                {chatMessages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {chatLoading && <TypingIndicator />}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions rapides */}
              <div className="px-5 pt-3 pb-2 border-t border-[#FFC490]/10 dark:border-[#FFC490]/5">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => sendChatMessage(s.label)}
                      disabled={chatLoading}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#29453E] dark:text-[#9DAE7A] border border-[#FFC490]/30 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28] transition-all disabled:opacity-50 ${s.color}`}
                    >
                      {s.icon}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input zone */}
              <div className="px-5 pb-5 pt-2">
                <div className="flex gap-2">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !chatLoading && chatInput.trim()) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    placeholder="Posez votre question agricole…"
                    disabled={chatLoading}
                    className="flex-1 px-4 py-3 rounded-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28] text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent outline-none placeholder:text-[#3C6C5F]/30 text-sm disabled:opacity-60 shadow-sm"
                  />
                  <button
                    onClick={() => sendChatMessage()}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white rounded-2xl hover:from-[#29453E] hover:to-[#1f332e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#3C6C5F]/20"
                  >
                    {chatLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-[#3C6C5F]/30 dark:text-[#9DAE7A]/30 mt-2 text-center">
                  Propulsé par Mistral-7B (HuggingFace) • Données de votre ferme intégrées
                </p>
              </div>
            </div>

            {/* Panneau latéral */}
            <div className="space-y-4">
              {/* Info IA */}
              <div className="bg-gradient-to-br from-[#3C6C5F] to-[#29453E] rounded-3xl p-5 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-[#FFC490]" />
                  <h4 className="font-bold">AgriBot IA</h4>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  L'assistant utilise <strong>Mistral-7B</strong> enrichi avec les données réelles de votre ferme pour des conseils ultra-personnalisés.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { icon: <CheckCircle size={13} />, text: "Données ferme en temps réel" },
                    { icon: <CheckCircle size={13} />, text: "Météo actuelle intégrée" },
                    { icon: <CheckCircle size={13} />, text: "Conseils sauvegardés en BDD" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/90">
                      <span className="text-emerald-300">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Derniers conseils */}
              {allConseils.length > 0 && (
                <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-5 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                  <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen size={15} className="text-[#D4A574]" />
                    Conseils récents
                  </h4>
                  <div className="space-y-2">
                    {allConseils.slice(0, 4).map((conseil) => {
                      const meta = LABEL_TYPE[conseil.predictionType] ?? LABEL_TYPE.AUTRE;
                      return (
                        <div key={conseil.id} className={`p-2.5 rounded-xl ${meta.bg} border border-current/10`}>
                          <p className={`text-[11px] font-semibold mb-0.5 ${meta.color}`}>{meta.label}</p>
                          <p className="text-xs text-[#29453E] dark:text-[#d4e8d0] line-clamp-2 leading-relaxed">
                            {conseil.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contexte ferme */}
              <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-5 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-3 flex items-center gap-2">
                  <Info size={15} className="text-[#3C6C5F]" />
                  Contexte transmis à l'IA
                </h4>
                <div className="space-y-2 text-xs text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70">
                  <div className="flex justify-between p-2 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-lg">
                    <span>Ferme active</span>
                    <span className="font-semibold text-[#29453E] dark:text-white">{fermes.find(f => f.id === fermeId)?.nom || "—"}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-lg">
                    <span>Prédictions</span>
                    <span className="font-semibold text-[#29453E] dark:text-white">{predictions.length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-lg">
                    <span>Score santé</span>
                    <span className={`font-semibold ${healthScore ? (healthScore.score >= 70 ? "text-emerald-600" : "text-amber-600") : "text-gray-400"}`}>
                      {healthScore ? `${healthScore.score}/100` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-lg">
                    <span>Météo</span>
                    <span className={`font-semibold ${weatherData ? "text-emerald-600" : "text-gray-400"}`}>
                      {weatherData ? `${weatherData.current.temperature}°C` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: ANALYTICS
        ════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stats globales */}
            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
              <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 size={17} className="text-[#3C6C5F]" />
                Statistiques globales
              </h4>
              <div className="space-y-3">
                {[
                  { icon: <BarChart3 size={14} />, label: "Total prédictions", value: predictions.length, color: "text-[#29453E] dark:text-white" },
                  { icon: <Target size={14} />, label: "Confiance moyenne", value: avgConfiance !== null ? `${avgConfiance.toFixed(0)}%` : "0%", color: "text-[#3C6C5F]" },
                  { icon: <AlertTriangle size={14} />, label: "Risques élevés", value: predictions.filter((p: any) => p.risque === "ELEVE").length || 0, color: "text-red-600" },
                  { icon: <Activity size={14} />, label: "Score santé ferme", value: healthScore ? `${healthScore.score}/100` : "—", color: "text-[#3C6C5F]" },
                  ...(weatherData ? [{ icon: <ThermometerIcon size={14} />, label: "Température actuelle", value: `${weatherData.current.temperature}°C`, color: "text-orange-600" }] : []),
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl border border-[#FFC490]/10 hover:border-[#3C6C5F]/20 transition-colors">
                    <span className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-2">
                      {item.icon} {item.label}
                    </span>
                    <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution des types */}
            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
              <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-4 flex items-center gap-2">
                <PieChart size={17} className="text-[#3C6C5F]" />
                Distribution par type
              </h4>
              <div className="space-y-3">
                {Object.entries(
                  predictions.reduce((acc: Record<string, number>, p: any) => {
                    acc[p.type] = (acc[p.type] || 0) + 1;
                    return acc;
                  }, {})
                ).sort(([, a], [, b]) => b - a).map(([type, count]) => {
                  const meta = LABEL_TYPE[type] ?? LABEL_TYPE.AUTRE;
                  const pct = Math.round(((count as number) / (predictions.length || 1)) * 100);
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold flex items-center gap-1.5 ${meta.color}`}>
                          {meta.icon} {meta.label}
                        </span>
                        <span className="text-sm font-bold text-[#29453E] dark:text-white">{count as number}</span>
                      </div>
                      <div className="h-2 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${meta.bg.replace("bg-", "bg-gradient-to-r from-").replace("-50", "-400")} bg-[#3C6C5F]`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {predictions.length === 0 && (
                  <div className="text-center py-8 text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 text-sm">
                    <Sparkles size={24} className="mx-auto mb-2 opacity-30" />
                    Aucune prédiction à analyser
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal suppression ── */}
      {showDeleteModal !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2e28] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#FFC490]/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800">
                <AlertCircle size={26} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#29453E] dark:text-white">Supprimer la prédiction</h3>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Action irréversible</p>
              </div>
            </div>
            <p className="text-[#29453E] dark:text-white mb-6 text-sm leading-relaxed">
              Cette prédiction et ses conseils associés seront supprimés définitivement.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-3 rounded-xl border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#29453E] dark:text-white font-bold hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                {deletingId ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}