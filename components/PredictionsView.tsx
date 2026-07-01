// components/PredictionsView.tsx
"use client";

import { useState } from "react";
import { deletePredictionAction } from "@/actions/prediction";
import AddPredictionForm from "./AddPredictionForm";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wheat,
  Rabbit,
  Cloud,
  Sparkles,
  BarChart3,
  Target,
  Layers,
  Trash2,
  Clock,
  Building,
  User,
  AlertCircle,
  Sprout,
  HeartPulse,
  Building2,
  Clock as ClockIcon,
  Sparkles as SparklesIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Target as TargetIcon,
  BarChart3 as BarChart3Icon,
  Zap,
  Rocket,
  Award,
  Trophy,
  Star,
  Gem,
  Crown,
  Medal,
  BadgeCheck,
  Shield,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";

const LABEL_TYPE: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  RENDEMENT_CULTURE: { 
    label: "Rendement culture", 
    icon: <Sprout size={14} />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200" 
  },
  REVENUS: { 
    label: "Revenus", 
    icon: <TrendingUpIcon size={14} />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200" 
  },
  DEPENSES: { 
    label: "Dépenses", 
    icon: <TrendingDownIcon size={14} />,
    color: "bg-red-50 text-red-700 border-red-200" 
  },
  MALADIE_ANIMAL: { 
    label: "Maladie animale", 
    icon: <HeartPulse size={14} />,
    color: "bg-amber-50 text-amber-700 border-amber-200" 
  },
  METEO: { 
    label: "Météo", 
    icon: <Cloud size={14} />,
    color: "bg-blue-50 text-blue-700 border-blue-200" 
  },
  AUTRE: { 
    label: "Autre", 
    icon: <SparklesIcon size={14} />,
    color: "bg-[#FFF3DA] text-[#29453E] border-[#FFC490]" 
  },
};

type Prediction = {
  id: number;
  type: string;
  resultat: string;
  confiance: number | null;
  date: Date;
  ferme: { nom: string };
  createdBy: { prenom: string; nom: string };
};

interface PredictionsViewProps {
  user: { id: number; role: string };
  fermes: { id: number; nom: string }[];
  predictions: Prediction[];
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PredictionsView({ user, fermes, predictions }: PredictionsViewProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const result = await deletePredictionAction(id);
    setDeletingId(null);
    setShowDeleteModal(null);
    
    if (result.success) {
      // Rafraîchir la page
      window.location.reload();
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const avgConfiance =
    predictions.filter((p) => p.confiance !== null).length > 0
      ? predictions
          .filter((p) => p.confiance !== null)
          .reduce((sum, p) => sum + (p.confiance ?? 0), 0) /
        predictions.filter((p) => p.confiance !== null).length
      : null;

  const getConfidenceColor = (confiance: number) => {
    if (confiance >= 80) return "bg-emerald-500";
    if (confiance >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getConfidenceLabel = (confiance: number) => {
    if (confiance >= 80) return "Élevée";
    if (confiance >= 50) return "Moyenne";
    return "Faible";
  };

  const getConfidenceBadgeColor = (confiance: number) => {
    if (confiance >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (confiance >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F0F2ED] dark:from-[#0d1a15] dark:to-[#0d1a15] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ============================================ */}
        {/* HEADER MODERNE */}
        {/* ============================================ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#3C6C5F] to-[#29453E] rounded-2xl shadow-lg shadow-[#3C6C5F]/20">
                <Brain className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#29453E] dark:text-white">
                  Prédictions IA
                </h1>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-0.5">
                  Générez et consultez des analyses prédictives pour votre exploitation
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 bg-white dark:bg-[#1a2e28] rounded-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw size={20} className={`text-[#3C6C5F] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <span className="px-4 py-2.5 bg-gradient-to-r from-[#FFF3DA] to-[#FFC490]/20 dark:from-[#2a3f38] dark:to-[#2a3f38]/50 rounded-2xl border border-[#FFC490]/30 dark:border-[#FFC490]/10 text-sm font-bold text-[#29453E] dark:text-white flex items-center gap-2 shadow-sm">
              <Zap size={16} className="text-[#FFC490]" />
              IA Analytics
            </span>
          </div>
        </div>

        {/* ============================================ */}
        {/* KPI CARDS MODERNES */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="group bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-bold uppercase tracking-wider">
                  Total Prédictions
                </p>
                <p className="text-3xl font-extrabold text-[#29453E] dark:text-white mt-1">
                  {predictions.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <BarChart3Icon size={26} className="text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-bold uppercase tracking-wider">
                  Score moyen
                </p>
                <p className="text-3xl font-extrabold text-[#3C6C5F] dark:text-[#9DAE7A] mt-1">
                  {avgConfiance !== null ? `${avgConfiance.toFixed(0)}%` : "—"}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <TargetIcon size={26} className="text-white" />
              </div>
            </div>
            {avgConfiance !== null && (
              <div className="mt-3 h-1.5 w-full bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${getConfidenceColor(avgConfiance)}`}
                  style={{ width: `${avgConfiance}%` }}
                />
              </div>
            )}
          </div>

          <div className="group bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-bold uppercase tracking-wider">
                  Types analysés
                </p>
                <p className="text-3xl font-extrabold text-[#29453E] dark:text-white mt-1">
                  {new Set(predictions.map((p) => p.type)).size}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Layers size={26} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* CONTENT GRID */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-6 border-b border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-gradient-to-r from-[#FFF3DA]/20 to-white dark:from-[#2a3f38]/20 dark:to-[#1a2e28]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-xl">
                    <Sparkles size={18} className="text-[#3C6C5F]" />
                  </div>
                  <h2 className="font-bold text-[#29453E] dark:text-white">Nouvelle Prédiction</h2>
                </div>
                <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-1 ml-1">
                  Remplissez le formulaire pour générer une analyse
                </p>
              </div>
              <div className="p-6">
                <AddPredictionForm fermes={fermes} userId={user.id} />
              </div>
            </div>
          </div>

          {/* Predictions List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-6 border-b border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-gradient-to-r from-[#FFF3DA]/20 to-white dark:from-[#2a3f38]/20 dark:to-[#1a2e28] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-xl">
                    <SparklesIcon size={18} className="text-[#3C6C5F]" />
                  </div>
                  <h2 className="font-bold text-[#29453E] dark:text-white">
                    Historique des prédictions
                  </h2>
                  <span className="px-3 py-1 bg-[#DDF3E8] dark:bg-[#2a3f38] text-[#3C6C5F] text-xs font-bold rounded-full">
                    {predictions.length}
                  </span>
                </div>
              </div>

              {predictions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#FFF3DA] dark:bg-[#2a3f38] flex items-center justify-center mb-4 border-2 border-[#FFC490]/20">
                    <Brain size={36} className="text-[#3C6C5F]/40" />
                  </div>
                  <h3 className="text-xl font-bold text-[#29453E] dark:text-white">Aucune prédiction</h3>
                  <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-2 max-w-sm">
                    Générez votre première prédiction via le formulaire à gauche.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#FFC490]/10 dark:divide-[#FFC490]/5">
                  {predictions.map((p) => {
                    const meta = LABEL_TYPE[p.type] ?? LABEL_TYPE.AUTRE;
                    return (
                      <div
                        key={p.id}
                        className="p-6 hover:bg-[#FFF3DA]/10 dark:hover:bg-[#2a3f38]/20 transition-colors duration-200 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${meta.color}`}
                              >
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
                                <span
                                  className={`text-xs font-bold px-3 py-1 rounded-full border-2 ${getConfidenceBadgeColor(p.confiance)}`}
                                >
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
                            className="shrink-0 p-2.5 rounded-xl text-red-500/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 disabled:opacity-50 group-hover:scale-110"
                          >
                            {deletingId === p.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>

                        {/* Confidence bar */}
                        {p.confiance !== null && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-2 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden border border-[#FFC490]/10">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${getConfidenceColor(p.confiance)}`}
                                style={{ width: `${p.confiance}%` }}
                              />
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
        </div>
      </div>

      {/* ============================================ */}
      {/* DELETE CONFIRMATION MODAL - MODERN */}
      {/* ============================================ */}
      {showDeleteModal !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2e28] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#29453E] dark:text-white">Supprimer la prédiction</h3>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Cette action est irréversible</p>
              </div>
            </div>
            
            <p className="text-[#29453E] dark:text-white mb-6">
              Êtes-vous sûr de vouloir supprimer cette prédiction ?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#29453E] dark:text-white font-bold hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
        .zoom-in-95 {
          animation: zoomIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}