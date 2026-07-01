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
  Vaccine,
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

// ─── Mapping titre → icône + couleur ──────────────────────────────────────
function getNotifStyle(titre: string): {
  Icon: React.ElementType;
  bg: string;
  iconColor: string;
  accent: string;
} {
  const t = titre.toLowerCase();
  
  // Rappels de vaccination
  if (t.includes("rappel de vaccination") || t.includes("vaccination - ⚠️") || t.includes("vaccination - 🔔"))
    return { Icon: Vaccine, bg: "bg-blue-500/15", iconColor: "text-blue-400", accent: "border-l-blue-400" };
  
  // Rappels de traitement
  if (t.includes("rappel de traitement") || t.includes("traitement - ⚠️") || t.includes("traitement - 🔔"))
    return { Icon: Pill, bg: "bg-purple-500/15", iconColor: "text-purple-400", accent: "border-l-purple-400" };
  
  // Urgent
  if (t.includes("urgent"))
    return { Icon: AlertCircle, bg: "bg-red-500/15", iconColor: "text-red-400", accent: "border-l-red-400" };
  
  // Rappel standard
  if (t.includes("rappel"))
    return { Icon: ClockIcon, bg: "bg-amber-500/15", iconColor: "text-amber-400", accent: "border-l-amber-400" };
  
  if (t.includes("animal") || t.includes("bête") || t.includes("paw"))
    return { Icon: PawPrint, bg: "bg-orange-500/15", iconColor: "text-orange-400", accent: "border-l-orange-400" };
  if (t.includes("culture") || t.includes("récolte") || t.includes("plantation"))
    return { Icon: Sprout, bg: "bg-emerald-500/15", iconColor: "text-emerald-400", accent: "border-l-emerald-400" };
  if (t.includes("vaccination") || t.includes("vaccin"))
    return { Icon: Syringe, bg: "bg-blue-500/15", iconColor: "text-blue-400", accent: "border-l-blue-400" };
  if (t.includes("traitement") || t.includes("médicament"))
    return { Icon: Stethoscope, bg: "bg-purple-500/15", iconColor: "text-purple-400", accent: "border-l-purple-400" };
  if (t.includes("ferme") || t.includes("farm"))
    return { Icon: Home, bg: "bg-amber-500/15", iconColor: "text-amber-400", accent: "border-l-amber-400" };
  if (t.includes("terrain"))
    return { Icon: Map, bg: "bg-teal-500/15", iconColor: "text-teal-400", accent: "border-l-teal-400" };
  if (t.includes("finance") || t.includes("dépense") || t.includes("revenu"))
    return { Icon: DollarSign, bg: "bg-green-500/15", iconColor: "text-green-400", accent: "border-l-green-400" };
  if (t.includes("prédiction") || t.includes("analyse"))
    return { Icon: TrendingUp, bg: "bg-indigo-500/15", iconColor: "text-indigo-400", accent: "border-l-indigo-400" };
  if (t.includes("alerte") || t.includes("urgent") || t.includes("supprimé"))
    return { Icon: AlertTriangle, bg: "bg-red-500/15", iconColor: "text-red-400", accent: "border-l-red-400" };
  if (t.includes("utilisateur") || t.includes("par "))
    return { Icon: User, bg: "bg-sky-500/15", iconColor: "text-sky-400", accent: "border-l-sky-400" };
  return { Icon: Info, bg: "bg-secondary/15", iconColor: "text-secondary", accent: "border-l-secondary" };
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

  // Vérifier les rappels périodiquement
  const checkReminders = useCallback(async () => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
      });
      if (response.ok) {
        // Recharger les notifications après l'envoi des rappels
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
      // Vérifier les rappels une fois par jour (à 8h)
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
        className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-card/90 backdrop-blur-xl border border-theme shadow-lg hover:shadow-xl hover:border-secondary/50 transition-all duration-200 hover:scale-105 active:scale-95 group"
        aria-label="Notifications"
      >
        {unreadCount > 0
          ? <Bell className="w-5 h-5 text-secondary transition-transform group-hover:rotate-12" />
          : <BellOff className="w-5 h-5 text-muted transition-transform group-hover:scale-110" />
        }

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-md shadow-red-500/40 animate-bounce">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {refreshing && (
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-card border-2 border-secondary rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping" />
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[370px] rounded-2xl overflow-hidden shadow-2xl border border-theme/60 backdrop-blur-xl bg-card/95"
          style={{ animation: "slideDown 0.18s ease-out" }}
        >
          <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-secondary/8 via-transparent to-transparent border-b border-theme/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-sm leading-none">Notifications</h3>
                  <p className="text-[10px] text-muted mt-0.5">
                    {lastFetch ? `Mis à jour ${formatDate(lastFetch.toISOString())}` : "Chargement..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => loadNotifications(true)}
                  disabled={refreshing}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-secondary hover:bg-secondary/10 transition-all"
                  title="Rafraîchir"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-secondary hover:bg-secondary/10 transition-all"
                    title="Tout marquer comme lu"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout lire
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-1 p-0.5 bg-secondary/5 rounded-xl">
              {(["all", "unread"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 rounded-[10px] text-[11px] font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  {tab === "all" ? "Toutes" : "Non lues"}
                  {tab === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[380px] overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-secondary/30 border-t-secondary animate-spin" />
                <p className="text-xs text-muted">Chargement...</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="w-14 h-14 rounded-2xl bg-secondary/8 flex items-center justify-center">
                  <BellOff className="w-6 h-6 text-muted/40" />
                </div>
                <p className="text-sm font-medium text-muted">
                  {activeTab === "unread" ? "Aucune non lue" : "Aucune notification"}
                </p>
                <p className="text-xs text-muted/50">Vous êtes à jour ✓</p>
              </div>
            ) : (
              <div className="divide-y divide-theme/40">
                {displayed.map((notif) => {
                  const { Icon, bg, iconColor, accent } = getNotifStyle(notif.titre);
                  const { acteur, body } = extractActeur(notif.message);
                  const isUnread = notif.statut === "NON_LUE";
                  return (
                    <div
                      key={notif.id}
                      onClick={() => isUnread && handleMarkAsRead(notif.id)}
                      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all duration-150 hover:bg-secondary/5
                        ${isUnread ? `border-l-[3px] ${accent} bg-secondary/3` : "border-l-[3px] border-l-transparent"}`}
                    >
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${bg} flex items-center justify-center mt-0.5`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-bold leading-tight ${isUnread ? "text-primary" : "text-muted"}`}>
                            {notif.titre}
                          </p>
                          <span className="text-[10px] text-muted/50 flex-shrink-0 mt-0.5">
                            {formatDate(notif.dateEnvoi)}
                          </span>
                        </div>

                        {acteur && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-4 h-4 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                              <User className="w-2.5 h-2.5 text-secondary" />
                            </div>
                            <span className="text-[10px] font-semibold text-secondary">{acteur}</span>
                          </div>
                        )}

                        <p className="text-[11px] text-muted mt-1 leading-relaxed line-clamp-2">{body}</p>
                        
                        {/* Badge "Rappel" si c'en est un */}
                        {notif.titre.toLowerCase().includes('rappel') && (
                          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full">
                            <ClockIcon size={10} />
                            Rappel
                          </span>
                        )}
                      </div>

                      {isUnread && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-muted hover:text-secondary hover:bg-secondary/10 transition-all"
                          title="Marquer comme lu"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!isUnread && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-secondary/30 mt-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-theme/60 bg-secondary/3 flex items-center justify-between">
            <p className="text-[10px] text-muted/50">
              Auto-refresh · 15s
            </p>
            <p className="text-[10px] text-muted/50">
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}