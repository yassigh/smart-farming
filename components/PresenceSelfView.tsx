// components/PresenceSelfView.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Calendar, Upload, FileText, 
  Check, X, AlertCircle, Loader2, Info, CheckCircle2,
  BadgeCheck, HeartPulse, Coins, Clock,
  Image, File, Download, Eye, Send, User,
  Building2, CalendarDays, ChevronRight, Plus,
  Trash2, Edit, MoreVertical, Bell, CheckCheck,
  Activity, Thermometer, Cloud, Wind, Droplets,
  Sun, Moon, CloudRain, CloudSnow, CloudLightning,
  CloudFog, Sparkles, Zap, Award, Trophy, Star,
  TrendingUp, TrendingDown, BarChart3, PieChart
} from "lucide-react";
import { uploadCertificatAction, savePresenceAction } from "@/actions/presence";
import { StatutPresence } from "@prisma/client";
import Link from "next/link";

interface Presence {
  id: number;
  date: string | Date;
  statut: StatutPresence;
  paye: boolean;
  certificatMedical?: string | null;
  utilisateurId: number;
}

interface PresenceSelfViewProps {
  initialHistory: Presence[];
  connectedUser: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    image?: string | null;
  };
  agriStats?: {
    totalFermes: number;
    totalTerrains: number;
    totalAnimaux: number;
    totalCultures: number;
  };
}

export default function PresenceSelfView({ 
  initialHistory, 
  connectedUser,
  agriStats
}: PresenceSelfViewProps) {
  const [history, setHistory] = useState<Presence[]>(initialHistory);
  const [uploadingPresenceId, setUploadingPresenceId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmittingToday, setIsSubmittingToday] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPresenceId, setSelectedPresenceId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState<{ url: string; name: string } | null>(null);
  const [notifications, setNotifications] = useState<{ id: number; message: string; read: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Stats calculation
  const stats = history.reduce(
    (acc, curr) => {
      if (curr.statut === StatutPresence.PRESENT) acc.present++;
      else if (curr.statut === StatutPresence.ABSENT) acc.absent++;
      else if (curr.statut === StatutPresence.MALADE) acc.malade++;
      return acc;
    },
    { present: 0, absent: 0, malade: 0 }
  );

  // Get today's presence
  const todayStr = new Date().toDateString();
  const todayPresence = history.find(p => new Date(p.date).toDateString() === todayStr);

  // Format date helper
  const formatDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (statut: StatutPresence) => {
    switch (statut) {
      case StatutPresence.PRESENT:
        return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: CheckCircle2, badge: "bg-emerald-500" };
      case StatutPresence.ABSENT:
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: X, badge: "bg-red-500" };
      case StatutPresence.MALADE:
        return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: HeartPulse, badge: "bg-amber-500" };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", icon: Clock, badge: "bg-gray-400" };
    }
  };

  const getStatusLabel = (statut: StatutPresence) => {
    switch (statut) {
      case StatutPresence.PRESENT: return "Présent";
      case StatutPresence.ABSENT: return "Absent";
      case StatutPresence.MALADE: return "Malade";
      default: return "Non pointé";
    }
  };

  // Handle file selection from modal
  const handleModalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload from modal
  const handleUploadFromModal = async () => {
    if (!selectedPresenceId || !selectedFile) return;

    const formData = new FormData();
    formData.append("presenceId", selectedPresenceId.toString());
    formData.append("certificat", selectedFile);

    setUploadingPresenceId(selectedPresenceId);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await uploadCertificatAction(formData);

    if (res.success && res.data) {
      const updatedPresence = res.data;
      setHistory(prev => 
        prev.map(p => p.id === selectedPresenceId ? { ...p, certificatMedical: updatedPresence.certificatMedical } : p)
      );
      setSuccessMsg("✅ Certificat médical téléversé avec succès.");
      
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setFilePreview(null);
        setSelectedPresenceId(null);
      }, 1500);
    } else {
      setErrorMsg(res.error || "❌ Une erreur est survenue lors de l'envoi.");
    }

    setUploadingPresenceId(null);
  };

  // Open upload modal
  const openUploadModal = (presenceId: number) => {
    setSelectedPresenceId(presenceId);
    setSelectedFile(null);
    setFilePreview(null);
    setShowUploadModal(true);
    setTimeout(() => {
      modalFileInputRef.current?.click();
    }, 100);
  };

  // Handle self check-in
  const handleSelfCheckIn = async (statut: StatutPresence) => {
    setIsSubmittingToday(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const todayStr = new Date().toISOString().split("T")[0];
    const res = await savePresenceAction({
      userId: connectedUser.id,
      date: todayStr,
      statut,
      paye: false
    });

    if (res.success && res.data) {
      const newPresence = res.data;
      setHistory(prev => {
        const filtered = prev.filter(p => new Date(p.date).toDateString() !== new Date().toDateString());
        return [{
          id: newPresence.id,
          date: newPresence.date,
          statut: newPresence.statut,
          paye: newPresence.paye,
          certificatMedical: newPresence.certificatMedical,
          utilisateurId: connectedUser.id
        }, ...filtered];
      });
      setSuccessMsg("✅ Votre pointage a été enregistré avec succès.");
      
      if (statut === StatutPresence.MALADE) {
        setTimeout(() => {
          const newPresenceRecord = history.find(p => 
            new Date(p.date).toDateString() === new Date().toDateString()
          );
          if (newPresenceRecord) {
            openUploadModal(newPresenceRecord.id);
          }
        }, 1000);
      }
    } else {
      setErrorMsg(res.error || "❌ Une erreur est survenue lors de l'enregistrement.");
    }
    setIsSubmittingToday(false);
  };

  // View certificate
  const viewCertificate = (url: string, name: string) => {
    setShowCertificate({ url, name });
  };

  // Get month stats
  const getMonthStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthHistory = history.filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const total = monthHistory.length || 1;
    const present = monthHistory.filter(p => p.statut === StatutPresence.PRESENT).length;
    const absent = monthHistory.filter(p => p.statut === StatutPresence.ABSENT).length;
    const malade = monthHistory.filter(p => p.statut === StatutPresence.MALADE).length;
    
    return {
      total,
      present,
      absent,
      malade,
      presentRate: Math.round((present / total) * 100)
    };
  };

  const monthStats = getMonthStats();

  useEffect(() => {
    const demoNotifications = [
      { id: 1, message: "Votre présence du 25/06/2026 a été validée", read: false },
      { id: 2, message: "Nouveau message de l'administrateur", read: false },
    ];
    setNotifications(demoNotifications);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F0F2ED] dark:from-[#0d1a15] dark:to-[#0d1a15] p-4 md:p-8">
      
      {/* ============================================ */}
      {/* HEADER MODERNE */}
      {/* ============================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#3C6C5F] to-[#29453E] rounded-2xl shadow-lg shadow-[#3C6C5F]/20">
              <Calendar className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#29453E] dark:text-white">
                Mon Espace Présences
              </h1>
              <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-0.5">
                Consultez votre historique, gérez vos justificatifs
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-2xl bg-white dark:bg-[#1a2e28] border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Bell size={20} className="text-[#3C6C5F] dark:text-[#9DAE7A]" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1a2e28] rounded-2xl shadow-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-gradient-to-r from-[#FFF3DA]/50 to-white dark:from-[#2a3f38]/50 dark:to-[#1a2e28]">
                  <span className="font-bold text-[#29453E] dark:text-white text-sm">Notifications</span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-[#FFC490]/10 dark:border-[#FFC490]/5 flex items-start gap-3 transition-colors ${!notif.read ? 'bg-[#FFF3DA]/20 dark:bg-[#2a3f38]/20' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${!notif.read ? 'bg-[#3C6C5F]' : 'bg-gray-300'} mt-1.5 flex-shrink-0`}></div>
                      <p className="text-sm text-[#29453E] dark:text-white leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* User profile */}
          <div className="flex items-center gap-3 bg-white dark:bg-[#1a2e28] px-4 py-2.5 rounded-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white flex items-center justify-center font-bold text-sm border-2 border-[#FFC490]/30 shadow-md">
              {connectedUser.image ? (
                <img src={connectedUser.image} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                `${connectedUser.prenom[0]}${connectedUser.nom[0]}`.toUpperCase()
              )}
            </div>
            <div>
              <h4 className="font-semibold text-[#29453E] dark:text-white text-sm">{connectedUser.prenom} {connectedUser.nom}</h4>
              <span className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 capitalize">{connectedUser.role.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* TODAY'S STATUS - MODERN */}
      {/* ============================================ */}
      {!todayPresence ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#3C6C5F] via-[#2a5547] to-[#29453E] rounded-3xl p-8 mb-8 shadow-2xl shadow-[#3C6C5F]/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFC490]/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <Clock size={24} className="text-[#FFC490]" />
                </div>
                <h2 className="text-2xl font-bold">Pointage d'aujourd'hui</h2>
              </div>
              <p className="text-white/80 text-sm ml-1">
                {new Date().toLocaleDateString("fr-FR", { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {isSubmittingToday ? (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl text-white">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="font-medium">Enregistrement...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleSelfCheckIn(StatutPresence.PRESENT)}
                    className="group px-6 py-3 bg-white text-[#29453E] hover:bg-[#FFF3DA] font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105"
                  >
                    <CheckCircle2 size={20} className="text-[#3C6C5F] group-hover:scale-110 transition-transform" />
                    Je suis présent
                  </button>
                  <button
                    onClick={() => handleSelfCheckIn(StatutPresence.MALADE)}
                    className="group px-6 py-3 bg-[#FFC490] hover:bg-[#FFB070] text-[#29453E] font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105"
                  >
                    <HeartPulse size={20} className="group-hover:scale-110 transition-transform" />
                    Je suis malade
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a2e28] rounded-3xl p-6 mb-8 shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${getStatusColor(todayPresence.statut).bg} border-2 ${getStatusColor(todayPresence.statut).border} flex items-center justify-center shadow-md`}>
                {(() => {
                  const Icon = getStatusColor(todayPresence.statut).icon;
                  return <Icon size={28} className={getStatusColor(todayPresence.statut).text} />;
                })()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#29453E] dark:text-white">
                    Pointage enregistré
                  </h2>
                  <BadgeCheck size={20} className="text-[#3C6C5F]" />
                </div>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">
                  {formatDate(todayPresence.date)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-5 py-2.5 rounded-2xl border-2 font-bold text-sm ${getStatusColor(todayPresence.statut).bg} ${getStatusColor(todayPresence.statut).border} ${getStatusColor(todayPresence.statut).text} shadow-sm`}>
                {getStatusLabel(todayPresence.statut)}
              </span>
              
              {todayPresence.statut === StatutPresence.PRESENT && (
                <span className={`px-5 py-2.5 rounded-2xl border-2 text-sm font-bold flex items-center gap-2 shadow-sm ${
                  todayPresence.paye 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}>
                  <Coins size={16} />
                  {todayPresence.paye ? "Payé ✅" : "En attente ⏳"}
                </span>
              )}
              
              {todayPresence.statut === StatutPresence.MALADE && (
                <>
                  {todayPresence.certificatMedical ? (
                    <button
                      onClick={() => viewCertificate(todayPresence.certificatMedical!, `${connectedUser.prenom} ${connectedUser.nom}`)}
                      className="px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200 font-bold rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <FileText size={16} />
                      Voir justificatif
                    </button>
                  ) : (
                    <button
                      onClick={() => openUploadModal(todayPresence.id)}
                      className="px-5 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border-2 border-amber-200 font-bold rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <Upload size={16} />
                      Déposer justificatif
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* STATS CARDS MODERNES */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="group bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-bold uppercase tracking-wider">Présences</p>
              <p className="text-4xl font-extrabold text-[#29453E] dark:text-white mt-1">{stats.present}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={26} className="text-white" />
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-[#3C6C5F] rounded-full transition-all duration-1000" style={{ width: `${monthStats.presentRate}%` }}></div>
          </div>
          <p className="text-xs text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 mt-2 font-medium">
            {monthStats.presentRate}% ce mois
          </p>
        </div>

        <div className="group bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600/60 dark:text-red-400/60 font-bold uppercase tracking-wider">Absences</p>
              <p className="text-4xl font-extrabold text-red-600 dark:text-red-400 mt-1">{stats.absent}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
              <X size={26} className="text-white" />
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-1000" style={{ width: `${monthStats.total > 0 ? (stats.absent / monthStats.total) * 100 : 0}%` }}></div>
          </div>
          <p className="text-xs text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 mt-2 font-medium">
            {monthStats.total > 0 ? Math.round((stats.absent / monthStats.total) * 100) : 0}% des jours
          </p>
        </div>

        <div className="group bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600/60 dark:text-amber-400/60 font-bold uppercase tracking-wider">Arrêts maladie</p>
              <p className="text-4xl font-extrabold text-[#29453E] dark:text-white mt-1">{stats.malade}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <HeartPulse size={26} className="text-white" />
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000" style={{ width: `${monthStats.total > 0 ? (stats.malade / monthStats.total) * 100 : 0}%` }}></div>
          </div>
          <p className="text-xs text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 mt-2 font-medium">
            {monthStats.total > 0 ? Math.round((stats.malade / monthStats.total) * 100) : 0}% du mois
          </p>
        </div>

        <div className="group bg-white dark:bg-[#1a2e28] rounded-3xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-bold uppercase tracking-wider">Taux de présence</p>
              <p className="text-4xl font-extrabold text-[#29453E] dark:text-white mt-1">{monthStats.presentRate}%</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center shadow-lg shadow-[#3C6C5F]/20 group-hover:scale-110 transition-transform">
              <Activity size={26} className="text-white" />
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${
              monthStats.presentRate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-[#3C6C5F]' : 
              monthStats.presentRate >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
              'bg-gradient-to-r from-red-400 to-red-600'
            }`} style={{ width: `${monthStats.presentRate}%` }}></div>
          </div>
          <p className="text-xs font-medium mt-2 flex items-center gap-1">
            {monthStats.presentRate >= 80 ? 
              <span className="text-emerald-600">✅ Bonne assiduité</span> : 
              monthStats.presentRate >= 60 ? 
              <span className="text-amber-600">⚠️ À améliorer</span> : 
              <span className="text-red-600">❌ Attention</span>
            }
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* HISTORY - MODERN */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-[#1a2e28] rounded-3xl shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-hidden hover:shadow-2xl transition-all duration-300">
        <div className="p-6 border-b border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-gradient-to-r from-[#FFF3DA]/20 to-white dark:from-[#2a3f38]/20 dark:to-[#1a2e28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-xl">
              <Clock size={20} className="text-[#3C6C5F]" />
            </div>
            <h2 className="text-xl font-bold text-[#29453E] dark:text-white">Historique de Pointage</h2>
            <span className="px-3 py-1 bg-[#DDF3E8] dark:bg-[#2a3f38] text-[#3C6C5F] text-xs font-bold rounded-full">
              {history.length} enregistrements
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Présent
            </span>
            <span className="px-4 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Absent
            </span>
            <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Malade
            </span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-[#FFF3DA] dark:bg-[#2a3f38] flex items-center justify-center mx-auto mb-4">
              <Calendar size={36} className="text-[#3C6C5F]/40" />
            </div>
            <p className="text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium">Aucun historique de présence disponible.</p>
            <p className="text-xs text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 mt-1">Commencez par pointer votre présence aujourd'hui.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#FFC490]/10 dark:divide-[#FFC490]/5">
            {history.map((record) => {
              const statusColor = getStatusColor(record.statut);
              const isMalade = record.statut === StatutPresence.MALADE;
              const hasCertificate = !!record.certificatMedical;
              const isPendingUpload = uploadingPresenceId === record.id;

              return (
                <div key={record.id} className="p-5 hover:bg-[#FFF3DA]/10 dark:hover:bg-[#2a3f38]/20 transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${statusColor.bg} border-2 ${statusColor.border} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        {(() => {
                          const Icon = statusColor.icon;
                          return <Icon size={22} className={statusColor.text} />;
                        })()}
                      </div>
                      <div>
                        <p className="font-bold text-[#29453E] dark:text-white text-sm">
                          {formatDate(record.date)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${statusColor.bg} border ${statusColor.border} ${statusColor.text}`}>
                            {getStatusLabel(record.statut)}
                          </span>
                          {record.statut === StatutPresence.PRESENT && (
                            <span className={`text-[10px] font-bold inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
                              record.paye 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}>
                              <Coins size={12} />
                              {record.paye ? "Payé" : "En attente"}
                            </span>
                          )}
                          {isMalade && hasCertificate && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                              <BadgeCheck size={12} />
                              Justifié
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {isMalade ? (
                        hasCertificate ? (
                          <button
                            onClick={() => viewCertificate(record.certificatMedical!, `${connectedUser.prenom} ${connectedUser.nom}`)}
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200 text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
                          >
                            <Eye size={14} />
                            Voir justificatif
                          </button>
                        ) : (
                          <button
                            onClick={() => openUploadModal(record.id)}
                            disabled={isPendingUpload}
                            className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border-2 border-amber-200 text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
                          >
                            {isPendingUpload ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Upload size={14} />
                            )}
                            Déposer
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-[#3C6C5F]/30 dark:text-[#9DAE7A]/30">-</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* UPLOAD MODAL - MODERN */}
      {/* ============================================ */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2e28] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-xl">
                  <Upload size={22} className="text-[#3C6C5F]" />
                </div>
                <h3 className="text-xl font-bold text-[#29453E] dark:text-white">Déposer un justificatif</h3>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setFilePreview(null);
                  setSelectedPresenceId(null);
                }}
                className="p-2 rounded-xl hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all"
              >
                <X size={22} className="text-[#3C6C5F]/60" />
              </button>
            </div>

            <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mb-6">
              Veuillez sélectionner un certificat médical (PDF, JPG, PNG - max 5Mo)
            </p>

            <input
              ref={modalFileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleModalFileSelect}
              className="hidden"
            />

            {filePreview ? (
              <div className="mb-6 p-5 bg-[#FFF3DA]/30 dark:bg-[#2a3f38]/30 rounded-2xl border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10">
                <div className="flex items-center gap-4">
                  {selectedFile?.type === 'application/pdf' ? (
                    <div className="p-3 bg-red-50 rounded-xl">
                      <File size={32} className="text-red-500" />
                    </div>
                  ) : (
                    <img src={filePreview} alt="Prévisualisation" className="w-16 h-16 object-cover rounded-xl border-2 border-[#FFC490]/20" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#29453E] dark:text-white truncate">
                      {selectedFile?.name}
                    </p>
                    <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">
                      {(selectedFile?.size || 0) / 1024 / 1024 < 1 
                        ? `${Math.round((selectedFile?.size || 0) / 1024)} Ko`
                        : `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(1)} Mo`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="p-2 rounded-xl hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all"
                  >
                    <X size={18} className="text-[#3C6C5F]/60" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => modalFileInputRef.current?.click()}
                className="border-2 border-dashed border-[#FFC490]/30 dark:border-[#FFC490]/10 rounded-2xl p-10 text-center cursor-pointer hover:border-[#3C6C5F] hover:bg-[#FFF3DA]/20 transition-all duration-300 mb-6"
              >
                <div className="w-16 h-16 rounded-full bg-[#FFF3DA] dark:bg-[#2a3f38] flex items-center justify-center mx-auto mb-3">
                  <Upload size={28} className="text-[#3C6C5F]/60" />
                </div>
                <p className="text-sm font-semibold text-[#29453E] dark:text-white">
                  Cliquez pour sélectionner un fichier
                </p>
                <p className="text-xs text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 mt-1">
                  PDF, JPG, PNG, WEBP • max 5Mo
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setFilePreview(null);
                  setSelectedPresenceId(null);
                }}
                className="flex-1 py-3.5 rounded-2xl border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#29453E] dark:text-white font-bold hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleUploadFromModal}
                disabled={!selectedFile || uploadingPresenceId !== null}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white font-bold hover:from-[#29453E] hover:to-[#1f332e] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl flex items-center justify-center gap-2"
              >
                {uploadingPresenceId ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CERTIFICATE VIEWER MODAL - MODERN */}
      {/* ============================================ */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2e28] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-5 border-b border-[#FFC490]/20 dark:border-[#FFC490]/10 flex justify-between items-center bg-gradient-to-r from-[#FFF3DA]/30 to-white dark:from-[#2a3f38]/30 dark:to-[#1a2e28]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-xl">
                  <FileText size={20} className="text-[#3C6C5F]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#29453E] dark:text-white">Certificat Médical</h3>
                  <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Pour : {showCertificate.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificate(null)}
                className="p-2 rounded-xl hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all"
              >
                <X size={22} className="text-[#3C6C5F]/60" />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto bg-[#FAFAFA] dark:bg-[#0d1a15] flex items-center justify-center min-h-[300px]">
              {showCertificate.url.toLowerCase().endsWith(".pdf") ? (
                <iframe 
                  src={showCertificate.url} 
                  className="w-full h-[60vh] rounded-2xl border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28]"
                  title="Certificat médical PDF"
                />
              ) : (
                <div className="relative max-w-full max-h-[60vh] rounded-2xl overflow-hidden border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28] p-4">
                  <img 
                    src={showCertificate.url} 
                    alt="Certificat médical" 
                    className="max-h-[55vh] object-contain rounded"
                  />
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[#FFC490]/20 dark:border-[#FFC490]/10 flex justify-end gap-3 bg-gradient-to-r from-[#FFF3DA]/30 to-white dark:from-[#2a3f38]/30 dark:to-[#1a2e28]">
              <a 
                href={showCertificate.url} 
                download 
                className="px-6 py-3 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white hover:from-[#29453E] hover:to-[#1f332e] font-bold rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl"
              >
                <Download size={18} />
                Télécharger
              </a>
              <button 
                onClick={() => setShowCertificate(null)}
                className="px-6 py-3 border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] text-[#29453E] dark:text-white font-bold rounded-2xl transition-all duration-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* QUICK TIPS - MODERN */}
      {/* ============================================ */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-900/10 dark:to-emerald-900/5 rounded-2xl p-5 border border-emerald-200/30 dark:border-emerald-800/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BadgeCheck size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#29453E] dark:text-white">Présence</p>
              <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Points validés automatiquement</p>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-900/10 dark:to-amber-900/5 rounded-2xl p-5 border border-amber-200/30 dark:border-amber-800/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HeartPulse size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#29453E] dark:text-white">Maladie</p>
              <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Justificatif obligatoire</p>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-[#FFF3DA] to-[#FFC490]/10 dark:from-[#2a3f38] dark:to-[#2a3f38]/50 rounded-2xl p-5 border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFC490]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell size={24} className="text-[#3C6C5F]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#29453E] dark:text-white">Notifications</p>
              <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Suivez vos demandes</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromTop {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
        .slide-in-from-top-2 {
          animation: slideInFromTop 0.2s ease-out;
        }
        .zoom-in-95 {
          animation: zoomIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}