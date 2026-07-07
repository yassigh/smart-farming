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
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
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
  SEMENCES: { label: "Semences", icon: <Sprout size={12} />, color: "bg-emerald-50 text-emerald-700" },
  ENGRAIS: { label: "Engrais", icon: <Package size={12} />, color: "bg-blue-50 text-blue-700" },
  NOURRITURE_ANIMAUX: { label: "Nourriture", icon: <Rabbit size={12} />, color: "bg-amber-50 text-amber-700" },
  SALAIRES: { label: "Salaires", icon: <Users size={12} />, color: "bg-purple-50 text-purple-700" },
  MEDICAMENTS: { label: "Médicaments", icon: <Syringe size={12} />, color: "bg-rose-50 text-rose-700" },
  EQUIPEMENT: { label: "Équipement", icon: <Wrench size={12} />, color: "bg-gray-50 text-gray-700" },
  CARBURANT: { label: "Carburant", icon: <Fuel size={12} />, color: "bg-orange-50 text-orange-700" },
  AUTRE: { label: "Autre", icon: <Package size={12} />, color: "bg-[#FFF3DA] text-[#29453E]" },
};

const LABEL_SOURCE: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  VENTE_LAIT: { label: "Vente de lait", icon: <Milk size={12} />, color: "bg-blue-50 text-blue-700" },
  VENTE_RECOLTES: { label: "Vente de récoltes", icon: <Wheat size={12} />, color: "bg-emerald-50 text-emerald-700" },
  VENTE_ANIMAUX: { label: "Vente d'animaux", icon: <Rabbit size={12} />, color: "bg-amber-50 text-amber-700" },
  SUBVENTIONS: { label: "Subventions", icon: <HandCoins size={12} />, color: "bg-green-50 text-green-700" },
  VENTE_OEUFS: { label: "Vente d'œufs", icon: <Egg size={12} />, color: "bg-yellow-50 text-yellow-700" },
  AGROTOURISME: { label: "Agrotourisme", icon: <Tent size={12} />, color: "bg-teal-50 text-teal-700" },
  AUTRE: { label: "Autre", icon: <Store size={12} />, color: "bg-[#FFF3DA] text-[#29453E]" },
};

function formatMontant(n: number) {
  return new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

  return (
    <div className="p-6 space-y-6 bg-[#F8F6F3] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#3C6C5F] rounded-2xl">
            <DollarSign className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#29453E]">Finances</h1>
            <p className="text-sm text-[#3C6C5F]/60">Gestion des transactions</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2.5 bg-white rounded-xl border border-[#E8E3DC] hover:border-[#3C6C5F] transition-all hover:shadow-md disabled:opacity-50"
        >
          <RefreshCw size={18} className={`text-[#3C6C5F] ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Revenus</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">+{formatMontant(totalRevenus)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-[#3C6C5F]/50 mt-2">{revenus.length} transaction(s)</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Dépenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">-{formatMontant(totalDepenses)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown size={20} className="text-red-600" />
            </div>
          </div>
          <p className="text-xs text-[#3C6C5F]/50 mt-2">{depenses.length} transaction(s)</p>
        </div>

        <div className={`bg-white rounded-2xl p-5 border-2 ${solde >= 0 ? 'border-emerald-200' : 'border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Solde</p>
              <p className={`text-2xl font-bold mt-1 ${solde >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {solde >= 0 ? '+' : ''}{formatMontant(solde)}
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${solde >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <Wallet size={20} className={solde >= 0 ? 'text-emerald-600' : 'text-red-600'} />
            </div>
          </div>
          <p className={`text-xs font-medium mt-2 ${solde >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {solde > 0 ? '✅ Bénéficiaire' : solde < 0 ? '⚠️ Déficitaire' : '➖ Équilibre'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Form - Left */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl border border-[#E8E3DC] overflow-hidden sticky top-6">
            <div className="p-4 border-b border-[#E8E3DC] bg-[#FAFAFA]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#DDF3E8] rounded-lg">
                  <Plus size={16} className="text-[#3C6C5F]" />
                </div>
                <h2 className="font-semibold text-[#29453E]">
                  Ajouter {tab === "depenses" ? "une dépense" : "un revenu"}
                </h2>
              </div>
            </div>
            <div className="p-4">
              {tab === "depenses" ? (
                <AddDepenseForm fermes={fermes} userId={user.id} />
              ) : (
                <AddRevenuForm fermes={fermes} userId={user.id} />
              )}
            </div>
          </div>
        </div>

        {/* Table - Right */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl border border-[#E8E3DC] overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#E8E3DC] bg-[#FAFAFA]">
              <button
                onClick={() => setTab("depenses")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  tab === "depenses"
                    ? "text-red-600 border-b-2 border-red-500 bg-white"
                    : "text-[#3C6C5F]/60 hover:text-[#29453E] hover:bg-[#FFF3DA]/30"
                }`}
              >
                <TrendingDown size={16} />
                Dépenses
                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                  {depenses.length}
                </span>
              </button>
              <button
                onClick={() => setTab("revenus")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  tab === "revenus"
                    ? "text-emerald-600 border-b-2 border-emerald-500 bg-white"
                    : "text-[#3C6C5F]/60 hover:text-[#29453E] hover:bg-[#FFF3DA]/30"
                }`}
              >
                <TrendingUp size={16} />
                Revenus
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
                  {revenus.length}
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[500px] overflow-y-auto">
              {tab === "depenses" ? (
                depenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Receipt size={40} className="text-[#3C6C5F]/20" />
                    <p className="text-[#3C6C5F]/40 font-medium mt-3">Aucune dépense</p>
                    <p className="text-xs text-[#3C6C5F]/30">Ajoutez votre première dépense</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-[#F8F6F3] text-[#29453E] text-xs font-semibold uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Ferme</th>
                        <th className="px-4 py-3 text-right">Montant</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E3DC]/50">
                      {depenses.map((d) => (
                        <tr key={d.id} className="hover:bg-[#F8F6F3] transition-colors group">
                          <td className="px-4 py-3 text-sm text-[#29453E] whitespace-nowrap">
                            {formatDate(d.date)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${LABEL_TYPE[d.type]?.color || LABEL_TYPE.AUTRE.color}`}>
                              {LABEL_TYPE[d.type]?.icon}
                              {LABEL_TYPE[d.type]?.label || d.type}
                            </span>
                            {d.description && (
                              <p className="text-xs text-[#3C6C5F]/50 mt-0.5 truncate max-w-[140px]">
                                {d.description}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#29453E]">
                            {d.ferme.nom}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-red-600">
                            -{formatMontant(d.montant)} DT
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setShowDeleteModal({ id: d.id, type: 'depense' })}
                              disabled={deletingId === d.id}
                              className="p-2 rounded-lg text-[#3C6C5F]/30 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                            >
                              {deletingId === d.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                revenus.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <CreditCard size={40} className="text-[#3C6C5F]/20" />
                    <p className="text-[#3C6C5F]/40 font-medium mt-3">Aucun revenu</p>
                    <p className="text-xs text-[#3C6C5F]/30">Ajoutez votre premier revenu</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-[#F8F6F3] text-[#29453E] text-xs font-semibold uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Source</th>
                        <th className="px-4 py-3 text-left">Ferme</th>
                        <th className="px-4 py-3 text-right">Montant</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E3DC]/50">
                      {revenus.map((r) => (
                        <tr key={r.id} className="hover:bg-[#F8F6F3] transition-colors group">
                          <td className="px-4 py-3 text-sm text-[#29453E] whitespace-nowrap">
                            {formatDate(r.date)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${LABEL_SOURCE[r.source]?.color || LABEL_SOURCE.AUTRE.color}`}>
                              {LABEL_SOURCE[r.source]?.icon}
                              {LABEL_SOURCE[r.source]?.label || r.source}
                            </span>
                            {r.description && (
                              <p className="text-xs text-[#3C6C5F]/50 mt-0.5 truncate max-w-[140px]">
                                {r.description}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#29453E]">
                            {r.ferme.nom}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">
                            +{formatMontant(r.montant)} DT
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setShowDeleteModal({ id: r.id, type: 'revenu' })}
                              disabled={deletingId === r.id}
                              className="p-2 rounded-lg text-[#3C6C5F]/30 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                            >
                              {deletingId === r.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#29453E]">
                  Supprimer {showDeleteModal.type === 'depense' ? 'la dépense' : 'le revenu'}
                </h3>
                <p className="text-sm text-[#3C6C5F]/60 mt-1">
                  Cette action est irréversible. Êtes-vous sûr ?
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-[#3C6C5F]/40" />
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E3DC] text-[#29453E] font-medium hover:bg-[#F8F6F3] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Trash2 size={16} />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}