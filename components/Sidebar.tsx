// components/Sidebar.tsx - Version optimisée avec Générateur IA
"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Map,
  Warehouse,
  PawPrint,
  Wheat,
  DollarSign,
  Stethoscope,
  Tag,
  BrainCircuit,
  Mail,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Users,
  Sparkles, //  Ajouté pour le générateur d'images
} from "lucide-react";
import { Role } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/contexts/TranslationContext";

export default function Sidebar({ connectedUser }: { connectedUser: any }) {
  const role = connectedUser.role;
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const { language, t, translateAllTexts, isTranslating } = useTranslation();

  //  Textes à traduire - mémorisés
  const pageTexts = useMemo(
    () => ({
      app_name: "Smart",
      app_name_suffix: "Farming",
      app_subtitle: "Plateforme agricole",
      connected: "Connecté",
      settings: "Paramètres",
      logout: "Déconnexion",
      general: "Général",
      exploitation: "Exploitation",
      gestion: "Gestion",
      dashboard: "Dashboard",
      categories: "Catégories",
      fermes: "Fermes",
      employees: "Employés",
      terrains: "Terrains",
      animaux: "Animaux",
      traitements: "Traitements",
      cultures: "Cultures",
      finances: "Finances",
      predictions: "Prédictions",
      messagerie: "Messagerie",
      presences: "Présences",
      admin: "Administrateur",
      agriculteur: "Agriculteur",
      employe: "Employé",
      veterinaire: "Vétérinaire",
      generateur: "Générateur IA", //  Ajouté
    }),
    [],
  );

  //  Traduire les textes - avec cleanup
  useEffect(() => {
    let isMounted = true;
    const doTranslation = async () => {
      if (isMounted) {
        await translateAllTexts(pageTexts, language === "fr" ? "fr" : language);
      }
    };
    doTranslation();
    return () => {
      isMounted = false;
    };
  }, [language, pageTexts, translateAllTexts]);

  //  Gestion du responsive
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        // Ne pas forcer l'ouverture, laisser l'utilisateur contrôler
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //  Fonctions mémorisées
  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const handleNavClick = useCallback(() => {
    if (isMobileOpen) setIsMobileOpen(false);
  }, [isMobileOpen]);

  //  Mémoriser les valeurs dérivées
  const initials = useMemo(() => {
    const first = connectedUser.prenom?.[0] || "";
    const last = connectedUser.nom?.[0] || "";
    return (first + last).toUpperCase();
  }, [connectedUser.prenom, connectedUser.nom]);

  const roleLabel = useMemo(() => {
    const r = connectedUser.role;
    switch (r) {
      case "ADMIN":
        return t("admin", pageTexts);
      case "AGRICULTEUR":
        return t("agriculteur", pageTexts);
      case "EMPLOYE":
        return t("employe", pageTexts);
      case "VETERINAIRE":
        return t("veterinaire", pageTexts);
      default:
        return r;
    }
  }, [connectedUser.role, t, pageTexts]);

  const roleColors = useMemo(() => {
    const r = connectedUser.role;
    switch (r) {
      case "ADMIN":
        return {
          bg: "from-rose-500 to-pink-600",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        };
      case "AGRICULTEUR":
        return {
          bg: "from-[#3C6C5F] to-[#29453E]",
          badge: "bg-[#3C6C5F]/20 text-[#9DAE7A] border-[#3C6C5F]/30",
        };
      case "EMPLOYE":
        return {
          bg: "from-blue-500 to-indigo-600",
          badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        };
      case "VETERINAIRE":
        return {
          bg: "from-amber-500 to-orange-600",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      default:
        return {
          bg: "from-gray-500 to-gray-600",
          badge: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        };
    }
  }, [connectedUser.role]);

  //  Navigation avec Générateur IA
  const navGroups = useMemo(() => {
    // Filtrer les éléments selon le rôle
    const allItems = [
      {
        href: "/dashboard",
        label: t("dashboard", pageTexts),
        icon: LayoutDashboard,
        roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE],
      },
      {
        href: "/dashboard/categories",
        label: t("categories", pageTexts),
        icon: Tag,
        roles: [Role.ADMIN],
      },
      {
        href: "/dashboard/fermes",
        label: t("fermes", pageTexts),
        icon: Warehouse,
        roles: [Role.ADMIN, Role.AGRICULTEUR],
      },
      {
        href: "/dashboard/employes",
        label: t("employees", pageTexts),
        icon: Users,
        roles: [Role.AGRICULTEUR, Role.ADMIN],
      },
      {
        href: "/dashboard/terrains",
        label: t("terrains", pageTexts),
        icon: Map,
        roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE],
      },
      {
        href: "/dashboard/animaux",
        label: t("animaux", pageTexts),
        icon: PawPrint,
        roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE],
      },
      {
        href: "/dashboard/traitements",
        label: t("traitements", pageTexts),
        icon: Stethoscope,
        roles: [Role.ADMIN, Role.AGRICULTEUR, Role.VETERINAIRE],
      },
      {
        href: "/dashboard/cultures",
        label: t("cultures", pageTexts),
        icon: Wheat,
        roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE],
      },
      {
        href: "/dashboard/finances",
        label: t("finances", pageTexts),
        icon: DollarSign,
        roles: [Role.ADMIN, Role.AGRICULTEUR],
      },
      {
        href: "/dashboard/predictions",
        label: t("predictions", pageTexts),
        icon: BrainCircuit,
        roles: [Role.ADMIN, Role.AGRICULTEUR],
      },
      {
        href: "/dashboard/messages",
        label: t("messagerie", pageTexts),
        icon: Mail,
        roles: [Role.AGRICULTEUR, Role.EMPLOYE],
      },
      {
        href: "/dashboard/presences",
        label: t("presences", pageTexts),
        icon: UserCheck,
        roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE],
      },
      {
        href: "/dashboard/generateur",
        label: t("generateur", pageTexts),
        icon: Sparkles,
        roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE],
      },
    ];

    // Filtrer les items visibles
    const visibleItems = allItems.filter((item) => item.roles.includes(role));

    // Grouper les items
    const groups: { id: string; label: string; items: typeof visibleItems }[] =
      [];
    const generalItems = visibleItems.filter((item) =>
      [
        "/dashboard",
        "/dashboard/categories",
        "/dashboard/fermes",
        "/dashboard/employes",
      ].includes(item.href),
    );
    const exploitationItems = visibleItems.filter((item) =>
      [
        "/dashboard/terrains",
        "/dashboard/animaux",
        "/dashboard/traitements",
        "/dashboard/cultures",
      ].includes(item.href),
    );
    const gestionItems = visibleItems.filter((item) =>
      [
        "/dashboard/finances",
        "/dashboard/predictions",
        "/dashboard/messages",
        "/dashboard/presences",
        "/dashboard/generateur",
      ].includes(item.href),
    );

    if (generalItems.length > 0) {
      groups.push({
        id: "general",
        label: t("general", pageTexts),
        items: generalItems,
      });
    }
    if (exploitationItems.length > 0) {
      groups.push({
        id: "exploitation",
        label: t("exploitation", pageTexts),
        items: exploitationItems,
      });
    }
    if (gestionItems.length > 0) {
      groups.push({
        id: "gestion",
        label: t("gestion", pageTexts),
        items: gestionItems,
      });
    }

    return groups;
  }, [role, t, pageTexts]);

  //  Rendu du contenu de la sidebar - mémorisé
  const SidebarContent = useMemo(() => {
    return (
      <div
        className="flex flex-col h-full"
        style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
      >
        {/* Header / Logo */}
        <div
          className={`flex items-center ${isCollapsed ? "justify-center px-2 pt-5 pb-4" : "px-5 pt-6 pb-4"} relative flex-shrink-0`}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group min-w-0"
          >
            <div
              className={`relative flex-shrink-0 transition-all duration-500 ${isCollapsed ? "w-9 h-9" : "w-10 h-10"}`}
            >
              <Image
                src="/logo.png"
                alt="Smart Farming"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span
                  className="font-bold text-white text-base tracking-wide"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
                >
                  {t("app_name", pageTexts)}
                  <span className="text-[#9DAE7A]">
                    {t("app_name_suffix", pageTexts)}
                  </span>
                </span>
                <p className="text-white/40 text-[10px] font-medium tracking-widest uppercase leading-tight">
                  {t("app_subtitle", pageTexts)}
                </p>
              </div>
            )}
          </Link>

          <button
            onClick={toggleSidebar}
            className="hidden md:flex absolute -right-3.5 top-8 w-7 h-7 items-center justify-center bg-[#1e2e28] border border-[#3C6C5F]/30 text-[#9DAE7A] hover:text-white hover:bg-[#3C6C5F]/60 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110"
            title={isCollapsed ? "Agrandir" : "Réduire"}
          >
            {isCollapsed ? (
              <ChevronRight size={13} strokeWidth={3} />
            ) : (
              <ChevronLeft size={13} strokeWidth={3} />
            )}
          </button>
        </div>

        {/* Separator */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3 flex-shrink-0" />

        {/* User Profile Card */}
        <div
          className={`mx-3 mb-4 rounded-2xl overflow-hidden relative ${isCollapsed ? "p-2" : "p-3"} flex-shrink-0`}
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 blur-2xl bg-gradient-to-br ${roleColors.bg}`}
          />

          <div
            className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""} relative z-10`}
          >
            <div
              className={`relative flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br ${roleColors.bg} text-white flex items-center justify-center font-bold shadow-lg ${isCollapsed ? "w-9 h-9 text-sm" : "w-11 h-11 text-base"}`}
            >
              {connectedUser.image ? (
                <img
                  src={connectedUser.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#9DAE7A] rounded-full border-2 border-[#0f1e18] shadow" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white/40 text-[9px] uppercase tracking-widest font-semibold leading-tight">
                  {t("connected", pageTexts)}
                </p>
                <h3 className="text-white font-semibold text-sm truncate leading-tight mt-0.5">
                  {connectedUser.prenom} {connectedUser.nom}
                </h3>
                <span
                  className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${roleColors.badge}`}
                >
                  {roleLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav
          ref={navRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10"
          style={{
            scrollBehavior: "auto",
            overscrollBehavior: "contain",
          }}
        >
          {navGroups.map((group) => (
            <div key={group.id} className="mb-2">
              {!isCollapsed && (
                <p className="text-white/25 text-[9px] uppercase tracking-[0.15em] font-bold px-3 mb-1.5 mt-3">
                  {group.label}
                </p>
              )}
              {isCollapsed && <div className="my-2 h-px bg-white/10 mx-1" />}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isGenerator = item.href === "/dashboard/generateur";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={handleNavClick}
                    className={`
                      group relative flex items-center gap-3 rounded-xl transition-all duration-300 mb-0.5 text-sm font-medium
                      ${isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                      ${
                        isActive
                          ? isGenerator
                            ? "bg-gradient-to-r from-[#3C6C5F]/20 to-[#29453E]/20 text-[#9DAE7A] shadow-[inset_0_0_0_1px_rgba(60,108,95,0.3)]"
                            : "bg-[#3C6C5F]/15 text-[#9DAE7A]"
                          : "text-white/50 hover:text-white hover:bg-white/6"
                      }
                    `}
                    style={
                      isActive && isGenerator
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(60,108,95,0.25) 0%, rgba(41,69,62,0.15) 100%)",
                            boxShadow:
                              "inset 0 0 0 1px rgba(60,108,95,0.3), 0 0 20px rgba(60,108,95,0.1)",
                          }
                        : isActive
                          ? {
                              background:
                                "linear-gradient(135deg, rgba(60,108,95,0.15) 0%, rgba(41,69,62,0.08) 100%)",
                              boxShadow: "inset 0 0 0 1px rgba(60,108,95,0.2)",
                            }
                          : undefined
                    }
                  >
                    {isActive && !isCollapsed && (
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full shadow-lg ${isGenerator ? "bg-[#9DAE7A] shadow-[#9DAE7A]/70" : "bg-[#9DAE7A] shadow-[#9DAE7A]/50"}`}
                      />
                    )}

                    <Icon
                      size={isCollapsed ? 19 : 17}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={`flex-shrink-0 transition-all duration-300 ${isActive ? "text-[#9DAE7A] drop-shadow" : "group-hover:scale-110"} ${isGenerator && isActive ? "animate-pulse" : ""}`}
                    />

                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {/*  Badge "NEW" pour le générateur */}
                    {isGenerator && !isCollapsed && (
                      <span className="ml-auto px-1.5 py-0.5 text-[7px] font-bold bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white rounded-full uppercase tracking-wider shadow-lg shadow-[#3C6C5F]/30 animate-pulse">
                        NEW
                      </span>
                    )}

                    {isActive && isCollapsed && (
                      <span
                        className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full shadow ${isGenerator ? "bg-[#9DAE7A] shadow-[#9DAE7A] animate-pulse" : "bg-[#9DAE7A] shadow-[#9DAE7A]"}`}
                      />
                    )}

                    {isCollapsed && hoveredItem === item.href && (
                      <div
                        className={`pointer-events-none absolute left-full ml-3 px-3 py-2 bg-[#0f1e18] text-white text-xs font-semibold rounded-xl shadow-2xl border border-[#3C6C5F]/20 whitespace-nowrap z-50 ${isGenerator ? "border-[#9DAE7A]/40" : ""}`}
                      >
                        {item.label}
                        {isGenerator && (
                          <span className="ml-1.5 px-1 py-0.5 text-[6px] font-bold bg-[#3C6C5F] text-white rounded-full uppercase tracking-wider">
                            NEW
                          </span>
                        )}
                        <span
                          className={`absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-[#0f1e18] border-l border-b border-[#3C6C5F]/20 rotate-45 ${isGenerator ? "border-[#9DAE7A]/40" : ""}`}
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-3 pb-4 pt-2 space-y-1 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Link
            href="/settings"
            onClick={handleNavClick}
            className={`
              group flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/40 hover:text-white hover:bg-white/6 transition-all duration-300 text-sm
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <Settings
              size={isCollapsed ? 19 : 17}
              strokeWidth={1.8}
              className="flex-shrink-0 group-hover:rotate-45 transition-transform duration-500"
            />
            {!isCollapsed && <span>{t("settings", pageTexts)}</span>}
          </Link>

          <Link
            href="/"
            onClick={handleNavClick}
            className={`
              group flex items-center gap-3 rounded-xl px-3 py-2.5 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 text-sm
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <LogOut
              size={isCollapsed ? 19 : 17}
              strokeWidth={1.8}
              className="flex-shrink-0 group-hover:-translate-x-0.5 group-hover:scale-110 transition-all duration-300"
            />
            {!isCollapsed && (
              <span className="font-medium">{t("logout", pageTexts)}</span>
            )}
          </Link>
        </div>
      </div>
    );
  }, [
    isCollapsed,
    isMobileOpen,
    hoveredItem,
    pathname,
    connectedUser,
    roleColors,
    roleLabel,
    initials,
    t,
    pageTexts,
    toggleSidebar,
    handleNavClick,
  ]);

  //  Affichage du loader
  if (isTranslating) {
    return (
      <aside
        className="relative flex-col shrink-0 transition-all duration-500 ease-in-out w-[240px] hidden md:flex m-3 rounded-2xl overflow-hidden h-[calc(100vh-1.5rem)]"
        style={{
          background:
            "linear-gradient(160deg, #162820 0%, #0d1f18 40%, #081510 100%)",
          border: "1px solid rgba(60,108,95,0.12)",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9DAE7A]"></div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 md:hidden text-white p-3 rounded-2xl shadow-xl transition-all"
        style={{
          background: "linear-gradient(135deg, #1a2e24, #0f1e18)",
          border: "1px solid rgba(60,108,95,0.25)",
        }}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          relative flex-col shrink-0 transition-all duration-500 ease-in-out
          ${isCollapsed ? "w-[72px]" : "w-[240px]"}
          ${isMobileOpen ? "fixed left-0 top-0 bottom-0 z-40 flex" : "hidden md:flex"}
          m-3 rounded-2xl overflow-hidden h-[calc(100vh-1.5rem)]
        `}
        style={{
          background:
            "linear-gradient(160deg, #162820 0%, #0d1f18 40%, #081510 100%)",
          border: "1px solid rgba(60,108,95,0.12)",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, #9DAE7A 0%, transparent 70%)",
          }}
        />

        {SidebarContent}
      </aside>
    </>
  );
}
