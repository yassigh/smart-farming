// components/NotificationIcon.tsx
"use client";

import {
  Bell,
  BellOff,
  CheckCheck,
  X,
  RefreshCw,
  Sprout,
  PawPrint,
  Syringe,
  Home,
  Map,
  DollarSign,
  User,
  AlertTriangle,
  Info,
  TrendingUp,
  CalendarClock,
  Clock,
  Pill,
  Stethoscope,
  AlertCircle,
  Clock as ClockIcon,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/actions/notification";

interface Notification {
  id: number;
  titre: string;
  message: string;
  dateEnvoi: string;
  statut: "LUE" | "NON_LUE";
}

// ─── Couleurs de l'application ──────────────────────────────────────────────
const COLORS = {
  SOLEIL: '#FFF3DA',
  DOUCEUR: '#FFC490',
  NATURE: '#3C6C5F',
  JOIE_DE_VIVRE: '#29453E',
  PRINTEMPS: '#9DAE7A',
};

// ─── Mapping titre → icône + couleur ──────────────────────────────────────
function getNotifStyle(titre: string): {
  Icon: React.ElementType;
  bg: string;
  iconColor: string;
  accent: string;
  badgeColor: string;
} {
  const t = titre.toLowerCase();
  
  if (t.includes("rappel de vaccination") || t.includes("vaccination - ⚠️") || t.includes("vaccination - 🔔"))
    return { 
      Icon: Syringe, 
      bg: "bg-blue-100 dark:bg-blue-900/30", 
      iconColor: "text-blue-600 dark:text-blue-400", 
      accent: "border-l-blue-500",
      badgeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
    };
  if (t.includes("rappel de traitement") || t.includes("traitement - ⚠️") || t.includes("traitement - 🔔"))
    return { 
      Icon: Pill, 
      bg: "bg-purple-100 dark:bg-purple-900/30", 
      iconColor: "text-purple-600 dark:text-purple-400", 
      accent: "border-l-purple-500",
      badgeColor: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
    };
  if (t.includes("urgent") || t.includes("alerte"))
    return { 
      Icon: AlertCircle, 
      bg: "bg-red-100 dark:bg-red-900/30", 
      iconColor: "text-red-600 dark:text-red-400", 
      accent: "border-l-red-500",
      badgeColor: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
    };
  if (t.includes("rappel"))
    return { 
      Icon: ClockIcon, 
      bg: "bg-amber-100 dark:bg-amber-900/30", 
      iconColor: "text-amber-600 dark:text-amber-400", 
      accent: "border-l-amber-500",
      badgeColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
    };
  if (t.includes("animal") || t.includes("bête") || t.includes("paw"))
    return { 
      Icon: PawPrint, 
      bg: "bg-orange-100 dark:bg-orange-900/30", 
      iconColor: "text-orange-600 dark:text-orange-400", 
      accent: "border-l-orange-500",
      badgeColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
    };
  if (t.includes("culture") || t.includes("récolte") || t.includes("plantation"))
    return { 
      Icon: Sprout, 
      bg: "bg-emerald-100 dark:bg-emerald-900/30", 
      iconColor: "text-emerald-600 dark:text-emerald-400", 
      accent: "border-l-emerald-500",
      badgeColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
    };
  if (t.includes("vaccination") || t.includes("vaccin"))
    return { 
      Icon: Syringe, 
      bg: "bg-blue-100 dark:bg-blue-900/30", 
      iconColor: "text-blue-600 dark:text-blue-400", 
      accent: "border-l-blue-500",
      badgeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
    };
  if (t.includes("traitement") || t.includes("médicament"))
    return { 
      Icon: Stethoscope, 
      bg: "bg-purple-100 dark:bg-purple-900/30", 
      iconColor: "text-purple-600 dark:text-purple-400", 
      accent: "border-l-purple-500",
      badgeColor: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
    };
  if (t.includes("ferme") || t.includes("farm"))
    return { 
      Icon: Home, 
      bg: "bg-amber-100 dark:bg-amber-900/30", 
      iconColor: "text-amber-600 dark:text-amber-400", 
      accent: "border-l-amber-500",
      badgeColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
    };
  if (t.includes("terrain"))
    return { 
      Icon: Map, 
      bg: "bg-teal-100 dark:bg-teal-900/30", 
      iconColor: "text-teal-600 dark:text-teal-400", 
      accent: "border-l-teal-500",
      badgeColor: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
    };
  if (t.includes("finance") || t.includes("dépense") || t.includes("revenu"))
    return { 
      Icon: DollarSign, 
      bg: "bg-green-100 dark:bg-green-900/30", 
      iconColor: "text-green-600 dark:text-green-400", 
      accent: "border-l-green-500",
      badgeColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
    };
  if (t.includes("prédiction") || t.includes("analyse"))
    return { 
      Icon: TrendingUp, 
      bg: "bg-indigo-100 dark:bg-indigo-900/30", 
      iconColor: "text-indigo-600 dark:text-indigo-400", 
      accent: "border-l-indigo-500",
      badgeColor: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
    };
  if (t.includes("utilisateur") || t.includes("par "))
    return { 
      Icon: User, 
      bg: "bg-sky-100 dark:bg-sky-900/30", 
      iconColor: "text-sky-600 dark:text-sky-400", 
      accent: "border-l-sky-500",
      badgeColor: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
    };
  return { 
    Icon: Info, 
    bg: "bg-gray-100 dark:bg-gray-800/30", 
    iconColor: "text-gray-600 dark:text-gray-400", 
    accent: "border-l-gray-500",
    badgeColor: "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300"
  };
}

function formatDate(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (s < 10) return "À l'instant";
  if (m < 1) return `${s}s`;
  if (m < 60) return `${m} min`;
  if (h < 24) return `${h} h`;
  if (d < 7) return `${d} j`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// Extraire le nom de l'auteur depuis le message
function extractActeur(message: string): { acteur: string | null; body: string } {
  const match = message.match(/^👤 Par ([\s\S]+?) — ([\s\S]+)$/);
  if (match) return { acteur: match[1].trim(), body: match[2].trim() };
  return { acteur: null, body: message };
}

export default function NotificationIcon({ userId }: { userId: number }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadNotifications = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true);
      else if (!lastFetch) setLoading(true);
      try {
        const result = await getUserNotifications(userId);
        if (result.success && result.notifications) {
          const mapped: Notification[] = result.notifications.map((n) => ({
            id: n.id,
            titre: n.titre,
            message: n.message,
            dateEnvoi:
              n.dateEnvoi instanceof Date
                ? n.dateEnvoi.toISOString()
                : String(n.dateEnvoi),
            statut: n.statut === "LUE" ? "LUE" : "NON_LUE",
          }));
          setNotifications(mapped);
          setUnreadCount(result.unreadCount ?? 0);
          setLastFetch(new Date());
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId, lastFetch]
  );

  const checkReminders = useCallback(async () => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
      });
      if (response.ok) {
        await loadNotifications(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des rappels:', error);
    }
  }, [loadNotifications]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      loadNotifications(false);
      const now = new Date();
      if (now.getHours() === 8 && now.getMinutes() === 0) {
        checkReminders();
      }
    }, 60000);
  }, [loadNotifications, checkReminders]);

  useEffect(() => {
    loadNotifications();
    checkReminders();
    startPolling();
    
    const handleVisibility = () => {
      if (!document.hidden) { 
        loadNotifications(false); 
        startPolling(); 
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("mousedown", handleOutside);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("mousedown", handleOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleMarkAsRead = async (id: number) => {
    const result = await markNotificationAsRead(id);
    if (result.success) {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, statut: "LUE" } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead(userId);
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, statut: "LUE" })));
      setUnreadCount(0);
    }
  };

  const displayed =
    activeTab === "unread"
      ? notifications.filter((n) => n.statut === "NON_LUE")
      : notifications;

  return (
    <div className="fixed top-4 right-6 z-50" ref={dropdownRef}>
      <button
        onClick={() => { const next = !isOpen; setIsOpen(next); if (next) loadNotifications(true); }}
        className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-[#1a2e28] backdrop-blur-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 shadow-lg hover:shadow-xl hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 transition-all duration-200 hover:scale-105 active:scale-95 group"
        aria-label="Notifications"
      >
        {unreadCount > 0
          ? <Bell className="w-5 h-5 text-[#3C6C5F] dark:text-[#9DAE7A] transition-transform group-hover:rotate-12" />
          : <BellOff className="w-5 h-5 text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 transition-transform group-hover:scale-110" />
        }

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-gradient-to-br from-[#FFC490] to-[#D4A574] text-[#29453E] dark:text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-md shadow-[#FFC490]/40 animate-bounce">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {refreshing && (
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white dark:bg-[#1a2e28] border-2 border-[#3C6C5F] dark:border-[#9DAE7A] rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-[#3C6C5F] dark:bg-[#9DAE7A] rounded-full animate-ping" />
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[400px] rounded-2xl overflow-hidden shadow-2xl border border-[#FFF3DA]/60 dark:border-[#3C6C5F]/30 backdrop-blur-xl bg-white/95 dark:bg-[#1a2e28]/95"
          style={{ animation: "slideDown 0.18s ease-out" }}
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF3DA] dark:bg-[#29453E]/30 flex items-center justify-center">
                  <Bell className="w-4.5 h-4.5 text-[#3C6C5F] dark:text-[#9DAE7A]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#29453E] dark:text-white text-sm leading-none">Notifications</h3>
                  <p className="text-[10px] text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-0.5">
                    {lastFetch ? `Mis à jour ${formatDate(lastFetch.toISOString())}` : "Chargement..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => loadNotifications(true)}
                  disabled={refreshing}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 hover:text-[#3C6C5F] dark:hover:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#29453E]/30 transition-all"
                  title="Rafraîchir"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#29453E]/30 transition-all"
                    title="Tout marquer comme lu"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout lire
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-0.5 bg-[#FFF3DA]/40 dark:bg-[#29453E]/20 rounded-xl mt-2">
              {(["all", "unread"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 rounded-[10px] text-[11px] font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-white dark:bg-[#1a2e28] text-[#29453E] dark:text-white shadow-sm border border-[#FFC490]/30 dark:border-[#3C6C5F]/30"
                      : "text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 hover:text-[#29453E] dark:hover:text-white"
                  }`}
                >
                  {tab === "all" ? "Toutes" : "Non lues"}
                  {tab === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-[#FFC490] text-[#29453E] dark:text-white text-[9px] font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#3C6C5F]/30 dark:border-[#9DAE7A]/30 border-t-[#3C6C5F] dark:border-t-[#9DAE7A] animate-spin" />
                <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Chargement...</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF3DA]/40 dark:bg-[#29453E]/20 flex items-center justify-center">
                  <BellOff className="w-7 h-7 text-[#3C6C5F]/30 dark:text-[#9DAE7A]/30" />
                </div>
                <p className="text-sm font-medium text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70">
                  {activeTab === "unread" ? "Aucune non lue" : "Aucune notification"}
                </p>
                <p className="text-xs text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40">Vous êtes à jour ✓</p>
              </div>
            ) : (
              <div className="divide-y divide-[#FFF3DA]/40 dark:divide-[#3C6C5F]/20">
                {displayed.map((notif) => {
                  const { Icon, bg, iconColor, accent, badgeColor } = getNotifStyle(notif.titre);
                  const { acteur, body } = extractActeur(notif.message);
                  const isUnread = notif.statut === "NON_LUE";
                  const isRappel = notif.titre.toLowerCase().includes('rappel');
                  
                  return (
                    <div
                      key={notif.id}
                      onClick={() => isUnread && handleMarkAsRead(notif.id)}
                      className={`group relative flex items-start gap-3 px-5 py-4 cursor-pointer transition-all duration-200 hover:bg-[#FFF3DA]/30 dark:hover:bg-[#29453E]/20
                        ${isUnread ? `border-l-[3px] ${accent} bg-[#FFF3DA]/10 dark:bg-[#29453E]/10` : "border-l-[3px] border-l-transparent"}`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${bg} flex items-center justify-center mt-0.5 shadow-sm`}>
                        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-bold leading-tight ${isUnread ? "text-[#29453E] dark:text-white" : "text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60"}`}>
                            {notif.titre}
                          </p>
                          <span className="text-[10px] text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 flex-shrink-0 mt-0.5">
                            {formatDate(notif.dateEnvoi)}
                          </span>
                        </div>

                        {acteur && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-4 h-4 rounded-full bg-[#3C6C5F]/10 dark:bg-[#9DAE7A]/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-2.5 h-2.5 text-[#3C6C5F] dark:text-[#9DAE7A]" />
                            </div>
                            <span className="text-[10px] font-semibold text-[#3C6C5F] dark:text-[#9DAE7A]">{acteur}</span>
                          </div>
                        )}

                        <p className="text-[12px] text-[#3C6C5F]/80 dark:text-[#9DAE7A]/80 mt-1.5 leading-relaxed">
                          {body}
                        </p>
                        
                        {/* Badges */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {isRappel && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 ${badgeColor} text-[9px] font-bold rounded-full border border-current/20`}>
                              <ClockIcon size={10} />
                              Rappel
                            </span>
                          )}
                          
                          {isUnread && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FFC490]/20 text-[#D4A574] text-[9px] font-bold rounded-full border border-[#FFC490]/30">
                              <Circle size={6} className="fill-current" />
                              Non lu
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action button */}
                      {isUnread && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 hover:text-[#3C6C5F] dark:hover:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#29453E]/30 transition-all"
                          title="Marquer comme lu"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#3C6C5F] dark:text-[#9DAE7A]" />
                        </button>
                      )}

                      {!isUnread && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#3C6C5F]/20 dark:bg-[#9DAE7A]/20 mt-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20 bg-[#FFF3DA]/10 dark:bg-[#29453E]/10 flex items-center justify-between">
            <p className="text-[10px] text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50 flex items-center gap-1.5">
              <RefreshCw size={10} className="animate-spin" />
              Auto-refresh · 15s
            </p>
            <p className="text-[10px] text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50 font-medium">
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              {unreadCount > 0 && ` · ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        /* Scrollbar personnalisée */
        .max-h-\\[400px\\]::-webkit-scrollbar {
          width: 4px;
        }
        .max-h-\\[400px\\]::-webkit-scrollbar-track {
          background: transparent;
        }
        .max-h-\\[400px\\]::-webkit-scrollbar-thumb {
          background: #3C6C5F30;
          border-radius: 10px;
        }
        .max-h-\\[400px\\]::-webkit-scrollbar-thumb:hover {
          background: #3C6C5F60;
        }
      `}</style>
    </div>
  );
}