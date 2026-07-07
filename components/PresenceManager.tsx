// components/PresenceManager.tsx

"use client";

import { useState, useEffect } from "react";
import { 
  Search, X, Eye, FileText, 
  Calendar, CheckCircle2, AlertCircle, Activity,
  HeartPulse,
  Coins,
  Clock,
  Download,
  Users,
  UserCheck,
  UserX,
  Stethoscope,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BadgeCheck,
  Loader2,
  LayoutGrid,
  Briefcase,
  Shield,
  UserCircle,
  Clock as ClockIcon,
  CalendarDays,
  FileCheck,
  FileX,
  Heart,
  DollarSign,
  Eye as EyeIcon,
  Download as DownloadIcon,
  Trash2,
  Edit,
  MoreHorizontal,
  UserPlus,
  Settings,
  Bell,
  BellRing,
  Check,
  Circle,
  CircleCheck,
  CircleDot,
  CircleX,
  Clock8,
  ClockArrowUp,
  ClockArrowDown,
  UsersRound,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UserRoundCog,
  Stethoscope as StethoscopeIcon,
  Activity as ActivityIcon,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  HeartHandshake,
  Pill,
  Syringe,
  Bandage,
  Ambulance,
  Hospital,
  Building2,
  MapPin,
  Home,
  Workflow,
  Layers,
  BriefcaseBusiness,
  UserCog,
  UserRoundCog as UserRoundCogIcon,
  HardHat,
  GraduationCap,
  Siren,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { savePresenceAction, getPresencesByDateAction } from "@/actions/presence";
import { StatutPresence } from "@prisma/client";

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  image?: string | null;
}

interface Presence {
  id: number;
  date: string | Date;
  statut: StatutPresence;
  paye: boolean;
  certificatMedical?: string | null;
  utilisateurId: number;
}

interface PresenceManagerProps {
  users: User[];
  initialPresences: Presence[];
  workedDaysMap: Record<number, number>;
}

export default function PresenceManager({ 
  users, 
  initialPresences, 
  workedDaysMap 
}: PresenceManagerProps) {
  const [presences, setPresences] = useState<Presence[]>(initialPresences);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("TOUS");
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedCertUrl, setSelectedCertUrl] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Date selection
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [displayedPresences, setDisplayedPresences] = useState<Presence[]>(initialPresences);
  const [workedDaysForDate, setWorkedDaysForDate] = useState<Record<number, number>>(workedDaysMap);

  // Fetch presences for selected date
  const fetchPresencesForDate = async (date: string) => {
    setIsLoading(true);
    try {
      const result = await getPresencesByDateAction(date);
      if (result.success && result.data) {
        setDisplayedPresences(result.data);
        // Update worked days for this date
        if (result.workedDays) {
          setWorkedDaysForDate(result.workedDays);
        }
      } else {
        setDisplayedPresences([]);
        setErrorMsg(result.error || "Erreur lors du chargement des présences");
        setTimeout(() => setErrorMsg(null), 3000);
      }
    } catch (error) {
      console.error("Error fetching presences:", error);
      setErrorMsg("Erreur lors du chargement des présences");
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Change date
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const dateStr = newDate.toISOString().split("T")[0];
    setSelectedDate(dateStr);
    fetchPresencesForDate(dateStr);
  };

  const goToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchPresencesForDate(today);
  };

  // Load presences for selected date on mount
  useEffect(() => {
    fetchPresencesForDate(selectedDate);
  }, []);

  const getUserTodayPresence = (userId: number) => {
    return displayedPresences.find(p => p.utilisateurId === userId);
  };

  const handleSavePresence = async (
    userId: number, 
    statut: StatutPresence, 
    paye: boolean
  ) => {
    setSavingUserId(userId);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await savePresenceAction({
      userId,
      date: selectedDate,
      statut,
      paye
    });

    if (res.success && res.data) {
      const updatedPresence = res.data;
      setDisplayedPresences(prev => {
        const index = prev.findIndex(p => p.utilisateurId === userId);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            statut: updatedPresence.statut,
            paye: updatedPresence.paye
          };
          return updated;
        } else {
          return [...prev, {
            id: updatedPresence.id,
            date: updatedPresence.date,
            statut: updatedPresence.statut,
            paye: updatedPresence.paye,
            certificatMedical: updatedPresence.certificatMedical,
            utilisateurId: userId
          }];
        }
      });
      setSuccessMsg(`✅ Présence mise à jour avec succès`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.error || "❌ Erreur lors de la mise à jour de la présence.");
      setTimeout(() => setErrorMsg(null), 5000);
    }
    setSavingUserId(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPresencesForDate(selectedDate);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      `${user.prenom} ${user.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "TOUS" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalStaff = users.length;
  const presentCount = displayedPresences.filter(p => p.statut === StatutPresence.PRESENT).length;
  const absentCount = displayedPresences.filter(p => p.statut === StatutPresence.ABSENT).length;
  const maladeCount = displayedPresences.filter(p => p.statut === StatutPresence.MALADE).length;
  const nonPointesCount = totalStaff - displayedPresences.length;
  
  const presenceRate = totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 0;
  const absenceRate = totalStaff > 0 ? Math.round((absentCount / totalStaff) * 100) : 0;

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Demain";
    } else {
      return date.toLocaleDateString("fr-FR", { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  const isToday = selectedDate === todayStr;
  const isFuture = new Date(selectedDate) > new Date(todayStr);
  const isPast = new Date(selectedDate) < new Date(todayStr);

  return (
    <div className="p-6 space-y-6 bg-[#F8F6F3] min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#3C6C5F] rounded-2xl">
            <CalendarClock size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#29453E]">Présences</h1>
            <p className="text-sm text-[#3C6C5F]/60">Gestion quotidienne des employés</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2.5 bg-white rounded-xl border border-[#E8E3DC] hover:border-[#3C6C5F] transition-all hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw size={18} className={`text-[#3C6C5F] ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E3DC]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 rounded-xl hover:bg-[#F8F6F3] transition-colors border border-[#E8E3DC]"
              disabled={isLoading}
            >
              <ChevronLeft size={18} className="text-[#3C6C5F]" />
            </button>
            <div className="px-6 py-2 bg-[#FFF3DA] rounded-xl font-semibold text-[#29453E] flex items-center gap-2 min-w-[200px] justify-center">
              <CalendarDays size={18} className="text-[#3C6C5F]" />
              <span>{formatDisplayDate(selectedDate)}</span>
              {isFuture && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Futur</span>
              )}
              {isPast && !isToday && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Passé</span>
              )}
              {isToday && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Aujourd'hui</span>
              )}
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2 rounded-xl hover:bg-[#F8F6F3] transition-colors border border-[#E8E3DC]"
              disabled={isLoading}
            >
              <ChevronRight size={18} className="text-[#3C6C5F]" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-[#3C6C5F] text-white rounded-xl text-sm font-medium hover:bg-[#29453E] transition-colors"
              >
                Aujourd'hui
              </button>
            )}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                fetchPresencesForDate(e.target.value);
              }}
              className="px-4 py-2 rounded-xl border border-[#E8E3DC] text-sm focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-[#29453E] mt-1">{totalStaff}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#DDF3E8] flex items-center justify-center">
              <Users size={20} className="text-[#3C6C5F]" />
            </div>
          </div>
          <p className="text-xs text-[#3C6C5F]/50 mt-2">Employés actifs</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Présents</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{presentCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <UserCheck size={20} className="text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full bg-[#FFF3DA] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${presenceRate}%` }} />
          </div>
          <p className="text-xs text-[#3C6C5F]/50 mt-2">{presenceRate}% du personnel</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Absents</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{absentCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <UserX size={20} className="text-red-600" />
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full bg-[#FFF3DA] rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${absenceRate}%` }} />
          </div>
          <p className="text-xs text-[#3C6C5F]/50 mt-2">{absenceRate}% du personnel</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Malades</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{maladeCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <HeartPulse size={20} className="text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-[#3C6C5F]/50 mt-2">Arrêts maladie</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E3DC]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider">Non pointés</p>
              <p className="text-2xl font-bold text-gray-500 mt-1">{nonPointesCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center">
              <Clock size={20} className="text-gray-500" />
            </div>
          </div>
          <p className="text-xs text-[#3C6C5F]/50 mt-2">En attente de pointage</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-[#3C6C5F]">
            <Loader2 size={24} className="animate-spin" />
            <span className="font-medium">Chargement des présences...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <div className="bg-white rounded-2xl border border-[#E8E3DC] overflow-hidden">
          {/* Controls */}
          <div className="p-4 border-b border-[#E8E3DC] bg-[#FAFAFA]">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
                <input
                  type="text"
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E8E3DC] bg-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                {["TOUS", "EMPLOYE", "VETERINAIRE"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                      roleFilter === r
                        ? "bg-[#3C6C5F] text-white shadow-md shadow-[#3C6C5F]/10"
                        : "bg-[#FFF3DA] text-[#29453E] hover:bg-[#FFC490]/30"
                    }`}
                  >
                    {r === "TOUS" ? (
                      <span className="flex items-center gap-1.5">
                        <Users size={12} />
                        TOUS
                      </span>
                    ) : r === "EMPLOYE" ? (
                      <span className="flex items-center gap-1.5">
                        <HardHat size={12} />
                        EMPLOYÉS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Stethoscope size={12} />
                        VÉTÉRINAIRES
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-[#F8F6F3] text-[#29453E] text-xs font-semibold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Employé</th>
                  <th className="px-4 py-3 text-left">Rôle</th>
                  <th className="px-4 py-3 text-center">Pointage</th>
                  <th className="px-4 py-3 text-center">Jours</th>
                  <th className="px-4 py-3 text-center">Paie</th>
                  <th className="px-4 py-3 text-center">Certificat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3DC]/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <Users size={40} className="text-[#3C6C5F]/20" />
                        <p className="text-[#3C6C5F]/40 font-medium">Aucun employé trouvé</p>
                        <p className="text-xs text-[#3C6C5F]/30">Modifiez vos critères de recherche</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const todayPresence = getUserTodayPresence(user.id);
                    const activeStatut = todayPresence?.statut || null;
                    const isPayed = todayPresence?.paye || false;
                    
                    const dbPresence = displayedPresences.find(p => p.utilisateurId === user.id);
                    const wasPresentInitially = dbPresence?.statut === StatutPresence.PRESENT;
                    const isPresentNow = activeStatut === StatutPresence.PRESENT;
                    
                    let displayWorkedDays = workedDaysForDate[user.id] || 0;
                    if (wasPresentInitially && !isPresentNow) {
                      displayWorkedDays = Math.max(0, displayWorkedDays - 1);
                    } else if (!wasPresentInitially && isPresentNow) {
                      displayWorkedDays = displayWorkedDays + 1;
                    }

                    const isPending = savingUserId === user.id;

                    const getStatusBadge = () => {
                      if (activeStatut === StatutPresence.PRESENT) {
                        return {
                          label: "Présent",
                          icon: CheckCircle2,
                          className: "bg-emerald-50 text-emerald-700 border-emerald-200"
                        };
                      } else if (activeStatut === StatutPresence.ABSENT) {
                        return {
                          label: "Absent",
                          icon: X,
                          className: "bg-red-50 text-red-700 border-red-200"
                        };
                      } else if (activeStatut === StatutPresence.MALADE) {
                        return {
                          label: "Malade",
                          icon: HeartPulse,
                          className: "bg-amber-50 text-amber-700 border-amber-200"
                        };
                      } else {
                        return {
                          label: "Non pointé",
                          icon: Clock,
                          className: "bg-gray-50 text-gray-500 border-gray-200"
                        };
                      }
                    };

                    const statusBadge = getStatusBadge();
                    const StatusIcon = statusBadge.icon;

                    return (
                      <tr key={user.id} className="hover:bg-[#FAFAFA] transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#3C6C5F] text-white flex items-center justify-center font-bold text-xs">
                              {user.image ? (
                                <img src={user.image} alt={user.nom} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#29453E]">{user.prenom} {user.nom}</p>
                              <p className="text-xs text-[#3C6C5F]/50">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            user.role === "VETERINAIRE"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            {user.role === "VETERINAIRE" ? (
                              <>
                                <Stethoscope size={12} />
                                Vétérinaire
                              </>
                            ) : (
                              <>
                                <HardHat size={12} />
                                Employé
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${statusBadge.className}`}>
                            <StatusIcon size={12} />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF3DA] rounded-xl text-sm font-bold text-[#29453E]">
                            <Calendar size={12} className="text-[#3C6C5F]" />
                            {displayWorkedDays} j
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {activeStatut ? (
                            <button
                              onClick={() => handleSavePresence(user.id, activeStatut, !isPayed)}
                              disabled={isPending || isFuture}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 mx-auto ${
                                isPayed
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                              } ${isPending || isFuture ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                              title={isFuture ? "Impossible de modifier pour une date future" : ""}
                            >
                              {isPending ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Coins size={12} />
                              )}
                              {isPayed ? "Payé" : "Non payé"}
                            </button>
                          ) : (
                            <span className="text-xs text-[#3C6C5F]/30">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {activeStatut === StatutPresence.MALADE ? (
                            todayPresence?.certificatMedical ? (
                              <button
                                onClick={() => {
                                  setSelectedCertUrl(todayPresence.certificatMedical!);
                                  setSelectedUserName(`${user.prenom} ${user.nom}`);
                                }}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 mx-auto"
                              >
                                <Eye size={12} /> Voir
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-medium rounded-xl">
                                <AlertCircle size={12} />
                                En attente
                              </span>
                            )
                          ) : (
                            <span className="text-[#3C6C5F]/20">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#E8E3DC] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#3C6C5F]/50">
              Affichage de <span className="font-bold text-[#29453E]">{filteredUsers.length}</span> sur <span className="font-bold text-[#29453E]">{users.length}</span> employés
              {!isToday && (
                <span className="ml-2 text-[#3C6C5F]/40">
                  • {isPast ? "Historique" : "Futur"}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Présent
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Absent
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Malade
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCertUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#E8E3DC] flex items-center justify-between bg-[#FAFAFA]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#DDF3E8] rounded-xl">
                  <FileText size={18} className="text-[#3C6C5F]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#29453E]">Justificatif Médical</h3>
                  <p className="text-xs text-[#3C6C5F]/60">{selectedUserName}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCertUrl(null)}
                className="p-2 hover:bg-[#F8F6F3] rounded-xl transition-colors"
              >
                <X size={18} className="text-[#3C6C5F]/40" />
              </button>
            </div>

            <div className="flex-1 p-6 bg-[#F8F6F3] flex items-center justify-center min-h-[300px]">
              {selectedCertUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe 
                  src={selectedCertUrl} 
                  className="w-full h-[60vh] rounded-xl border border-[#E8E3DC] bg-white"
                  title="PDF justificatif"
                />
              ) : (
                <div className="max-w-full max-h-[60vh] rounded-xl overflow-hidden border border-[#E8E3DC] bg-white p-4">
                  <img 
                    src={selectedCertUrl} 
                    alt="Certificat médical" 
                    className="max-h-[55vh] object-contain"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E8E3DC] bg-[#FAFAFA] flex justify-end gap-3">
              <a 
                href={selectedCertUrl} 
                download 
                className="px-5 py-2.5 bg-[#3C6C5F] text-white hover:bg-[#29453E] font-medium rounded-xl transition-all flex items-center gap-2 text-sm"
              >
                <Download size={16} /> Télécharger
              </a>
              <button 
                onClick={() => setSelectedCertUrl(null)}
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