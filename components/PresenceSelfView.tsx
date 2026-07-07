// components/PresenceSelfView.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Calendar, Upload, FileText, 
  Check, X, AlertCircle, Loader2, 
  BadgeCheck, HeartPulse, Coins, Clock,
  File, Download, Eye, Send, User,
  CalendarDays, ChevronRight, Plus,
  Bell, Activity,
  Sparkles, 
} from "lucide-react";
import { uploadCertificatAction, savePresenceAction } from "@/actions/presence";
import { StatutPresence } from "@prisma/client";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const formatDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (statut: StatutPresence) => {
    switch (statut) {
      case StatutPresence.PRESENT:
        return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: Check };
      case StatutPresence.ABSENT:
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: X };
      case StatutPresence.MALADE:
        return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: HeartPulse };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", icon: Clock };
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
      setSuccessMsg(" Certificat médical téléversé avec succès.");
      
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setFilePreview(null);
        setSelectedPresenceId(null);
      }, 1500);
    } else {
      setErrorMsg(res.error || " Une erreur est survenue lors de l'envoi.");
    }

    setUploadingPresenceId(null);
  };

  const openUploadModal = (presenceId: number) => {
    setSelectedPresenceId(presenceId);
    setSelectedFile(null);
    setFilePreview(null);
    setShowUploadModal(true);
    setTimeout(() => {
      modalFileInputRef.current?.click();
    }, 100);
  };

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
      setSuccessMsg(" Votre pointage a été enregistré avec succès.");
      
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
      setErrorMsg(res.error || " Une erreur est survenue lors de l'enregistrement.");
    }
    setIsSubmittingToday(false);
  };

  const viewCertificate = (url: string, name: string) => {
    setShowCertificate({ url, name });
  };

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  useEffect(() => {
    const demoNotifications = [
      { id: 1, message: "Votre présence du 25/06/2026 a été validée", read: false },
      { id: 2, message: "Nouveau message de l'administrateur", read: false },
    ];
    setNotifications(demoNotifications);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#F8F6F3] min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#3C6C5F] rounded-2xl">
            <Calendar size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#29453E]">Mon Espace Présences</h1>
            <p className="text-sm text-[#3C6C5F]/60">Pointage et historique personnel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-white rounded-xl border border-[#E8E3DC] hover:border-[#3C6C5F] transition-all hover:shadow-md"
            >
              <Bell size={18} className="text-[#3C6C5F]" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-[#E8E3DC] overflow-hidden z-50">
                <div className="p-4 border-b border-[#E8E3DC] bg-[#FAFAFA]">
                  <span className="font-bold text-[#29453E] text-sm">Notifications</span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-[#E8E3DC]/50 flex items-start gap-3 ${!notif.read ? 'bg-[#FFF3DA]/30' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${!notif.read ? 'bg-[#3C6C5F]' : 'bg-gray-300'} mt-1.5 flex-shrink-0`}></div>
                      <p className="text-sm text-[#29453E] leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white rounded-xl border border-[#E8E3DC] hover:border-[#3C6C5F] transition-all hover:shadow-md disabled:opacity-50"
          >
            <Sparkles size={18} className={`text-[#3C6C5F] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {/* User profile */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[#E8E3DC] shadow-sm">
            <div className="w-9 h-9 rounded-full bg-[#3C6C5F] text-white flex items-center justify-center font-bold text-xs">
              {connectedUser.image ? (
                <img src={connectedUser.image} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                `${connectedUser.prenom[0]}${connectedUser.nom[0]}`.toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#29453E]">{connectedUser.prenom} {connectedUser.nom}</p>
              <p className="text-[10px] text-[#3C6C5F]/50 uppercase">{connectedUser.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3">
          <Check size={20} className="text-emerald-500 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Today's Status */}
      {!todayPresence ? (
        <div className="bg-gradient-to-r from-[#3C6C5F] to-[#29453E] rounded-2xl p-6 border border-[#3C6C5F]/20 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-white">
              <h2 className="text-xl font-bold">Pointage d'aujourd'hui</h2>
              <p className="text-white/70 text-sm mt-1">
                {new Date().toLocaleDateString("fr-FR", { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {isSubmittingToday ? (
                <div className="flex items-center gap-2 bg-white/20 px-5 py-2.5 rounded-xl text-white">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="font-medium text-sm">Enregistrement...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleSelfCheckIn(StatutPresence.PRESENT)}
                    className="px-5 py-2.5 bg-white text-[#29453E] hover:bg-[#FFF3DA] font-medium rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg text-sm"
                  >
                    <Check size={16} />
                    Je suis présent
                  </button>
                  <button
                    onClick={() => handleSelfCheckIn(StatutPresence.MALADE)}
                    className="px-5 py-2.5 bg-[#FFC490] text-[#29453E] hover:bg-[#FFB070] font-medium rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg text-sm"
                  >
                    <HeartPulse size={16} />
                    Je suis malade
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${getStatusColor(todayPresence.statut).bg} border-2 ${getStatusColor(todayPresence.statut).border} flex items-center justify-center`}>
                {(() => {
                  const Icon = getStatusColor(todayPresence.statut).icon;
                  return <Icon size={20} className={getStatusColor(todayPresence.statut).text} />;
                })()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#29453E]">Pointage enregistré</h2>
                  <BadgeCheck size={16} className="text-[#3C6C5F]" />
                </div>
                <p className="text-sm text-[#3C6C5F]/60">{formatDate(todayPresence.date)}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-4 py-2 rounded-xl border-2 font-medium text-sm ${getStatusColor(todayPresence.statut).bg} ${getStatusColor(todayPresence.statut).border} ${getStatusColor(todayPresence.statut).text}`}>
                {getStatusLabel(todayPresence.statut)}
              </span>
              
              {todayPresence.statut === StatutPresence.PRESENT && (
                <span className={`px-4 py-2 rounded-xl border-2 text-sm font-medium flex items-center gap-2 ${
                  todayPresence.paye 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}>
                  <Coins size={14} />
                  {todayPresence.paye ? "Payé" : "En attente"}
                </span>
              )}
              
              {todayPresence.statut === StatutPresence.MALADE && (
                <>
                  {todayPresence.certificatMedical ? (
                    <button
                      onClick={() => viewCertificate(todayPresence.certificatMedical!, `${connectedUser.prenom} ${connectedUser.nom}`)}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-medium rounded-xl transition-all flex items-center gap-2 text-sm"
                    >
                      <Eye size={14} />
                      Voir justificatif
                    </button>
                  ) : (
                    <button
                      onClick={() => openUploadModal(todayPresence.id)}
                      className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-medium rounded-xl transition-all flex items-center gap-2 text-sm"
                    >
                      <Upload size={14} />
                      Déposer justificatif
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Présences</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.present}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Check size={20} className="text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full bg-[#FFF3DA] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${monthStats.presentRate}%` }} />
          </div>
          <p className="text-xs text-[#3C6C5F]/50 mt-2">{monthStats.presentRate}% ce mois</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Absences</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.absent}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <X size={20} className="text-red-600" />
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full bg-[#FFF3DA] rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${monthStats.total > 0 ? (stats.absent / monthStats.total) * 100 : 0}%` }} />
          </div>
          <p className="text-xs text-[#3C6C5F]/50 mt-2">{monthStats.total > 0 ? Math.round((stats.absent / monthStats.total) * 100) : 0}% des jours</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Maladies</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.malade}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <HeartPulse size={20} className="text-amber-600" />
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full bg-[#FFF3DA] rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${monthStats.total > 0 ? (stats.malade / monthStats.total) * 100 : 0}%` }} />
          </div>
          <p className="text-xs text-[#3C6C5F]/50 mt-2">{monthStats.total > 0 ? Math.round((stats.malade / monthStats.total) * 100) : 0}% du mois</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Taux de présence</p>
              <p className="text-2xl font-bold text-[#29453E] mt-1">{monthStats.presentRate}%</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#DDF3E8] flex items-center justify-center">
              <Activity size={20} className="text-[#3C6C5F]" />
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full bg-[#FFF3DA] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${
              monthStats.presentRate >= 80 ? 'bg-emerald-500' : 
              monthStats.presentRate >= 60 ? 'bg-amber-500' : 
              'bg-red-500'
            }`} style={{ width: `${monthStats.presentRate}%` }} />
          </div>
          <p className={`text-xs font-medium mt-2 ${
            monthStats.presentRate >= 80 ? 'text-emerald-600' : 
            monthStats.presentRate >= 60 ? 'text-amber-600' : 
            'text-red-600'
          }`}>
            {monthStats.presentRate >= 80 ? ' Bonne assiduité' : 
             monthStats.presentRate >= 60 ? ' À améliorer' : 
             ' Attention'}
          </p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-[#E8E3DC] overflow-hidden">
        <div className="p-4 border-b border-[#E8E3DC] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#DDF3E8] rounded-xl">
              <Clock size={18} className="text-[#3C6C5F]" />
            </div>
            <h2 className="font-bold text-[#29453E]">Historique</h2>
            <span className="px-2.5 py-1 bg-[#FFF3DA] text-[#3C6C5F] text-xs font-bold rounded-full">
              {history.length} enregistrements
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Présent
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Absent
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Malade
            </span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-3">
              <Calendar size={28} className="text-[#3C6C5F]/40" />
            </div>
            <p className="text-[#3C6C5F]/60 font-medium">Aucun historique disponible</p>
            <p className="text-xs text-[#3C6C5F]/40 mt-1">Commencez par pointer votre présence aujourd'hui</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E3DC]/50 max-h-[400px] overflow-y-auto">
            {history.map((record) => {
              const statusColor = getStatusColor(record.statut);
              const isMalade = record.statut === StatutPresence.MALADE;
              const hasCertificate = !!record.certificatMedical;
              const isPendingUpload = uploadingPresenceId === record.id;

              return (
                <div key={record.id} className="p-4 hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${statusColor.bg} border-2 ${statusColor.border} flex items-center justify-center flex-shrink-0`}>
                        {(() => {
                          const Icon = statusColor.icon;
                          return <Icon size={18} className={statusColor.text} />;
                        })()}
                      </div>
                      <div>
                        <p className="font-medium text-[#29453E] text-sm">
                          {formatDate(record.date)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${statusColor.bg} border ${statusColor.border} ${statusColor.text}`}>
                            {getStatusLabel(record.statut)}
                          </span>
                          {record.statut === StatutPresence.PRESENT && (
                            <span className={`text-[10px] font-medium inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${
                              record.paye 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}>
                              <Coins size={10} />
                              {record.paye ? "Payé" : "En attente"}
                            </span>
                          )}
                          {isMalade && hasCertificate && (
                            <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <BadgeCheck size={10} />
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
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5"
                          >
                            <Eye size={12} />
                            Voir
                          </button>
                        ) : (
                          <button
                            onClick={() => openUploadModal(record.id)}
                            disabled={isPendingUpload}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isPendingUpload ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Upload size={12} />
                            )}
                            Déposer
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-[#3C6C5F]/30">—</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DC] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <BadgeCheck size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#29453E]">Présence</p>
            <p className="text-xs text-[#3C6C5F]/60">Points validés automatiquement</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DC] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <HeartPulse size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#29453E]">Maladie</p>
            <p className="text-xs text-[#3C6C5F]/60">Justificatif obligatoire</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E8E3DC] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FFF3DA] flex items-center justify-center">
            <Bell size={18} className="text-[#3C6C5F]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#29453E]">Notifications</p>
            <p className="text-xs text-[#3C6C5F]/60">Suivez vos demandes</p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFF3DA] rounded-xl">
                  <Upload size={18} className="text-[#3C6C5F]" />
                </div>
                <h3 className="text-lg font-bold text-[#29453E]">Déposer un justificatif</h3>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setFilePreview(null);
                  setSelectedPresenceId(null);
                }}
                className="p-2 hover:bg-[#F8F6F3] rounded-xl transition-colors"
              >
                <X size={18} className="text-[#3C6C5F]/40" />
              </button>
            </div>

            <p className="text-sm text-[#3C6C5F]/60 mb-5">
              Sélectionnez un certificat médical (PDF, JPG, PNG - max 5Mo)
            </p>

            <input
              ref={modalFileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleModalFileSelect}
              className="hidden"
            />

            {filePreview ? (
              <div className="mb-5 p-4 bg-[#FFF3DA]/30 rounded-xl border border-[#FFC490]/20">
                <div className="flex items-center gap-3">
                  {selectedFile?.type === 'application/pdf' ? (
                    <div className="p-2 bg-red-50 rounded-lg">
                      <File size={24} className="text-red-500" />
                    </div>
                  ) : (
                    <img src={filePreview} alt="Prévisualisation" className="w-14 h-14 object-cover rounded-lg border border-[#E8E3DC]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#29453E] truncate">
                      {selectedFile?.name}
                    </p>
                    <p className="text-xs text-[#3C6C5F]/60">
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
                    className="p-1.5 hover:bg-[#FFF3DA] rounded-lg transition-colors"
                  >
                    <X size={16} className="text-[#3C6C5F]/40" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => modalFileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E8E3DC] rounded-xl p-8 text-center cursor-pointer hover:border-[#3C6C5F] hover:bg-[#FFF3DA]/20 transition-all mb-5"
              >
                <div className="w-14 h-14 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-2">
                  <Upload size={24} className="text-[#3C6C5F]/60" />
                </div>
                <p className="text-sm font-medium text-[#29453E]">Cliquez pour sélectionner</p>
                <p className="text-xs text-[#3C6C5F]/40 mt-1">PDF, JPG, PNG, WEBP • max 5Mo</p>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
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
                className="flex-1 py-3 rounded-xl border border-[#E8E3DC] text-[#29453E] font-medium hover:bg-[#F8F6F3] transition-all text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleUploadFromModal}
                disabled={!selectedFile || uploadingPresenceId !== null}
                className="flex-1 py-3 rounded-xl bg-[#3C6C5F] text-white font-medium hover:bg-[#29453E] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {uploadingPresenceId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#E8E3DC] flex items-center justify-between bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#DDF3E8] rounded-xl">
                  <FileText size={18} className="text-[#3C6C5F]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#29453E]">Certificat Médical</h3>
                  <p className="text-xs text-[#3C6C5F]/60">{showCertificate.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificate(null)}
                className="p-2 hover:bg-[#F8F6F3] rounded-xl transition-colors"
              >
                <X size={18} className="text-[#3C6C5F]/40" />
              </button>
            </div>

            <div className="flex-1 p-6 bg-[#F8F6F3] flex items-center justify-center min-h-[300px]">
              {showCertificate.url.toLowerCase().endsWith(".pdf") ? (
                <iframe 
                  src={showCertificate.url} 
                  className="w-full h-[60vh] rounded-xl border border-[#E8E3DC] bg-white"
                  title="Certificat médical PDF"
                />
              ) : (
                <div className="max-w-full max-h-[60vh] rounded-xl overflow-hidden border border-[#E8E3DC] bg-white p-4">
                  <img 
                    src={showCertificate.url} 
                    alt="Certificat médical" 
                    className="max-h-[55vh] object-contain"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E8E3DC] bg-[#FAFAFA] flex justify-end gap-3">
              <a 
                href={showCertificate.url} 
                download 
                className="px-5 py-2.5 bg-[#3C6C5F] text-white hover:bg-[#29453E] font-medium rounded-xl transition-all flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Télécharger
              </a>
              <button 
                onClick={() => setShowCertificate(null)}
                className="px-5 py-2.5 border border-[#E8E3DC] hover:bg-[#F8F6F3] text-[#29453E] font-medium rounded-xl transition-all text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}