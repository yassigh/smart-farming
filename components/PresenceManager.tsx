// components/PresenceManager.tsx
"use client";

import { useState } from "react";
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
  // Nouvelles icônes modernes
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
  LucideIcon,
  // Icônes pour les rôles
  BriefcaseBusiness,
  UserCog,
  UserRoundCog as UserRoundCogIcon,
  HardHat,
  GraduationCap,
  Siren,
} from "lucide-react";
import { savePresenceAction } from "@/actions/presence";
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

// Icônes modernes pour les stats
const StatIcon = ({ icon: Icon, className = "" }: { icon: LucideIcon; className?: string }) => (
  <Icon className={className} />
);

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
  
  // Modal state for viewing certificates
  const [selectedCertUrl, setSelectedCertUrl] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const todayStr = new Date().toISOString().split("T")[0];

  // Helper to find today's presence for a user
  const getUserTodayPresence = (userId: number) => {
    return presences.find(p => p.utilisateurId === userId);
  };

  // Handle status or payment change
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
      date: todayStr,
      statut,
      paye
    });

    if (res.success && res.data) {
      const updatedPresence = res.data;
      setPresences(prev => {
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

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      `${user.prenom} ${user.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "TOUS" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const totalStaff = users.length;
  const presentCount = presences.filter(p => p.statut === StatutPresence.PRESENT).length;
  const absentCount = presences.filter(p => p.statut === StatutPresence.ABSENT).length;
  const maladeCount = presences.filter(p => p.statut === StatutPresence.MALADE).length;
  const nonPointesCount = totalStaff - presences.length;
  
  // Calculer les taux
  const presenceRate = totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 0;
  const absenceRate = totalStaff > 0 ? Math.round((absentCount / totalStaff) * 100) : 0;

  // Icônes modernes pour les cartes de stats
  const statCards = [
    {
      label: "Total",
      value: totalStaff,
      icon: Users,
      gradient: "from-blue-400 to-blue-600",
      shadow: "shadow-blue-500/20",
      textColor: "text-[#29453E] dark:text-white",
    },
    {
      label: "Présents",
      value: presentCount,
      icon: UserCheck,
      gradient: "from-emerald-400 to-emerald-600",
      shadow: "shadow-emerald-500/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      progress: presenceRate,
    },
    {
      label: "Absents",
      value: absentCount,
      icon: UserX,
      gradient: "from-red-400 to-red-600",
      shadow: "shadow-red-500/20",
      textColor: "text-red-600 dark:text-red-400",
      progress: absenceRate,
    },
    {
      label: "Malades",
      value: maladeCount,
      icon: HeartPulse,
      gradient: "from-amber-400 to-amber-600",
      shadow: "shadow-amber-500/20",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Non pointés",
      value: nonPointesCount,
      icon: Clock,
      gradient: "from-gray-400 to-gray-600",
      shadow: "shadow-gray-500/20",
      textColor: "text-gray-500 dark:text-gray-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F0F2ED] dark:from-[#0d1a15] dark:to-[#0d1a15] p-4 md:p-8">

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#3C6C5F] to-[#29453E] rounded-2xl shadow-lg shadow-[#3C6C5F]/20">
              <CalendarClock className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#29453E] dark:text-white">
                Gestion des Présences
              </h1>
              <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-0.5">
                Suivez et validez la présence quotidienne de vos employés
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-white dark:bg-[#1a2e28] rounded-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 shadow-sm flex items-center gap-3">
            <CalendarDays size={18} className="text-[#3C6C5F]" />
            <span className="text-sm font-semibold text-[#29453E] dark:text-white">
              {new Date().toLocaleDateString("fr-FR", { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center gap-3 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl flex items-center gap-3 shadow-sm animate-in fade-in duration-200">
          <AlertCircle size={20} className="text-red-500" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* ============================================ */}
      {/* STATS CARDS MODERNES */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="group bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${
                  index === 0 ? 'text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60' :
                  index === 1 ? 'text-emerald-600/60 dark:text-emerald-400/60' :
                  index === 2 ? 'text-red-600/60 dark:text-red-400/60' :
                  index === 3 ? 'text-amber-600/60 dark:text-amber-400/60' :
                  'text-gray-500/60 dark:text-gray-400/60'
                }`}>
                  {card.label}
                </p>
                <p className={`text-3xl font-extrabold mt-1 ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}>
                <card.icon size={22} className="text-white" />
              </div>
            </div>
            {card.progress !== undefined && (
              <>
                <div className="mt-3 h-1.5 w-full bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${
                      index === 1 ? 'from-emerald-400 to-emerald-600' : 'from-red-400 to-red-600'
                    } rounded-full transition-all duration-1000`} 
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
                <p className="text-xs text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 mt-2 font-medium">
                  {card.progress}% du personnel
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ============================================ */}
      {/* FILTER AND TABLE SECTION */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-[#1a2e28] rounded-3xl shadow-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-hidden hover:shadow-2xl transition-all duration-300">
        
        {/* Controls Header */}
        <div className="p-6 border-b border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-gradient-to-r from-[#FFF3DA]/20 to-white dark:from-[#2a3f38]/20 dark:to-[#1a2e28]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#3C6C5F]/40">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 rounded-2xl text-sm focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 bg-white dark:bg-[#0d1a15] transition-all text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/40"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {["TOUS", "EMPLOYE", "VETERINAIRE"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${
                    roleFilter === r
                      ? "bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white shadow-lg shadow-[#3C6C5F]/20"
                      : "bg-[#FFF3DA] dark:bg-[#2a3f38] text-[#29453E] dark:text-white hover:bg-[#FFC490]/30 dark:hover:bg-[#2a3f38]/70"
                  }`}
                >
                  {r === "TOUS" ? (
                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      TOUS
                    </span>
                  ) : r === "EMPLOYE" ? (
                    <span className="flex items-center gap-1.5">
                      <HardHat size={14} />
                      EMPLOYÉS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Stethoscope size={14} />
                      VÉTÉRINAIRES
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFF3DA]/50 dark:bg-[#2a3f38]/50 text-[#29453E] dark:text-white">
                <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Collaborateur</th>
                <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Rôle</th>
                <th className="py-4 px-6 text-center text-xs font-bold uppercase tracking-wider">Pointage</th>
                <th className="py-4 px-6 text-center text-xs font-bold uppercase tracking-wider">Jours travaillés</th>
                <th className="py-4 px-6 text-center text-xs font-bold uppercase tracking-wider">Statut Paie</th>
                <th className="py-4 px-6 text-center text-xs font-bold uppercase tracking-wider">Certificat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFC490]/10 dark:divide-[#FFC490]/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#FFF3DA] dark:bg-[#2a3f38] flex items-center justify-center">
                        <Users size={28} className="text-[#3C6C5F]/40" />
                      </div>
                      <p className="text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium">Aucun collaborateur trouvé</p>
                      <p className="text-xs text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40">Essayez de modifier vos critères de recherche</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const todayPresence = getUserTodayPresence(user.id);
                  const activeStatut = todayPresence?.statut || null;
                  const isPayed = todayPresence?.paye || false;
                  
                  const dbPresence = initialPresences.find(p => p.utilisateurId === user.id);
                  const wasPresentInitially = dbPresence?.statut === StatutPresence.PRESENT;
                  const isPresentNow = activeStatut === StatutPresence.PRESENT;
                  
                  let displayWorkedDays = workedDaysMap[user.id] || 0;
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
                    <tr key={user.id} className="hover:bg-[#FFF3DA]/10 dark:hover:bg-[#2a3f38]/20 transition-colors duration-200 group">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-[#FFC490]/30 group-hover:scale-105 transition-transform">
                            {user.image ? (
                              <img src={user.image} alt={user.nom} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#29453E] dark:text-white text-sm">{user.prenom} {user.nom}</h4>
                            <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role - Remplacé les emojis par des icônes */}
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border-2 inline-flex items-center gap-1.5 ${
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

                      {/* Pointage */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-xs font-bold shadow-sm ${statusBadge.className}`}>
                          <StatusIcon size={14} />
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Worked Days */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-xl border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 text-sm font-bold text-[#29453E] dark:text-white">
                          <Calendar size={14} className="text-[#3C6C5F]" />
                          <span>{displayWorkedDays} j</span>
                        </div>
                      </td>

                      {/* Payment status */}
                      <td className="py-4 px-6 text-center">
                        {activeStatut ? (
                          <button
                            onClick={() => handleSavePresence(user.id, activeStatut, !isPayed)}
                            disabled={isPending}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-300 flex items-center gap-1.5 mx-auto ${
                              isPayed
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                            } ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:scale-105'}`}
                          >
                            {isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Coins size={14} />
                            )}
                            {isPayed ? "Payé ✅" : "Non payé ⏳"}
                          </button>
                        ) : (
                          <span className="text-xs text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 italic">-</span>
                        )}
                      </td>

                      {/* Medical Certificate */}
                      <td className="py-4 px-6 text-center">
                        {activeStatut === StatutPresence.MALADE ? (
                          todayPresence?.certificatMedical ? (
                            <button
                              onClick={() => {
                                setSelectedCertUrl(todayPresence.certificatMedical!);
                                setSelectedUserName(`${user.prenom} ${user.nom}`);
                              }}
                              className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200 text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-1.5 mx-auto hover:shadow-md hover:scale-105"
                            >
                              <Eye size={14} /> Voir Scan
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border-2 border-red-200 text-xs font-bold rounded-xl">
                              <AlertCircle size={14} />
                              En attente
                            </span>
                          )
                        ) : (
                          <span className="text-[#3C6C5F]/20 dark:text-[#9DAE7A]/20">—</span>
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
        <div className="p-4 border-t border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FFF3DA]/20 dark:bg-[#2a3f38]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium">
            Affichage de <span className="font-bold text-[#29453E] dark:text-white">{filteredUsers.length}</span> sur <span className="font-bold text-[#29453E] dark:text-white">{users.length}</span> collaborateurs
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Présent
            </span>
            <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-200 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Absent
            </span>
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Malade
            </span>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* CERTIFICATE VIEWER MODAL - MODERN */}
      {/* ============================================ */}
      {selectedCertUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2e28] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#FFC490]/20 dark:border-[#FFC490]/10 flex justify-between items-center bg-gradient-to-r from-[#FFF3DA]/30 to-white dark:from-[#2a3f38]/30 dark:to-[#1a2e28]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-xl">
                  <FileText size={20} className="text-[#3C6C5F]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#29453E] dark:text-white text-lg">Justificatif Médical</h3>
                  <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Pour : {selectedUserName}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCertUrl(null)}
                className="p-2 rounded-xl hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all"
              >
                <X size={22} className="text-[#3C6C5F]/60" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-8 overflow-y-auto bg-[#FAFAFA] dark:bg-[#0d1a15] flex items-center justify-center min-h-[300px]">
              {selectedCertUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe 
                  src={selectedCertUrl} 
                  className="w-full h-[60vh] rounded-2xl border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28]"
                  title="PDF justificatif"
                />
              ) : (
                <div className="relative max-w-full max-h-[60vh] rounded-2xl overflow-hidden border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28] p-4">
                  <img 
                    src={selectedCertUrl} 
                    alt="Certificat médical" 
                    className="max-h-[55vh] object-contain rounded"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#FFC490]/20 dark:border-[#FFC490]/10 flex justify-end gap-3 bg-gradient-to-r from-[#FFF3DA]/30 to-white dark:from-[#2a3f38]/30 dark:to-[#1a2e28]">
              <a 
                href={selectedCertUrl} 
                download 
                className="px-6 py-3 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white hover:from-[#29453E] hover:to-[#1f332e] font-bold rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl"
              >
                <Download size={18} /> Télécharger
              </a>
              <button 
                onClick={() => setSelectedCertUrl(null)}
                className="px-6 py-3 border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] text-[#29453E] dark:text-white font-bold rounded-2xl transition-all duration-300"
              >
                Fermer
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
        @keyframes slideDown {
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
        .slide-down {
          animation: slideDown 0.2s ease-out;
        }
        .zoom-in-95 {
          animation: zoomIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}