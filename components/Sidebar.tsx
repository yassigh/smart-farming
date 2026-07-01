"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Headphones,
  Map,
  Warehouse,
  PawPrint,
  Wheat,
  DollarSign,
  Bell,
  Stethoscope,
  Tag,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Search,
  Sparkles,
  Users,
  Home,
  HelpCircle,
  LogIn
} from "lucide-react";
import { Role } from "@prisma/client";
import { usePathname } from "next/navigation";

export default function Sidebar({ connectedUser }: { connectedUser: any }) {
  const role = connectedUser.role;
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Auto collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Get user initials
  const getInitials = () => {
    const first = connectedUser.prenom?.[0] || "";
    const last = connectedUser.nom?.[0] || "";
    return (first + last).toUpperCase();
  };

  // Navigation items
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] },
    { href: "/dashboard/categories", label: "Catégories", icon: Tag, roles: [Role.ADMIN] },
    { href: "/dashboard/fermes", label: "Fermes", icon: Warehouse, roles: [Role.ADMIN, Role.AGRICULTEUR] },
    { href: "/dashboard/terrains", label: "Terrains", icon: Map, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] },
    { href: "/dashboard/animaux", label: "Animaux", icon: PawPrint, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] },
    { href: "/dashboard/traitements", label: "Traitements", icon: Stethoscope, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.VETERINAIRE] },
    { href: "/dashboard/cultures", label: "Cultures", icon: Wheat, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] },
    { href: "/dashboard/finances", label: "Finances", icon: DollarSign, roles: [Role.ADMIN, Role.AGRICULTEUR] },
    { href: "/dashboard/predictions", label: "Prédictions", icon: BrainCircuit, roles: [Role.ADMIN, Role.AGRICULTEUR] },
    { href: "/dashboard/presences", label: "Présences", icon: UserCheck, roles: [Role.ADMIN, Role.AGRICULTEUR, Role.EMPLOYE, Role.VETERINAIRE] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 md:hidden bg-card/90 backdrop-blur-xl text-primary p-3 rounded-2xl shadow-xl border border-theme hover:bg-card transition-all"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          relative bg-white/95 dark:bg-card/95 backdrop-blur-xl border border-theme flex flex-col justify-between p-4 shrink-0 transition-all duration-500 rounded-3xl m-4 my-6
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "fixed left-0 top-0 bottom-0 z-40 shadow-2xl h-auto" : "hidden md:flex"}
          shadow-xl shadow-black/5 h-[calc(100vh-3rem)]
        `}
      >
        <div className="space-y-4">
          {/* Logo - tout en haut */}
          <Link href="/dashboard" className="block mb-6">
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-start"}`}>
              <div className={`relative flex-shrink-0 transition-all duration-500 ${isCollapsed ? "w-10 h-10" : "w-32 h-12"}`}>
                <Image
                  src="/logo.png"
                  alt="Smart Farming"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </div>
          </Link>

          <button
            onClick={toggleSidebar}
            className="absolute -right-3.5 top-10 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-500 hover:text-[#3C6C5F] rounded-full p-1.5 shadow-md z-50 transition-all duration-300 hidden md:block hover:scale-110"
            title={isCollapsed ? "Agrandir" : "Réduire"}
          >
            {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
          </button>

          {/* User Profile */}
          <div
            className={`
              flex items-center gap-3 bg-[#F5F8F7] dark:bg-secondary/10 p-3 rounded-2xl border border-secondary/15 dark:border-secondary/20
              ${isCollapsed ? "justify-center" : ""}
              group
            `}
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-secondary to-[#29453E] text-white flex items-center justify-center font-bold overflow-hidden flex-shrink-0 shadow-lg shadow-secondary/20">
              {connectedUser.image ? (
                <img
                  src={connectedUser.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials()
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white/80 shadow-lg"></div>
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[8px] text-secondary/50 uppercase tracking-widest truncate">
                  Bienvenue
                </p>
                <h3 className="font-semibold text-primary truncate text-sm">
                  {connectedUser.prenom} {connectedUser.nom}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="px-2 py-0.5 bg-secondary/10 rounded-full">
                    <p className="text-[9px] text-secondary font-medium truncate">
                      {connectedUser.role}
                    </p>
                  </div>
                  <Sparkles size={10} className="text-secondary" />
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

          {/* MENU */}
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium group relative
                    ${isActive 
                      ? "bg-secondary/10 text-primary shadow-sm border border-secondary/20" 
                      : "text-muted hover:text-primary hover:bg-secondary/5"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className={`
                    relative flex-shrink-0 transition-all duration-300
                    ${isActive ? "scale-110" : "group-hover:scale-105"}
                  `}>
                    <Icon size={isCollapsed ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <span className="absolute -right-1 -top-1 w-2 h-2 bg-secondary rounded-full animate-pulse" />
                    )}
                  </div>
                  {!isCollapsed && item.label}
                  
                  {/* Tooltip for collapsed */}
                  {isCollapsed && hoveredItem === item.href && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-xl shadow-xl border border-white/10 whitespace-nowrap z-50 animate-fadeIn">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-primary"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - Paramètres et Déconnexion */}
        <div className="border-t border-secondary/10 pt-4 space-y-1.5">
          {/* Paramètres */}
          <Link
            href="/settings"
            className={`
              flex items-center gap-3 px-3 py-2.5 text-muted hover:text-secondary hover:bg-secondary/5 rounded-xl transition-all duration-300 text-sm group
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <Settings size={isCollapsed ? 20 : 18} className="group-hover:scale-110 transition-transform" />
            {!isCollapsed && "Paramètres"}
          </Link>

          {/* Logout */}
          <Link
            href="/"
            className={`
              flex items-center gap-3 px-3 py-2.5 text-red-400/60 hover:text-red-500 hover:bg-red-50/20 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300 text-sm group
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={isCollapsed ? 20 : 18} className="group-hover:scale-110 transition-transform" />
            {!isCollapsed && "Déconnexion"}
          </Link>
        </div>
      </aside>
    </>
  );
}