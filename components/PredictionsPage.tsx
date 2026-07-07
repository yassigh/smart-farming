// components/PredictionsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { deletePredictionAction } from "@/actions/prediction";
import { generateAllPredictions, getFarmHealthScore, askAssistant } from "@/actions/predictionIA";
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
  Home,
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
  Trees,
  Flower2,
  Apple,
  Milk,
  Tractor,
  Syringe,
  Pill,
  Dog,
  Store,
  Landmark,
  Compass,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";

// Types
type Prediction = {
  id: number;
  type: string;
  resultat: string;
  confiance: number | null;
  date: Date;
  ferme: { nom: string };
  createdBy: { prenom: string; nom: string };
};

interface PredictionsPageProps {
  user: { id: number; role: string };
  fermes: { id: number; nom: string }[];
  predictions: Prediction[];
  fermeId?: number;
}

// Palette de couleurs APP
const COLORS = {
  primary: "#3C6C5F",
  primaryDark: "#29453E",
  primaryLight: "#9DAE7A",
  secondary: "#FFC490",
  secondaryLight: "#FFF3DA",
  secondaryDark: "#D4A574",
  bg: "#FAFAFA",
  bgDark: "#0d1a15",
  card: "#FFFFFF",
  cardDark: "#1a2e28",
};

// Composant graphique
const SimpleChart = ({ data, type = "bar" }: { data: any[]; type?: "bar" | "line" }) => {
  const max = Math.max(...data.map(d => d.value || 0), 1);
  
  const colors = [
    "bg-[#3C6C5F]",
    "bg-[#9DAE7A]", 
    "bg-[#FFC490]",
    "bg-[#29453E]",
    "bg-[#D4A574]",
    "bg-[#5A8A7A]",
  ];

  if (data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="w-full h-32 flex items-center justify-center text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40">
        <BarChart3 size={24} className="mr-2 opacity-30" />
        <span className="text-sm">Aucune donnée</span>
      </div>
    );
  }

  return (
    <div className="w-full h-32 flex items-end gap-2">
      {data.map((item, index) => {
        const height = max > 0 ? (item.value / max) * 100 : 0;
        const colorIndex = index % colors.length;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
            <div 
              className={`w-full ${colors[colorIndex]} rounded-t-lg transition-all duration-1000 hover:opacity-80 hover:scale-y-105 origin-bottom`}
              style={{ height: `${Math.max(height, 5)}%`, minHeight: '8px' }}
            />
            <span className="text-[8px] text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 truncate w-full text-center font-medium">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Labels des types
const LABEL_TYPE: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  RENDEMENT_CULTURE: { 
    label: "Rendement", 
    icon: <Sprout size={14} />,
    color: "bg-[#DDF3E8] text-[#29453E] border-[#9DAE7A]" 
  },
  REVENUS: { 
    label: "Revenus", 
    icon: <TrendingUp size={14} />,
    color: "bg-[#DDF3E8] text-[#29453E] border-[#9DAE7A]" 
  },
  DEPENSES: { 
    label: "Dépenses", 
    icon: <TrendingDown size={14} />,
    color: "bg-red-50 text-red-700 border-red-200" 
  },
  MALADIE_ANIMAL: { 
    label: "Santé animale", 
    icon: <HeartPulse size={14} />,
    color: "bg-[#FFF3DA] text-[#D4A574] border-[#FFC490]" 
  },
  METEO: { 
    label: "Météo", 
    icon: <Cloud size={14} />,
    color: "bg-blue-50 text-blue-700 border-blue-200" 
  },
  AUTRE: { 
    label: "Autre", 
    icon: <Sparkles size={14} />,
    color: "bg-[#FFF3DA] text-[#29453E] border-[#FFC490]" 
  },
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PredictionsPage({ user, fermes, predictions, fermeId: initialFermeId }: PredictionsPageProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [fermeId, setFermeId] = useState<number>(initialFermeId || fermes[0]?.id || 0);
  
  // État IA
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Chargement du score de santé
  useEffect(() => {
    if (fermeId > 0) {
      loadHealthScore();
    }
  }, [fermeId]);

  const loadHealthScore = async () => {
    setLoading(true);
    const result = await getFarmHealthScore(fermeId);
    if (result.success) {
      setHealthScore(result.data);
    }
    setLoading(false);
  };

  const generatePredictions = async () => {
    setGenerating(true);
    const result = await generateAllPredictions(fermeId, user.id);
    if (result.success) {
      setData(result.data);
      await loadHealthScore();
      window.location.reload();
    }
    setGenerating(false);
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setChatLoading(true);
    const result = await askAssistant(fermeId, question);
    if (result.success) {
      setReponse(result.data ?? "");
    } else {
      setReponse("Désolé, une erreur est survenue.");
    }
    setChatLoading(false);
  };

  // Gestion des prédictions
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const result = await deletePredictionAction(id);
    setDeletingId(null);
    setShowDeleteModal(null);
    if (result.success) {
      window.location.reload();
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  // Filtrage
  const filteredPredictions = predictions.filter(p => {
    const matchType = filterType === "all" || p.type === filterType;
    const matchSearch = p.resultat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.ferme.nom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const avgConfiance =
    predictions.filter((p) => p.confiance !== null).length > 0
      ? predictions
          .filter((p) => p.confiance !== null)
          .reduce((sum, p) => sum + (p.confiance ?? 0), 0) /
        predictions.filter((p) => p.confiance !== null).length
      : null;

  const getConfidenceColor = (confiance: number) => {
    if (confiance >= 80) return "bg-[#3C6C5F]";
    if (confiance >= 50) return "bg-[#D4A574]";
    return "bg-red-500";
  };

  const getConfidenceLabel = (confiance: number) => {
    if (confiance >= 80) return "Élevée";
    if (confiance >= 50) return "Moyenne";
    return "Faible";
  };

  const getConfidenceBadgeColor = (confiance: number) => {
    if (confiance >= 80) return "bg-[#DDF3E8] text-[#29453E] border-[#9DAE7A]";
    if (confiance >= 50) return "bg-[#FFF3DA] text-[#D4A574] border-[#FFC490]";
    return "bg-red-50 text-red-700 border-red-200";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#29453E] bg-[#DDF3E8] border-[#9DAE7A]";
    if (score >= 60) return "text-[#D4A574] bg-[#FFF3DA] border-[#FFC490]";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getRiskColor = (risque: string) => {
    switch (risque) {
      case "FAIBLE": return "text-[#29453E] bg-[#DDF3E8]";
      case "MOYEN": return "text-[#D4A574] bg-[#FFF3DA]";
      case "ELEVE": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "RENDEMENT": return <Wheat size={20} className="text-[#3C6C5F]" />;
      case "IRRIGATION": return <Droplets size={20} className="text-[#5A8A7A]" />;
      case "MALADIE": return <ShieldAlert size={20} className="text-[#D4A574]" />;
      case "FINANCES": return <Wallet size={20} className="text-[#3C6C5F]" />;
      default: return <TrendingUp size={20} className="text-[#3C6C5F]/60" />;
    }
  };

  const healthDetails = healthScore
    ? (Object.entries(healthScore.details) as Array<[string, number]>)
    : [];

  // ✅ REMPLACEMENT DES EMOJIS PAR DES ICÔNES LUCIDE
  const chartData = healthScore ? healthDetails.map(([key, value]) => ({
    label: key === "rendement" ? "Rend" : key === "animaux" ? "Anim" : "Fin",
    value: value,
    icon: key === "rendement" ? <Sprout size={10} /> : key === "animaux" ? <Beef size={10} /> : <Wallet size={10} />
  })) : [];

  const predictionsData = data?.predictions?.map((p: any) => ({
    label: p.type.substring(0, 3),
    value: p.confiance,
  })) || [];

  // Fonction pour obtenir l'icône de recommandation
  const getRecommendationIcon = (text: string) => {
    if (text.toLowerCase().includes('cultural') || text.toLowerCase().includes('rendement')) {
      return <Sprout size={14} className="text-[#3C6C5F]" />;
    }
    if (text.toLowerCase().includes('vétérinaire') || text.toLowerCase().includes('animal')) {
      return <Beef size={14} className="text-[#D4A574]" />;
    }
    if (text.toLowerCase().includes('financi') || text.toLowerCase().includes('dépense')) {
      return <Wallet size={14} className="text-[#3C6C5F]" />;
    }
    if (text.toLowerCase().includes('irrigation') || text.toLowerCase().includes('eau')) {
      return <Droplet size={14} className="text-[#5A8A7A]" />;
    }
    if (text.toLowerCase().includes('maladie') || text.toLowerCase().includes('santé')) {
      return <Shield size={14} className="text-[#D4A574]" />;
    }
    return <CheckCircle size={14} className="text-[#9DAE7A]" />;
  };

  const pastilleColors = [
    "bg-[#DDF3E8] border-[#9DAE7A]",
    "bg-[#FFF3DA] border-[#FFC490]",
    "bg-[#E8F4F0] border-[#3C6C5F]",
    "bg-[#F5F0EB] border-[#D4A574]",
    "bg-[#E8F0ED] border-[#5A8A7A]",
    "bg-[#F5F5F0] border-[#9DAE7A]",
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d1a15] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Global */}
        <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#3C6C5F] to-[#29453E] rounded-2xl shadow-lg shadow-[#3C6C5F]/20">
                <Brain className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#29453E] dark:text-white flex items-center gap-2">
                  IA & Prédictions
                  <span className="text-xs bg-[#FFC490]/30 px-3 py-1 rounded-full font-normal text-[#FFC490] flex items-center gap-1">
                    <Sparkles size={12} />
                    v2.0
                  </span>
                </h1>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-2">
                  <BarChart3 size={14} />
                  {predictions.length} prédictions • <Building2 size={14} /> {fermes.length} fermes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2.5 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all border border-[#FFC490]/20 dark:border-[#FFC490]/10"
              >
                <RefreshCw size={18} className={`text-[#3C6C5F] dark:text-[#9DAE7A] ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={generatePredictions}
                disabled={generating}
                className="px-5 py-2.5 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#3C6C5F]/20 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Analyse...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Analyser
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs de navigation */}
        <div className="flex gap-2 bg-white dark:bg-[#1a2e28] rounded-2xl p-2 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10">
          {[
            { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
            { id: "predictions", label: "Prédictions", icon: Target },
            { id: "assistant", label: "Assistant IA", icon: MessageSquare },
            { id: "analytics", label: "Analyses", icon: PieChart },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-[#DDF3E8] dark:bg-[#2a3f38] text-[#29453E] dark:text-[#9DAE7A]"
                    : "text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38]"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ==================== TAB: DASHBOARD ==================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-bold text-[#29453E] dark:text-white mt-1">{predictions.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#DDF3E8] dark:bg-[#2a3f38] flex items-center justify-center">
                    <BarChart3 size={20} className="text-[#3C6C5F] dark:text-[#9DAE7A]" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium uppercase tracking-wider">Confiance moyenne</p>
                    <p className="text-2xl font-bold text-[#3C6C5F] dark:text-[#9DAE7A] mt-1">
                      {avgConfiance !== null ? `${avgConfiance.toFixed(0)}%` : "—"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#DDF3E8] dark:bg-[#2a3f38] flex items-center justify-center">
                    <Target size={20} className="text-[#3C6C5F] dark:text-[#9DAE7A]" />
                  </div>
                </div>
                {avgConfiance !== null && (
                  <div className="mt-3 h-1.5 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${getConfidenceColor(avgConfiance)}`} style={{ width: `${avgConfiance}%` }} />
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium uppercase tracking-wider">Types</p>
                    <p className="text-2xl font-bold text-[#29453E] dark:text-white mt-1">{new Set(predictions.map((p) => p.type)).size}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#FFF3DA] dark:bg-[#2a3f38] flex items-center justify-center">
                    <Layers size={20} className="text-[#D4A574] dark:text-[#FFC490]" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium uppercase tracking-wider">Score santé</p>
                    <p className="text-2xl font-bold text-[#29453E] dark:text-white mt-1">
                      {healthScore ? `${healthScore.score}/100` : "—"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#DDF3E8] dark:bg-[#2a3f38] flex items-center justify-center">
                    <Activity size={20} className="text-[#3C6C5F] dark:text-[#9DAE7A]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Health Score avec graphique */}
            {healthScore && (
              <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle className="text-[#FFF3DA] dark:text-[#2a3f38]" strokeWidth="8" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                        <circle
                          className="text-[#3C6C5F] transition-all duration-1000"
                          strokeWidth="8"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="56"
                          cx="64"
                          cy="64"
                          strokeDasharray={352}
                          strokeDashoffset={352 - (healthScore.score / 100) * 352}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-[#29453E] dark:text-white">{healthScore.score}</p>
                          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">/100</p>
                        </div>
                      </div>
                    </div>
                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border-2 flex items-center gap-1 ${getScoreColor(healthScore.score)}`}>
                      <Award size={12} />
                      {healthScore.niveau}
                    </span>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-[#29453E] dark:text-white flex items-center gap-2">
                        <PieChart size={16} className="text-[#3C6C5F]" />
                        Détails par catégorie
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#3C6C5F]/60">Score moyen</span>
                        <span className="text-sm font-bold text-[#3C6C5F] flex items-center gap-1">
                          <Target size={14} />
                          {Math.round(healthDetails.reduce((acc, [_, v]) => acc + v, 0) / healthDetails.length)}%
                        </span>
                      </div>
                    </div>
                    <SimpleChart data={chartData} type="bar" />
                    
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {healthDetails.map(([key, value]) => (
                        <div key={key} className="bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl p-3 text-center border border-[#FFC490]/10">
                          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center justify-center gap-1">
                            {key === "rendement" ? <Sprout size={12} /> : key === "animaux" ? <Beef size={12} /> : <Wallet size={12} />}
                            {key === "rendement" ? "Rendement" : key === "animaux" ? "Animaux" : "Finances"}
                          </p>
                          <p className="text-lg font-bold text-[#29453E] dark:text-white">{value}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommandations - ✅ SANS EMOJIS */}
                <div className="mt-6 p-4 bg-[#FFF3DA] dark:bg-[#2a3f38]/50 rounded-2xl border border-[#FFC490]/30 dark:border-[#FFC490]/10">
                  <p className="text-sm font-semibold text-[#29453E] dark:text-white mb-3 flex items-center gap-2">
                    <Lightbulb size={16} className="text-[#D4A574]" />
                    Recommandations prioritaires
                  </p>
                  <div className="space-y-2">
                    {healthScore.recommandations.map((rec: string, i: number) => {
                      return (
                        <div key={i} className="flex items-start gap-3 text-sm text-[#29453E] dark:text-[#9DAE7A] bg-white/50 dark:bg-black/20 p-2.5 rounded-xl hover:bg-white/80 dark:hover:bg-black/30 transition-all hover:scale-[1.02] border border-[#FFC490]/10">
                          <span className={`flex items-center justify-center w-7 h-7 rounded-full border-2 ${pastilleColors[i % pastilleColors.length]} flex-shrink-0 shadow-sm`}>
                            {getRecommendationIcon(rec)}
                          </span>
                          <span className="flex-1">{rec}</span>
                          <span className="text-[10px] text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 flex items-center gap-1">
                            <ArrowRight size={12} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Graphique des prédictions */}
            {predictionsData.length > 0 && (
              <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-[#29453E] dark:text-white flex items-center gap-2">
                    <LineChart size={18} className="text-[#3C6C5F]" />
                    Niveaux de confiance des prédictions
                  </h4>
                  <span className="text-xs text-[#3C6C5F]/60 flex items-center gap-1">
                    <BarChart3 size={12} />
                    {predictionsData.length} prédictions
                  </span>
                </div>
                <SimpleChart data={predictionsData} type="line" />
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: PREDICTIONS ==================== */}
        {activeTab === "predictions" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
              <AddPredictionForm fermes={fermes} userId={user.id} />
            </div>

            <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-4 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent outline-none placeholder:text-[#3C6C5F]/40"
                  />
                </div>
                <div className="relative">
                  <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-9 pr-8 py-2 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent outline-none appearance-none"
                  >
                    <option value="all">Tous les types</option>
                    {Object.entries(LABEL_TYPE).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-hidden">
              {filteredPredictions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FFF3DA] dark:bg-[#2a3f38] flex items-center justify-center mb-4 border-2 border-[#FFC490]/20">
                    <Brain size={28} className="text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40" />
                  </div>
                  <h3 className="text-lg font-bold text-[#29453E] dark:text-white">Aucune prédiction</h3>
                  <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-2 max-w-sm">
                    {predictions.length === 0 
                      ? "Commencez par générer votre première prédiction"
                      : "Aucune prédiction ne correspond à vos filtres"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#FFC490]/10 dark:divide-[#FFC490]/5">
                  {filteredPredictions.map((p) => {
                    const meta = LABEL_TYPE[p.type] ?? LABEL_TYPE.AUTRE;
                    return (
                      <div key={p.id} className="p-5 hover:bg-[#FFF3DA]/20 dark:hover:bg-[#2a3f38]/30 transition-colors group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${meta.color}`}>
                                {meta.icon}
                                {meta.label}
                              </span>
                              <span className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-1 bg-[#FFF3DA] dark:bg-[#2a3f38] px-2 py-1 rounded-full">
                                <Building2 size={12} />
                                {p.ferme.nom}
                              </span>
                              <span className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-1 bg-[#FFF3DA] dark:bg-[#2a3f38] px-2 py-1 rounded-full">
                                <ClockIcon size={12} />
                                {formatDate(p.date)}
                              </span>
                              {p.confiance !== null && (
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border-2 ${getConfidenceBadgeColor(p.confiance)}`}>
                                  {p.confiance}% • {getConfidenceLabel(p.confiance)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#29453E] dark:text-white leading-relaxed bg-[#FAFAFA] dark:bg-[#0d1a15] p-3 rounded-xl border border-[#FFC490]/10 dark:border-[#FFC490]/5">
                              {p.resultat}
                            </p>
                            <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-2 flex items-center gap-1">
                              <User size={12} />
                              Par <span className="font-medium">{p.createdBy.prenom} {p.createdBy.nom}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => setShowDeleteModal(p.id)}
                            disabled={deletingId === p.id}
                            className="shrink-0 p-2 rounded-xl text-red-400/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
                          >
                            {deletingId === p.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>

                        {p.confiance !== null && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden border border-[#FFC490]/10">
                              <div className={`h-full rounded-full transition-all ${getConfidenceColor(p.confiance)}`} style={{ width: `${p.confiance}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 min-w-[32px] text-right">
                              {p.confiance}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: ASSISTANT ==================== */}
        {activeTab === "assistant" && (
          <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-2xl">
                <MessageSquare size={24} className="text-[#3C6C5F]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#29453E] dark:text-white flex items-center gap-2">
                  Assistant IA Conversationnel
                  <Sparkles size={16} className="text-[#D4A574]" />
                </h3>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">
                  Posez vos questions sur votre exploitation
                </p>
              </div>
            </div>

            {/* Suggestions rapides - ✅ SANS EMOJIS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: "Améliorer le rendement ?", icon: <Sprout size={12} /> },
                { label: "Risques pour les animaux ?", icon: <Beef size={12} /> },
                { label: "Optimiser l'irrigation ?", icon: <Droplet size={12} /> },
                { label: "Rentabilité de la ferme ?", icon: <Wallet size={12} /> },
              ].map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => setQuestion(suggestion.label)}
                  className="px-3 py-1.5 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full text-xs text-[#29453E] dark:text-[#9DAE7A] hover:bg-[#FFC490]/30 dark:hover:bg-[#2a3f38] transition-colors flex items-center gap-1.5"
                >
                  {suggestion.icon}
                  {suggestion.label}
                </button>
              ))}
            </div>

            {/* Chat */}
            <div className="bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-2xl p-4 min-h-[120px] mb-4 border border-[#FFC490]/20 dark:border-[#FFC490]/10">
              {reponse ? (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-xl">
                    <Brain size={18} className="text-[#3C6C5F]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#3C6C5F] dark:text-[#9DAE7A] flex items-center gap-1">
                      Assistant IA
                      <BadgeCheck size={12} className="text-[#3C6C5F]" />
                    </p>
                    <p className="text-[#29453E] dark:text-[#9DAE7A] whitespace-pre-wrap">{reponse}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 text-sm">
                  <MessageSquare size={20} className="mr-2" />
                  Posez votre question ci-dessous
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && askQuestion()}
                placeholder="Ex: Pourquoi mon rendement baisse ?"
                className="flex-1 px-4 py-3 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28] text-[#29453E] dark:text-white focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent outline-none placeholder:text-[#3C6C5F]/40"
                disabled={chatLoading}
              />
              <button
                onClick={askQuestion}
                disabled={chatLoading || !question.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white rounded-xl hover:from-[#29453E] hover:to-[#1f332e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#3C6C5F]/20"
              >
                {chatLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={20} />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB: ANALYTICS ==================== */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
              <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-[#3C6C5F]" />
                Statistiques globales
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl border border-[#FFC490]/10">
                  <span className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-2">
                    <BarChart3 size={14} />
                    Total prédictions
                  </span>
                  <span className="text-lg font-bold text-[#29453E] dark:text-white">{predictions.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl border border-[#FFC490]/10">
                  <span className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-2">
                    <Target size={14} />
                    Confiance moyenne
                  </span>
                  <span className="text-lg font-bold text-[#3C6C5F]">
                    {avgConfiance !== null ? `${avgConfiance.toFixed(0)}%` : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl border border-[#FFC490]/10">
                  <span className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Risques élevés
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {predictions.filter((p: any) => p.risque === "ELEVE").length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl border border-[#FFC490]/10">
                  <span className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 flex items-center gap-2">
                    <Activity size={14} />
                    Score santé
                  </span>
                  <span className="text-lg font-bold text-[#3C6C5F]">
                    {healthScore ? `${healthScore.score}/100` : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
              <h4 className="text-sm font-semibold text-[#29453E] dark:text-white mb-4 flex items-center gap-2">
                <PieChart size={18} className="text-[#3C6C5F]" />
                Distribution des types
              </h4>
              <div className="space-y-3">
                {Object.entries(
                  predictions.reduce((acc: Record<string, number>, p: any) => {
                    acc[p.type] = (acc[p.type] || 0) + 1;
                    return acc;
                  }, {}) || {}
                ).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 w-20 truncate flex items-center gap-1">
                      {LABEL_TYPE[type]?.icon || <Sparkles size={12} />}
                      {LABEL_TYPE[type]?.label || type.substring(0, 3)}
                    </span>
                    <div className="flex-1 h-2 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#3C6C5F] to-[#29453E] rounded-full"
                        style={{ width: `${((count as number) / (predictions.length || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#29453E] dark:text-white">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de suppression */}
      {showDeleteModal !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2e28] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#29453E] dark:text-white">Supprimer</h3>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Action irréversible</p>
              </div>
            </div>
            
            <p className="text-[#29453E] dark:text-white mb-6">
              Êtes-vous sûr de vouloir supprimer cette prédiction ?
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
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}