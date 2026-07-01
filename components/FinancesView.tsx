// components/FinancesView.tsx
"use client";

import { useState } from "react";
import { deleteDepenseAction } from "@/actions/depense";
import { deleteRevenuAction } from "@/actions/revenu";
import AddDepenseForm from "./AddDepenseForm";
import AddRevenuForm from "./AddRevenuForm";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Building,
  Tag,
  FileText,
  Sprout,
  Syringe,
  Wrench,
  Fuel,
  Package,
  Milk,
  Egg,
  Trees,
  HandCoins,
  Tent,
  Wheat,
  Store,
  Rabbit,
  PiggyBank,
  BarChart3,
  ChevronRight,
  Clock,
  Users,
  CreditCard,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Clock as ClockIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Wallet as WalletIcon,
  Plus as PlusIcon,
  Trash2 as Trash2Icon,
  Calendar as CalendarIcon,
  Tag as TagIcon,
  FileText as FileTextIcon,
  HandCoins as HandCoinsIcon,
  BarChart3 as BarChart3Icon,
  ChevronRight as ChevronRightIcon,
  Users as UsersIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  ArrowUpRight as ArrowUpRightIcon,
  ArrowDownRight as ArrowDownRightIcon,
  Loader2,
  RefreshCw,
  Zap,
  Sparkles,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";

type Tab = "depenses" | "revenus";

type Depense = {
  id: number;
  date: Date;
  montant: number;
  type: string;
  description: string | null;
  ferme: { nom: string };
  createdBy: { prenom: string; nom: string };
};

type Revenu = {
  id: number;
  date: Date;
  montant: number;
  source: string;
  description: string | null;
  ferme: { nom: string };
  createdBy: { prenom: string; nom: string };
};

interface FinancesViewProps {
  user: { id: number; role: string; prenom: string; nom: string };
  fermes: { id: number; nom: string }[];
  depenses: Depense[];
  revenus: Revenu[];
  totalDepenses: number;
  totalRevenus: number;
  solde: number;
}

const LABEL_TYPE: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  SEMENCES: { label: "Semences", icon: <Sprout size={14} />, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ENGRAIS: { label: "Engrais", icon: <Package size={14} />, color: "bg-blue-50 text-blue-700 border-blue-200" },
  NOURRITURE_ANIMAUX: { label: "Nourriture animaux", icon: <Rabbit size={14} />, color: "bg-amber-50 text-amber-700 border-amber-200" },
  SALAIRES: { label: "Salaires", icon: <UsersIcon size={14} />, color: "bg-purple-50 text-purple-700 border-purple-200" },
  MEDICAMENTS: { label: "Médicaments", icon: <Syringe size={14} />, color: "bg-rose-50 text-rose-700 border-rose-200" },
  EQUIPEMENT: { label: "Équipement", icon: <Wrench size={14} />, color: "bg-gray-50 text-gray-700 border-gray-200" },
  CARBURANT: { label: "Carburant", icon: <Fuel size={14} />, color: "bg-orange-50 text-orange-700 border-orange-200" },
  AUTRE: { label: "Autre", icon: <Package size={14} />, color: "bg-[#FFF3DA] text-[#29453E] border-[#FFC490]" },
};

const LABEL_SOURCE: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  VENTE_LAIT: { label: "Vente de lait", icon: <Milk size={14} />, color: "bg-blue-50 text-blue-700 border-blue-200" },
  VENTE_RECOLTES: { label: "Vente de récoltes", icon: <Wheat size={14} />, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  VENTE_ANIMAUX: { label: "Vente d'animaux", icon: <Rabbit size={14} />, color: "bg-amber-50 text-amber-700 border-amber-200" },
  SUBVENTIONS: { label: "Subventions", icon: <HandCoinsIcon size={14} />, color: "bg-green-50 text-green-700 border-green-200" },
  VENTE_OEUFS: { label: "Vente d'œufs", icon: <Egg size={14} />, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  AGROTOURISME: { label: "Agrotourisme", icon: <Tent size={14} />, color: "bg-teal-50 text-teal-700 border-teal-200" },
  AUTRE: { label: "Autre", icon: <Store size={14} />, color: "bg-[#FFF3DA] text-[#29453E] border-[#FFC490]" },
};

function formatMontant(n: number) {
  return new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FinancesView({
  user,
  fermes,
  depenses,
  revenus,
  totalDepenses,
  totalRevenus,
  solde,
}: FinancesViewProps) {
  const [tab, setTab] = useState<Tab>("depenses");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: number; type: 'depense' | 'revenu' } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    
    setDeletingId(showDeleteModal.id);
    
    if (showDeleteModal.type === 'depense') {
      await deleteDepenseAction(showDeleteModal.id);
    } else {
      await deleteRevenuAction(showDeleteModal.id);
    }
    
    setDeletingId(null);
    setShowDeleteModal(null);
    window.location.reload();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const getSoldeStatus = () => {
    if (solde > 0) return { label: "Bénéficiaire", color: "text-emerald-600", icon: TrendingUpIcon };
    if (solde < 0) return { label: "Déficitaire", color: "text-red-600", icon: TrendingDownIcon };
    return { label: "Équilibre", color: "text-gray-600", icon: WalletIcon };
  };

  const soldeStatus = getSoldeStatus();
  const SoldeIcon = soldeStatus.icon;

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
                <DollarSign className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#29453E] dark:text-white">
                  Finances
                </h1>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-0.5">
                  Suivez vos dépenses et revenus agricoles en temps réel
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
              <Calendar size={16} className="text-[#3C6C5F]" />
              {new Date().toLocaleDateString("fr-DZ", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* ============================================ */}
        {/* KPI CARDS MODERNES */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Revenus */}
          <div className="group bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-bold uppercase tracking-wider">
                  Total Revenus
                </p>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  +{formatMontant(totalRevenus)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <ArrowUpRightIcon size={26} className="text-white" />
              </div>
            </div>
            <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-2 font-medium">
              {revenus.length} entrée(s)
            </p>
          </div>

          {/* Dépenses */}
          <div className="group bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-bold uppercase tracking-wider">
                  Total Dépenses
                </p>
                <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
                  -{formatMontant(totalDepenses)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                <ArrowDownRightIcon size={26} className="text-white" />
              </div>
            </div>
            <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-2 font-medium">
              {depenses.length} entrée(s)
            </p>
          </div>

          {/* Solde */}
          <div className={`group bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-lg border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
            solde >= 0 ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-bold uppercase tracking-wider">
                  Solde Net
                </p>
                <p className={`text-3xl font-extrabold mt-1 ${
                  solde >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {solde >= 0 ? '+' : ''}{formatMontant(solde)}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                solde >= 0 ? 'from-emerald-400 to-emerald-600 shadow-emerald-500/20' : 'from-red-400 to-red-600 shadow-red-500/20'
              }`}>
                <WalletIcon size={26} className="text-white" />
              </div>
            </div>
            <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${
              solde >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              <SoldeIcon size={14} />
              {soldeStatus.label}
            </p>
          </div>
        </div>

        {/* ============================================ */}
        {/* MAIN CONTENT */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-6 border-b border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-gradient-to-r from-[#FFF3DA]/20 to-white dark:from-[#2a3f38]/20 dark:to-[#1a2e28]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-xl">
                    <PlusIcon size={18} className="text-[#3C6C5F]" />
                  </div>
                  <h2 className="font-bold text-[#29453E] dark:text-white">
                    Ajouter {tab === "depenses" ? "une dépense" : "un revenu"}
                  </h2>
                </div>
                <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-1 ml-1">
                  Remplissez le formulaire pour enregistrer une transaction
                </p>
              </div>
              <div className="p-6">
                {tab === "depenses" ? (
                  <AddDepenseForm fermes={fermes} userId={user.id} />
                ) : (
                  <AddRevenuForm fermes={fermes} userId={user.id} />
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1a2e28] rounded-3xl shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-hidden hover:shadow-2xl transition-all duration-300">
              
              {/* Tab Switcher */}
              <div className="flex border-b border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-gradient-to-r from-[#FFF3DA]/20 to-white dark:from-[#2a3f38]/20 dark:to-[#1a2e28]">
                <button
                  onClick={() => setTab("depenses")}
                  className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    tab === "depenses"
                      ? "text-red-600 dark:text-red-400 border-b-2 border-red-500 dark:border-red-400 bg-white dark:bg-[#1a2e28]"
                      : "text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 hover:text-[#29453E] dark:hover:text-white hover:bg-[#FFF3DA]/30 dark:hover:bg-[#2a3f38]/30"
                  }`}
                >
                  <TrendingDownIcon size={18} />
                  Dépenses
                  <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                    {depenses.length}
                  </span>
                </button>
                <button
                  onClick={() => setTab("revenus")}
                  className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    tab === "revenus"
                      ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 dark:border-emerald-400 bg-white dark:bg-[#1a2e28]"
                      : "text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 hover:text-[#29453E] dark:hover:text-white hover:bg-[#FFF3DA]/30 dark:hover:bg-[#2a3f38]/30"
                  }`}
                >
                  <TrendingUpIcon size={18} />
                  Revenus
                  <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                    {revenus.length}
                  </span>
                </button>
              </div>

              {/* Content */}
              {tab === "depenses" ? (
                <>
                  {depenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-[#FFF3DA] dark:bg-[#2a3f38] flex items-center justify-center mb-4 border-2 border-[#FFC490]/20">
                        <ReceiptIcon size={36} className="text-[#3C6C5F]/40" />
                      </div>
                      <h3 className="text-xl font-bold text-[#29453E] dark:text-white">Aucune dépense</h3>
                      <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-2 max-w-sm">
                        Ajoutez votre première dépense via le formulaire à gauche.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#FFF3DA]/30 dark:bg-[#2a3f38]/30 text-xs font-bold text-[#29453E] dark:text-white uppercase tracking-wider border-b border-[#FFC490]/10 dark:border-[#FFC490]/5">
                            <th className="px-6 py-4 text-left">Date</th>
                            <th className="px-6 py-4 text-left">Type</th>
                            <th className="px-6 py-4 text-left">Ferme</th>
                            <th className="px-6 py-4 text-right">Montant</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#FFC490]/10 dark:divide-[#FFC490]/5">
                          {depenses.map((d) => (
                            <tr key={d.id} className="hover:bg-[#FFF3DA]/10 dark:hover:bg-[#2a3f38]/20 transition-colors duration-200 group">
                              <td className="px-6 py-4 text-sm text-[#29453E] dark:text-white whitespace-nowrap">
                                {formatDate(d.date)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${LABEL_TYPE[d.type]?.color || LABEL_TYPE.AUTRE.color}`}>
                                    {LABEL_TYPE[d.type]?.icon}
                                    {LABEL_TYPE[d.type]?.label || d.type}
                                  </span>
                                </div>
                                {d.description && (
                                  <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-1 truncate max-w-[200px]">
                                    {d.description}
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#29453E] dark:text-white whitespace-nowrap">
                                {d.ferme.nom}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-extrabold text-red-600 dark:text-red-400">
                                  -{formatMontant(d.montant)} DZD
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => setShowDeleteModal({ id: d.id, type: 'depense' })}
                                  disabled={deletingId === d.id}
                                  className="p-2.5 rounded-xl text-red-500/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group-hover:scale-110 disabled:opacity-50"
                                >
                                  {deletingId === d.id ? (
                                    <Loader2 size={18} className="animate-spin" />
                                  ) : (
                                    <Trash2Icon size={18} />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {revenus.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-[#FFF3DA] dark:bg-[#2a3f38] flex items-center justify-center mb-4 border-2 border-[#FFC490]/20">
                        <CreditCardIcon size={36} className="text-[#3C6C5F]/40" />
                      </div>
                      <h3 className="text-xl font-bold text-[#29453E] dark:text-white">Aucun revenu</h3>
                      <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-2 max-sm">
                        Ajoutez votre premier revenu via le formulaire à gauche.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#FFF3DA]/30 dark:bg-[#2a3f38]/30 text-xs font-bold text-[#29453E] dark:text-white uppercase tracking-wider border-b border-[#FFC490]/10 dark:border-[#FFC490]/5">
                            <th className="px-6 py-4 text-left">Date</th>
                            <th className="px-6 py-4 text-left">Source</th>
                            <th className="px-6 py-4 text-left">Ferme</th>
                            <th className="px-6 py-4 text-right">Montant</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#FFC490]/10 dark:divide-[#FFC490]/5">
                          {revenus.map((r) => (
                            <tr key={r.id} className="hover:bg-[#FFF3DA]/10 dark:hover:bg-[#2a3f38]/20 transition-colors duration-200 group">
                              <td className="px-6 py-4 text-sm text-[#29453E] dark:text-white whitespace-nowrap">
                                {formatDate(r.date)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${LABEL_SOURCE[r.source]?.color || LABEL_SOURCE.AUTRE.color}`}>
                                    {LABEL_SOURCE[r.source]?.icon}
                                    {LABEL_SOURCE[r.source]?.label || r.source}
                                  </span>
                                </div>
                                {r.description && (
                                  <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-1 truncate max-w-[200px]">
                                    {r.description}
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#29453E] dark:text-white whitespace-nowrap">
                                {r.ferme.nom}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                  +{formatMontant(r.montant)} DZD
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => setShowDeleteModal({ id: r.id, type: 'revenu' })}
                                  disabled={deletingId === r.id}
                                  className="p-2.5 rounded-xl text-red-500/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group-hover:scale-110 disabled:opacity-50"
                                >
                                  {deletingId === r.id ? (
                                    <Loader2 size={18} className="animate-spin" />
                                  ) : (
                                    <Trash2Icon size={18} />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* DELETE CONFIRMATION MODAL - MODERN */}
      {/* ============================================ */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2e28] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#29453E] dark:text-white">
                  Supprimer {showDeleteModal.type === 'depense' ? 'la dépense' : 'le revenu'}
                </h3>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Cette action est irréversible</p>
              </div>
            </div>
            
            <p className="text-[#29453E] dark:text-white mb-6">
              Êtes-vous sûr de vouloir supprimer cette transaction ?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#29453E] dark:text-white font-bold hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Trash2Icon size={18} />
                    Supprimer
                  </>
                )}
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