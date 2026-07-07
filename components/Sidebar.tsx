// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { Role } from "@prisma/client";
import { usePathname } from "next/navigation";

export default function Sidebar({ connectedUser }: { connectedUser: any }) {
  const role = connectedUser.role;
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Sauvegarder la position de défilement
  const saveScrollPosition = () => {
    if (navRef.current) {
      setScrollPosition(navRef.current.scrollTop);
    }
  };

  // Restaurer la position de défilement
  const restoreScrollPosition = () => {
    if (navRef.current && scrollPosition > 0) {
      navRef.current.scrollTop = scrollPosition;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Restaurer la position après les changements d'état
  useEffect(() => {
    // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
    requestAnimationFrame(() => {
      restoreScrollPosition();
    });
  }, [isCollapsed, isMobileOpen]);

  const toggleSidebar = () => {
    saveScrollPosition();
    setIsCollapsed(!isCollapsed);
    // Restaurer après le changement d'état
    setTimeout(restoreScrollPosition, 50);
  };

  const toggleMobile = () => {
    saveScrollPosition();
    setIsMobileOpen(!isMobileOpen);
    setTimeout(restoreScrollPosition, 50);
  };

  const getInitials = () => {
    const first = connectedUser.prenom?.[0] || "";
    const last = connectedUser.nom?.[0] || "";
    return (first + last).toUpperCase();
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case "ADMIN": return "Administrateur";
      case "AGRICULTEUR": return "Agriculteur";
      case "EMPLOYE": return "Employé";
      case "VETERINAIRE": return "Vétérinaire";
      default: return r;
    }
  };

  const getRoleColor = (r: string) => {
    switch (r) {
      case "ADMIN": return { bg: "from-rose-500 to-pink-600", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30" };
      case "AGRICULTEUR": return { bg: "from-[#3C6C5F] to-[#29453E]", badge: "bg-[#3C6C5F]/20 text-[#9DAE7A] border-[#3C6C5F]/30" };
      case "EMPLOYE": return { bg: "from-blue-500 to-indigo-600", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
      case "VETERINAIRE": return { bg: "from-amber-500 to-orange-600", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      default: return { bg: "from-gray-500 to-gray-600", badge: "bg-gray-500/20 text-gray-300 border-gray-500/30" };
    }
  };

  const roleColors = getRoleColor(role);

  const navGroups = [
    {
      label: "Général",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] },
        { href: "/dashboard/categories", label: "Catégories", icon: Tag, roles: [Role.ADMIN] },
        { href: "/dashboard/fermes", label: "Fermes", icon: Warehouse, roles: [Role.ADMIN, Role.AGRICULTEUR] },
        { href: "/dashboard/employes", label: "Mes Employés", icon: Users, roles: [Role.AGRICULTEUR, Role.ADMIN] },
      ]
    },
    {
      label: "Exploitation",
      items: [
        { href: "/dashboard/terrains", label: "Terrains", icon: Map, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] },
        { href: "/dashboard/animaux", label: "Animaux", icon: PawPrint, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] },
        { href: "/dashboard/traitements", label: "Traitements", icon: Stethoscope, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.VETERINAIRE] },
        { href: "/dashboard/cultures", label: "Cultures", icon: Wheat, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] },
      ]
    },
    {
      label: "Gestion",
      items: [
        { href: "/dashboard/finances", label: "Finances", icon: DollarSign, roles: [Role.ADMIN, Role.AGRICULTEUR] },
        { href: "/dashboard/predictions", label: "Prédictions", icon: BrainCircuit, roles: [Role.ADMIN, Role.AGRICULTEUR] },
        { href: "/dashboard/messages", label: "Messagerie", icon: Mail, roles: [Role.AGRICULTEUR, Role.EMPLOYE] },
        { href: "/dashboard/presences", label: "Présences", icon: UserCheck, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* Header / Logo */}
      <div className={`flex items-center ${isCollapsed ? "justify-center px-2 pt-5 pb-4" : "px-5 pt-6 pb-4"} relative flex-shrink-0`}>
        <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
          <div className={`relative flex-shrink-0 transition-all duration-500 ${isCollapsed ? "w-9 h-9" : "w-10 h-10"}`}>
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
                Smart<span className="text-[#9DAE7A]">Farming</span>
              </span>
              <p className="text-white/40 text-[10px] font-medium tracking-widest uppercase leading-tight">
                Plateforme agricole
              </p>
            </div>
          )}
        </Link>

        {/* Collapse button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3.5 top-8 w-7 h-7 items-center justify-center bg-[#1e2e28] border border-[#3C6C5F]/30 text-[#9DAE7A] hover:text-white hover:bg-[#3C6C5F]/60 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110"
          title={isCollapsed ? "Agrandir" : "Réduire"}
        >
          {isCollapsed ? <ChevronRight size={13} strokeWidth={3} /> : <ChevronLeft size={13} strokeWidth={3} />}
        </button>
      </div>

      {/* Separator */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3 flex-shrink-0" />

      {/* User Profile Card */}
      <div className={`mx-3 mb-4 rounded-2xl overflow-hidden relative ${isCollapsed ? "p-2" : "p-3"} flex-shrink-0`}
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 blur-2xl bg-gradient-to-br ${roleColors.bg}`} />

        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""} relative z-10`}>
          <div className={`relative flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br ${roleColors.bg} text-white flex items-center justify-center font-bold shadow-lg ${isCollapsed ? "w-9 h-9 text-sm" : "w-11 h-11 text-base"}`}>
            {connectedUser.image ? (
              <img src={connectedUser.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              getInitials()
            )}
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#9DAE7A] rounded-full border-2 border-[#0f1e18] shadow" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white/40 text-[9px] uppercase tracking-widest font-semibold leading-tight">
                Connecté
              </p>
              <h3 className="text-white font-semibold text-sm truncate leading-tight mt-0.5">
                {connectedUser.prenom} {connectedUser.nom}
              </h3>
              <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${roleColors.badge}`}>
                {getRoleLabel(role)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - avec scroll préservé */}
      <nav 
        ref={navRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10"
        style={{ 
          scrollBehavior: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(i => i.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-2">
              {!isCollapsed && (
                <p className="text-white/25 text-[9px] uppercase tracking-[0.15em] font-bold px-3 mb-1.5 mt-3">
                  {group.label}
                </p>
              )}
              {isCollapsed && <div className="my-2 h-px bg-white/10 mx-1" />}

              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => {
                      // Sauvegarder la position avant la navigation
                      saveScrollPosition();
                      // Fermer le mobile si ouvert
                      if (isMobileOpen) setIsMobileOpen(false);
                    }}
                    className={`
                      group relative flex items-center gap-3 rounded-xl transition-all duration-300 mb-0.5 text-sm font-medium
                      ${isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                      ${isActive
                        ? "bg-[#3C6C5F]/15 text-[#9DAE7A]"
                        : "text-white/50 hover:text-white hover:bg-white/6"
                      }
                    `}
                    style={isActive ? {
                      background: "linear-gradient(135deg, rgba(60,108,95,0.15) 0%, rgba(41,69,62,0.08) 100%)",
                      boxShadow: "inset 0 0 0 1px rgba(60,108,95,0.2)",
                    } : undefined}
                  >
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#9DAE7A] rounded-full shadow-lg shadow-[#9DAE7A]/50" />
                    )}

                    <Icon
                      size={isCollapsed ? 19 : 17}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={`flex-shrink-0 transition-all duration-300 ${isActive ? "text-[#9DAE7A] drop-shadow" : "group-hover:scale-110"}`}
                    />

                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {isActive && isCollapsed && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#9DAE7A] rounded-full shadow shadow-[#9DAE7A]" />
                    )}

                    {isCollapsed && hoveredItem === item.href && (
                      <div className="pointer-events-none absolute left-full ml-3 px-3 py-2 bg-[#0f1e18] text-white text-xs font-semibold rounded-xl shadow-2xl border border-[#3C6C5F]/20 whitespace-nowrap z-50">
                        {item.label}
                        <span className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-[#0f1e18] border-l border-b border-[#3C6C5F]/20 rotate-45" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 space-y-1 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link
          href="/settings"
          onClick={() => { if (isMobileOpen) setIsMobileOpen(false); }}
          className={`
            group flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/40 hover:text-white hover:bg-white/6 transition-all duration-300 text-sm
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          <Settings size={isCollapsed ? 19 : 17} strokeWidth={1.8} className="flex-shrink-0 group-hover:rotate-45 transition-transform duration-500" />
          {!isCollapsed && <span>Paramètres</span>}
        </Link>

        <Link
          href="/"
          onClick={() => { if (isMobileOpen) setIsMobileOpen(false); }}
          className={`
            group flex items-center gap-3 rounded-xl px-3 py-2.5 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 text-sm
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={isCollapsed ? 19 : 17} strokeWidth={1.8} className="flex-shrink-0 group-hover:-translate-x-0.5 group-hover:scale-110 transition-all duration-300" />
          {!isCollapsed && <span className="font-medium">Déconnexion</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 md:hidden text-white p-3 rounded-2xl shadow-xl transition-all"
        style={{ background: "linear-gradient(135deg, #1a2e24, #0f1e18)", border: "1px solid rgba(60,108,95,0.25)" }}
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
          background: "linear-gradient(160deg, #162820 0%, #0d1f18 40%, #081510 100%)",
          border: "1px solid rgba(60,108,95,0.12)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, #9DAE7A 0%, transparent 70%)" }}
        />

        <SidebarContent />
      </aside>
    </>
  );
}