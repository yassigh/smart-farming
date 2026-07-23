// components/DashboardView.tsx - VERSION COMPLÈTE AVEC AGROMONITORING

"use client";

import { useState, useEffect, useMemo } from "react";
import { Role } from "@prisma/client";
import { addUtilisateurAction, deleteUtilisateurAction } from "@/actions/utilisateur";
import { useTranslation } from "@/contexts/TranslationContext";
import AgriDashboardWithAgromonitoring from './AgriDashboardWithAgromonitoring';
import {
  Search,
  Trash2,
  Users,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Building2,
  TreePine,
  Beef,
  Sprout,
  Syringe,
  Stethoscope,
  BadgeCheck,
  AlertTriangle,
  RefreshCw,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  UserPlus,
  BarChart3,
  LineChart,
  PieChart,
  Calendar as CalendarIcon,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Droplets,
  Wind,
  Thermometer,
  MapPin,
} from "lucide-react";
import Link from "next/link";

// ============================================
// TYPES
// ============================================

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  telephone?: string | null;
  createdAt?: Date | string;
}

interface SickAnimal {
  id: number;
  numero: string;
  type: string;
  race: string;
  poids: number;
  etatSante: string;
  terrain: {
    nom: string;
    ferme: {
      nom: string;
    };
  };
}

interface RecentTraitement {
  id: number;
  date: Date;
  medicament: string;
  description: string;
  animal: {
    id: number;
    numero: string;
    type: string;
  };
  veterinaire: {
    id: number;
    nom: string;
    prenom: string;
  };
}

interface DashboardViewProps {
  initialUsers: User[];
  initialConnectedUserIndex?: number;
  employeInfo?: any;
  vetStats?: {
    totalAnimals: number;
    sickAnimalsCount: number;
    myTreatmentsCount: number;
    sickAnimalsList: SickAnimal[];
    recentTreatmentsList: RecentTraitement[];
  };
  agriStats?: {
    totalFermes: number;
    totalTerrains: number;
    totalAnimaux: number;
    totalCultures: number;
    fermes?: Array<{
      id: number;
      nom: string;
      localisation?: string;
      latitude?: number | null;
      longitude?: number | null;
    }>;
    terrains?: Array<{
      id: number;
      nom: string;
      fermeId: number;
      localisation?: string;
      latitude?: number | null;
      longitude?: number | null;
    }>;
  };
  employeeStats?: {
    terrains: any[];
    terrainsAssignes: any[];
    animaux: any[];
    cultures: any[];
  };
}

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  };
  daily: Array<{
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

// ============================================
// PALETTE DE COULEURS
// ============================================

const COLORS = {
  SOLEIL: '#FFF3DA',
  DOUCEUR: '#FFC490',
  NATURE: '#3C6C5F',
  JOIE_DE_VIVRE: '#29453E',
  PRINTEMPS: '#9DAE7A',
};

// ============================================
// COMPOSANT STATISTIQUES
// ============================================

function AppStats({ stats, t, pageTexts }: { stats: any; t: any; pageTexts: any }) {
  const statItems = [
    { label: t ? t('stats_total', pageTexts) : 'Total', value: stats?.total || 0, icon: Users, bg: COLORS.NATURE, text: 'text-[#3C6C5F]', iconBg: 'bg-[#3C6C5F]/10' },
    { label: t ? t('stats_active', pageTexts) : 'Actifs', value: stats?.active || 0, icon: CheckCircle2, bg: COLORS.PRINTEMPS, text: 'text-[#9DAE7A]', iconBg: 'bg-[#9DAE7A]/10' },
    { label: t ? t('stats_new', pageTexts) : 'Nouveaux', value: stats?.new || 0, icon: Sparkles, bg: COLORS.DOUCEUR, text: 'text-[#FFC490]', iconBg: 'bg-[#FFC490]/10' },
    { label: t ? t('stats_trend', pageTexts) : 'Tendance', value: stats?.trend || '+0%', icon: TrendingUp, bg: COLORS.JOIE_DE_VIVRE, text: 'text-[#29453E]', iconBg: 'bg-[#29453E]/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const isTrend = item.label === (t ? t('stats_trend', pageTexts) : 'Tendance');
        const trendValue = String(item.value);
        const isPositive = trendValue.startsWith('+') || !trendValue.startsWith('-');
        
        return (
          <div 
            key={index} 
            className="group relative overflow-hidden bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 hover:border-[#FFC490] dark:hover:border-[#FFC490]/50"
            style={{ borderColor: `${item.bg}30` }}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-xl transition-opacity duration-500 opacity-[0.04] group-hover:opacity-[0.08]" style={{ background: item.bg }}></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30`}>
                <item.icon size={20} className={item.text} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-widest truncate">{item.label}</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-[#29453E] dark:text-white tracking-tight">{item.value}</span>
                  {isTrend && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                      isPositive ? 'bg-[#FFF3DA] dark:bg-[#29453E]/30 text-[#3C6C5F] dark:text-[#9DAE7A]' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                    }`}>
                      {isPositive ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-500 opacity-20 group-hover:opacity-50" style={{ background: `linear-gradient(to right, transparent, ${item.bg}, transparent)` }}></div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// COMPOSANT MÉTÉO
// ============================================

function AppWeather({ weatherData, loading, error }: { weatherData: WeatherData | null; loading: boolean; error: string | null }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 animate-pulse h-[166px] flex items-center">
        <div className="flex items-center gap-4 w-full">
          <div className="w-14 h-14 rounded-full bg-[#FFF3DA] dark:bg-[#29453E]/30"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[#FFF3DA] dark:bg-[#29453E]/30 rounded w-3/4"></div>
            <div className="h-3 bg-[#FFF3DA] dark:bg-[#29453E]/30 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-red-200 dark:border-red-900/30 h-[166px] flex items-center">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="font-bold text-sm">Météo indisponible</p>
            <p className="text-xs text-red-500/80 mt-0.5">{error || "Données non disponibles"}</p>
          </div>
        </div>
      </div>
    );
  }

  const current = weatherData.current;
  const weatherMain = current.weather[0]?.main || 'clear';
  
  const getWeatherIcon = (main: string) => {
    const iconMap: Record<string, { icon: any; color: string }> = {
      'clear': { icon: Sun, color: 'text-[#FFC490]' },
      'clouds': { icon: Cloud, color: 'text-[#9DAE7A]' },
      'rain': { icon: CloudRain, color: 'text-[#3C6C5F]' },
      'drizzle': { icon: Droplets, color: 'text-[#3C6C5F]' },
      'thunderstorm': { icon: CloudLightning, color: 'text-[#FFC490]' },
      'snow': { icon: CloudSnow, color: 'text-[#9DAE7A]' },
      'mist': { icon: CloudFog, color: 'text-[#9DAE7A]' },
      'fog': { icon: CloudFog, color: 'text-[#9DAE7A]' },
    };
    return iconMap[main.toLowerCase()] || { icon: Sun, color: 'text-[#FFC490]' };
  };

  const weatherInfo = getWeatherIcon(weatherMain);
  const WeatherIcon = weatherInfo.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 shadow-xl border border-[#FFF3DA]/30 group h-[166px] flex flex-col justify-between" style={{ background: `linear-gradient(135deg, ${COLORS.JOIE_DE_VIVRE}, ${COLORS.NATURE})` }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" style={{ background: `${COLORS.DOUCEUR}20` }}></div>
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
            <WeatherIcon size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-3xl font-extrabold text-white tracking-tight">{Math.round(current.temp)}</span>
              <span className="text-lg font-bold" style={{ color: COLORS.DOUCEUR }}>°C</span>
            </div>
            <p className="text-[11px] font-semibold text-[#FFF3DA]/80 capitalize mt-0.5 truncate max-w-[120px]">{current.weather[0]?.description || 'Météo'}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
            <span className="text-[10px] font-bold text-white tracking-wide">Hammamet</span>
          </div>
          <p className="text-[10px] text-[#FFF3DA]/60 font-medium mt-1.5">
            {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
      
      <div className="relative z-10 grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/10">
        <div className="flex items-center gap-1.5 justify-center bg-white/5 rounded-lg py-1 border border-white/5">
          <Droplets size={12} className="text-blue-300" />
          <span className="text-xs font-semibold text-slate-100">{current.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center bg-white/5 rounded-lg py-1 border border-white/5">
          <Wind size={12} className="text-[#9DAE7A]" />
          <span className="text-xs font-semibold text-slate-100">{Math.round(current.wind_speed)} m/s</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center bg-white/5 rounded-lg py-1 border border-white/5">
          <Thermometer size={12} className="text-[#FFC490]" />
          <span className="text-xs font-semibold text-slate-100">Ressenti {Math.round(current.feels_like)}°</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT GRAPHIQUE
// ============================================

function AppChart({ data, title, subtitle }: { data: any[]; title: string; subtitle?: string }) {
  const max = Math.max(...data.map(d => d.value || 0), 1);
  const colors = ['#3C6C5F', '#9DAE7A', '#FFC490', '#29453E', '#FFF3DA'];

  if (data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium">{subtitle}</p>}
          </div>
        </div>
        <div className="h-56 flex flex-col items-center justify-center text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40">
          <BarChart3 size={40} className="mb-2 opacity-35" />
          <p className="text-sm font-semibold">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="h-52 relative mt-4">
        <div className="w-full h-full flex items-end gap-3 pb-6 relative">
          <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-[#FFF3DA] dark:border-[#3C6C5F]/30 w-full h-0"></div>
            <div className="border-b border-[#FFF3DA] dark:border-[#3C6C5F]/30 w-full h-0"></div>
            <div className="border-b border-[#FFF3DA] dark:border-[#3C6C5F]/30 w-full h-0"></div>
          </div>
          {data.map((item, index) => {
            const value = item.value || 0;
            const height = Math.max((value / max) * 100, 5);
            const color = colors[index % colors.length];
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
                <div className="w-full relative h-full flex items-end justify-center">
                  <div 
                    className="w-full sm:w-[60%] rounded-t-lg transition-all duration-500 hover:brightness-105 relative cursor-pointer flex justify-center"
                    style={{ 
                      height: `${height}%`,
                      minHeight: '6px',
                      background: `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
                      boxShadow: `0 4px 12px ${color}20`
                    }}
                  >
                    <div className="absolute -top-8 bg-[#29453E] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg border border-white/10 z-20 font-bold">
                      {value}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-bold uppercase tracking-wider truncate w-full text-center border-t border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20 pt-1">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT HEADER ACTIONS
// ============================================

function HeaderActions({ 
  onExport,
  onRefresh,
  loading,
  period, 
  setPeriod,
  showAddButton = false,
  onAdd,
  addButtonLabel = "Ajouter",
  addButtonIcon: AddButtonIcon = UserPlus,
}: any) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="relative">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="appearance-none pl-3.5 pr-8.5 py-2.5 rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 bg-white dark:bg-[#1a2e28] text-xs font-bold text-[#29453E] dark:text-[#9DAE7A] focus:outline-none focus:ring-2 focus:ring-[#FFC490]/50 cursor-pointer shadow-sm min-w-[95px] transition-all hover:border-[#FFC490] dark:hover:border-[#FFC490]/50"
        >
          <option value="all">Tous</option>
          <option value="month">30 jours</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/60 pointer-events-none" />
      </div>

      <button 
        onClick={onExport}
        disabled={loading}
        className="p-2.5 rounded-xl bg-white dark:bg-[#1a2e28] border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#29453E]/30 hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed relative flex items-center justify-center min-w-[42px] hover:-translate-y-0.5 cursor-pointer"
        title="Télécharger le rapport PDF"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      </button>

      <button 
        onClick={onRefresh}
        className="p-2.5 rounded-xl bg-white dark:bg-[#1a2e28] border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#29453E]/30 hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 transition-all duration-300 shadow-sm flex items-center justify-center min-w-[42px] hover:-translate-y-0.5 cursor-pointer"
        title="Rafraîchir"
      >
        <RefreshCw size={16} />
      </button>

      {showAddButton && onAdd && (
        <button 
          onClick={onAdd}
          className="px-5 py-2.5 rounded-xl text-white font-bold text-xs tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${COLORS.NATURE}, ${COLORS.JOIE_DE_VIVRE})` }}
        >
          <AddButtonIcon size={16} />
          {addButtonLabel}
        </button>
      )}
    </div>
  );
}

// ============================================
// DASHBOARD ADMIN
// ============================================

function AppAdminDashboard({ 
  users, filteredUsers, searchQuery, setSearchQuery, handleDeleteUser, 
  weatherData, weatherLoading, weatherError,
  isModalOpen, setIsModalOpen, handleAddUserSubmit,
  nom, setNom, prenom, setPrenom, email, setEmail, 
  motDePasse, setMotDePasse, telephone, setTelephone, 
  role, setRole, modalLoading, modalMessage,
  exportPDF, loading, success, error, period, setPeriod,
  t, pageTexts
}: any) {
  
  const getWeeklyData = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days.map((day, index) => ({
      label: day,
      value: users.filter((u: User) => {
        if (!u.createdAt) return false;
        const date = new Date(u.createdAt);
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1);
        const targetDate = new Date(weekStart);
        targetDate.setDate(weekStart.getDate() + index);
        return date.toDateString() === targetDate.toDateString();
      }).length
    }));
  };

  const getMonthlyData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const currentYear = new Date().getFullYear();
    return months.map((month, index) => ({
      label: month,
      value: users.filter((u: User) => {
        if (!u.createdAt) return false;
        const date = new Date(u.createdAt);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      }).length
    }));
  };

  const getRoleData = () => {
    return [
      { label: t('role_admin', pageTexts), value: users.filter((u: User) => u.role === Role.ADMIN).length },
      { label: t('role_agriculteur', pageTexts), value: users.filter((u: User) => u.role === Role.AGRICULTEUR).length },
      { label: t('role_veterinaire', pageTexts), value: users.filter((u: User) => u.role === Role.VETERINAIRE).length },
      { label: t('role_employe', pageTexts), value: users.filter((u: User) => u.role === Role.EMPLOYE).length },
    ];
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const roleData = getRoleData();

  const totalUsers = users.length;
  const activeUsers = users.filter((u: User) => u.role !== Role.EMPLOYE).length;
  const newUsers = users.filter((u: User) => {
    if (!u.createdAt) return false;
    const date = new Date(u.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date > weekAgo;
  }).length;
  const trend = totalUsers > 0 ? `+${Math.round((activeUsers / totalUsers) * 100)}%` : '0%';

  const handleRefresh = () => window.location.reload();

  return (
    <div className="min-h-screen p-4 md:p-6 transition-colors duration-500" style={{ background: `linear-gradient(135deg, ${COLORS.SOLEIL}40, ${COLORS.PRINTEMPS}20)` }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#29453E] dark:text-white tracking-tight">{t('dashboard_admin_title', pageTexts)}</h1>
          <p className="text-xs md:text-sm text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 font-medium mt-1">{t('dashboard_admin_subtitle', pageTexts)}</p>
        </div>
        <HeaderActions
          onExport={() => exportPDF(period)}
          onRefresh={handleRefresh}
          loading={loading}
          period={period}
          setPeriod={setPeriod}
          showAddButton={true}
          onAdd={() => setIsModalOpen(true)}
          addButtonLabel={t('add_user', pageTexts)}
          addButtonIcon={UserPlus}
        />
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl text-[#29453E] dark:text-white text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300" style={{ background: `${COLORS.PRINTEMPS}30`, border: `1px solid ${COLORS.PRINTEMPS}50` }}>
          <CheckCircle2 size={16} style={{ color: COLORS.NATURE }} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
        <div className="lg:col-span-1">
          <AppWeather weatherData={weatherData} loading={weatherLoading} error={weatherError} />
        </div>
        <div className="lg:col-span-3">
          <AppStats stats={{ total: totalUsers, active: activeUsers, new: newUsers, trend: trend }} t={t} pageTexts={pageTexts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AppChart data={weeklyData} title={t('weekly_activity', pageTexts)} subtitle={t('weekly_activity_sub', pageTexts)} />
        <AppChart data={monthlyData} title={t('monthly_evolution', pageTexts)} subtitle={t('monthly_evolution_sub', pageTexts)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AppChart data={roleData} title={t('role_distribution', pageTexts)} subtitle={t('role_distribution_sub', pageTexts)} />
        <div className="lg:col-span-2 bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight mb-1">{t('key_indicators', pageTexts)}</h3>
            <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium mb-5">{t('key_indicators_sub', pageTexts)}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border transition-all duration-300 hover:scale-105" style={{ background: `${COLORS.NATURE}15`, borderColor: `${COLORS.NATURE}30` }}>
              <p className="text-[10px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{t('stats_total', pageTexts)}</p>
              <p className="text-3xl font-extrabold text-[#29453E] dark:text-white mt-1" style={{ color: COLORS.NATURE }}>{totalUsers}</p>
            </div>
            <div className="p-4 rounded-2xl border transition-all duration-300 hover:scale-105" style={{ background: `${COLORS.PRINTEMPS}15`, borderColor: `${COLORS.PRINTEMPS}30` }}>
              <p className="text-[10px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{t('stats_active', pageTexts)}</p>
              <p className="text-3xl font-extrabold text-[#29453E] dark:text-white mt-1" style={{ color: COLORS.PRINTEMPS }}>{activeUsers}</p>
            </div>
            <div className="p-4 rounded-2xl border transition-all duration-300 hover:scale-105" style={{ background: `${COLORS.DOUCEUR}15`, borderColor: `${COLORS.DOUCEUR}30` }}>
              <p className="text-[10px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{t('stats_new', pageTexts)}</p>
              <p className="text-3xl font-extrabold text-[#29453E] dark:text-white mt-1" style={{ color: COLORS.DOUCEUR }}>{newUsers}</p>
            </div>
            <div className="p-4 rounded-2xl border transition-all duration-300 hover:scale-105" style={{ background: `${COLORS.JOIE_DE_VIVRE}15`, borderColor: `${COLORS.JOIE_DE_VIVRE}30` }}>
              <p className="text-[10px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{t('stats_trend', pageTexts)}</p>
              <p className="text-3xl font-extrabold text-[#29453E] dark:text-white mt-1" style={{ color: COLORS.JOIE_DE_VIVRE }}>{trend}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2e28] rounded-2xl shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 overflow-hidden transition-all duration-300">
        <div className="px-6 py-5 border-b border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight">{t('registered_users', pageTexts)}</h2>
            <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium mt-0.5">{filteredUsers.length} {t('accounts_registered', pageTexts)}</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={t('search_user', pageTexts)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 bg-[#FAFAFA] dark:bg-[#0d1a15] text-xs font-semibold text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/40 dark:placeholder:text-[#9DAE7A]/40 focus:outline-none focus:ring-2 focus:ring-[#FFC490]/50 focus:border-transparent transition-all w-full sm:w-60"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-[#3C6C5F] dark:text-[#9DAE7A] text-[10px] font-bold uppercase tracking-wider border-b border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20" style={{ background: `${COLORS.SOLEIL}60` }}>
                <th className="px-6 py-4 text-left">{t('user', pageTexts)}</th>
                <th className="px-6 py-4 text-left">{t('email', pageTexts)}</th>
                <th className="px-6 py-4 text-left">{t('role', pageTexts)}</th>
                <th className="px-6 py-4 text-right">{t('actions', pageTexts)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF3DA]/50 dark:divide-[#3C6C5F]/20">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-[#FFF3DA]/30 dark:hover:bg-[#29453E]/20 transition-colors duration-250">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-[0_4px_12px_rgba(60,108,95,0.15)]" style={{ background: `linear-gradient(135deg, ${COLORS.NATURE}, ${COLORS.JOIE_DE_VIVRE})` }}>
                        {user.prenom?.[0]}{user.nom?.[0]}
                      </div>
                      <span className="font-bold text-sm text-[#29453E] dark:text-white tracking-tight">{user.prenom} {user.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-xs font-semibold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60">{user.email}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border ${
                      user.role === Role.ADMIN ? 'text-[#29453E] dark:text-[#9DAE7A]' :
                      user.role === Role.AGRICULTEUR ? 'text-[#3C6C5F] dark:text-[#9DAE7A]' :
                      user.role === Role.VETERINAIRE ? 'text-[#FFC490]' :
                      'text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60'
                    }`}
                    style={{ 
                      background: user.role === Role.ADMIN ? `${COLORS.JOIE_DE_VIVRE}20` :
                      user.role === Role.AGRICULTEUR ? `${COLORS.NATURE}20` :
                      user.role === Role.VETERINAIRE ? `${COLORS.DOUCEUR}20` :
                      `${COLORS.SOLEIL}40`,
                      borderColor: user.role === Role.ADMIN ? `${COLORS.JOIE_DE_VIVRE}30` :
                      user.role === Role.AGRICULTEUR ? `${COLORS.NATURE}30` :
                      user.role === Role.VETERINAIRE ? `${COLORS.DOUCEUR}30` :
                      `${COLORS.SOLEIL}50`
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[#3C6C5F]/40 hover:text-red-500 transition-all cursor-pointer" title={t('delete_user', pageTexts)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2e28] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#FFC490]/30 animate-in zoom-in-95 duration-250">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20">
              <h2 className="text-lg font-extrabold text-[#29453E] dark:text-white tracking-tight">{t('add_user', pageTexts)}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-[#FFF3DA] dark:hover:bg-[#29453E]/30 transition-all cursor-pointer">
                <X size={16} className="text-[#3C6C5F]/70" />
              </button>
            </div>
            
            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{t('first_name', pageTexts)}</label>
                  <input type="text" placeholder={t('first_name', pageTexts)} value={prenom} onChange={(e) => setPrenom(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 bg-[#FAFAFA] dark:bg-[#0d1a15] text-xs font-semibold text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/30 focus:outline-none focus:ring-2 focus:ring-[#FFC490]/50" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{t('last_name', pageTexts)}</label>
                  <input type="text" placeholder={t('last_name', pageTexts)} value={nom} onChange={(e) => setNom(e.target.value)} className="px-3.5 py-2.5 rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 bg-[#FAFAFA] dark:bg-[#0d1a15] text-xs font-semibold text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/30 focus:outline-none focus:ring-2 focus:ring-[#FFC490]/50" required />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{t('email', pageTexts)}</label>
                <input type="email" placeholder="adresse@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 bg-[#FAFAFA] dark:bg-[#0d1a15] text-xs font-semibold text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/30 focus:outline-none focus:ring-2 focus:ring-[#FFC490]/50" required />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{t('password', pageTexts)}</label>
                <input type="password" placeholder="••••••••" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 bg-[#FAFAFA] dark:bg-[#0d1a15] text-xs font-semibold text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/30 focus:outline-none focus:ring-2 focus:ring-[#FFC490]/50" required />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{t('phone_optional', pageTexts)}</label>
                <input type="tel" placeholder="+216 -- --- ---" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 bg-[#FAFAFA] dark:bg-[#0d1a15] text-xs font-semibold text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/30 focus:outline-none focus:ring-2 focus:ring-[#FFC490]/50" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{t('role', pageTexts)}</label>
                <div className="relative">
                  <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="appearance-none w-full px-3.5 py-2.5 rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 bg-[#FAFAFA] dark:bg-[#0d1a15] text-xs font-bold text-[#29453E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC490]/50 cursor-pointer">
                    <option value={Role.EMPLOYE}>{t('role_employe', pageTexts)}</option>
                    <option value={Role.AGRICULTEUR}>{t('role_agriculteur', pageTexts)}</option>
                    <option value={Role.VETERINAIRE}>{t('role_veterinaire', pageTexts)}</option>
                    <option value={Role.ADMIN}>{t('role_admin', pageTexts)}</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3C6C5F]/60 pointer-events-none" />
                </div>
              </div>

              {modalMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {modalMessage}
                </div>
              )}
              
              <div className="flex gap-3 pt-4 border-t border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/30 text-xs font-bold text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#29453E]/30 transition-all cursor-pointer">{t('cancel', pageTexts)}</button>
                <button type="submit" disabled={modalLoading} className="flex-1 py-3 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md hover:shadow-lg cursor-pointer" style={{ background: `linear-gradient(135deg, ${COLORS.NATURE}, ${COLORS.JOIE_DE_VIVRE})` }}>
                  {modalLoading ? t('saving', pageTexts) : t('create_account', pageTexts)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// DASHBOARD VÉTÉRINAIRE
// ============================================

function AppVetDashboard({ 
  vetStats, weatherData, weatherLoading, weatherError, 
  exportPDF, loading, success, error, period, setPeriod,
  t, pageTexts 
}: any) {
  const getConsultationsData = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    if (!vetStats?.recentTreatmentsList || vetStats.recentTreatmentsList.length === 0) {
      return days.map(day => ({ label: day, value: 0 }));
    }
    
    const treatmentsByDay = vetStats.recentTreatmentsList.reduce((acc: any, t: RecentTraitement) => {
      const day = new Date(t.date).getDay();
      const dayMap = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const dayName = dayMap[day];
      if (!acc[dayName]) acc[dayName] = 0;
      acc[dayName]++;
      return acc;
    }, {});

    return days.map(day => ({
      label: day,
      value: treatmentsByDay[day] || 0
    }));
  };

  const getMonthlyTreatments = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    if (!vetStats?.recentTreatmentsList || vetStats.recentTreatmentsList.length === 0) {
      return months.map(month => ({ label: month, value: 0 }));
    }
    
    const treatmentsByMonth = vetStats.recentTreatmentsList.reduce((acc: any, t: RecentTraitement) => {
      const month = new Date(t.date).getMonth();
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const monthName = monthNames[month];
      if (!acc[monthName]) acc[monthName] = 0;
      acc[monthName]++;
      return acc;
    }, {});

    return months.map(month => ({
      label: month,
      value: treatmentsByMonth[month] || 0
    }));
  };

  const consultationsData = getConsultationsData();
  const monthlyTreatments = getMonthlyTreatments();

  const totalAnimals = vetStats?.totalAnimals || 0;
  const sickAnimals = vetStats?.sickAnimalsCount || 0;
  const trend = totalAnimals > 0 ? `+${Math.round((sickAnimals / totalAnimals) * 100)}%` : '0%';

  const handleRefresh = () => window.location.reload();

  const safeT = (key: string, texts: Record<string, string>) => {
    if (typeof t === 'function') return t(key, texts);
    return texts[key] || key;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 transition-colors duration-500" style={{ background: `linear-gradient(135deg, ${COLORS.SOLEIL}40, ${COLORS.PRINTEMPS}20)` }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#29453E] dark:text-white tracking-tight">{safeT('dashboard_vet_title', pageTexts)}</h1>
          <p className="text-xs md:text-sm text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 font-medium mt-1">{safeT('dashboard_vet_subtitle', pageTexts)}</p>
        </div>
        <HeaderActions
          onExport={() => exportPDF(period)}
          onRefresh={handleRefresh}
          loading={loading}
          period={period}
          setPeriod={setPeriod}
          showAddButton={true}
          onAdd={() => window.location.href = '/dashboard/traitements/add'}
          addButtonLabel={safeT('vet_new_treatment', pageTexts)}
          addButtonIcon={Syringe}
        />
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl text-[#29453E] dark:text-white text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300" style={{ background: `${COLORS.PRINTEMPS}30`, border: `1px solid ${COLORS.PRINTEMPS}50` }}>
          <CheckCircle2 size={16} style={{ color: COLORS.NATURE }} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
        <div className="lg:col-span-1">
          <AppWeather weatherData={weatherData} loading={weatherLoading} error={weatherError} />
        </div>
        <div className="lg:col-span-3">
          <AppStats stats={{ total: totalAnimals, active: totalAnimals, new: sickAnimals, trend: trend }} t={t} pageTexts={pageTexts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AppChart data={consultationsData} title={safeT('vet_consultations', pageTexts)} subtitle={safeT('vet_consultations_sub', pageTexts)} />
        <AppChart data={monthlyTreatments} title={safeT('vet_care_evolution', pageTexts)} subtitle={safeT('vet_care_evolution_sub', pageTexts)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30">
          <h3 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight mb-4">{safeT('vet_monitored_animals', pageTexts)}</h3>
          {vetStats?.sickAnimalsList?.length === 0 ? (
            <div className="text-center py-10 text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border" style={{ background: `${COLORS.PRINTEMPS}20`, borderColor: `${COLORS.PRINTEMPS}30` }}>
                <BadgeCheck size={22} style={{ color: COLORS.NATURE }} />
              </div>
              <p className="text-sm font-bold">{safeT('vet_all_healthy', pageTexts)}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {vetStats?.sickAnimalsList?.slice(0, 5).map((animal: any) => (
                <div key={animal.id} className="flex items-center justify-between p-3.5 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100/50 dark:border-red-900/30 transition-all duration-300 hover:scale-[1.01]">
                  <div>
                    <p className="font-bold text-[#29453E] dark:text-white text-sm tracking-tight">{animal.numero}</p>
                    <p className="text-[11px] font-semibold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-0.5">{animal.type} • {animal.race}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">{safeT('vet_sick', pageTexts)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30">
          <h3 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight mb-4">{safeT('vet_recent_treatments', pageTexts)}</h3>
          {vetStats?.recentTreatmentsList?.length === 0 ? (
            <div className="text-center py-10 text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border" style={{ background: `${COLORS.PRINTEMPS}20`, borderColor: `${COLORS.PRINTEMPS}30` }}>
                <Stethoscope size={20} style={{ color: COLORS.NATURE }} />
              </div>
              <p className="text-sm font-bold">{safeT('vet_no_treatments', pageTexts)}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {vetStats?.recentTreatmentsList?.slice(0, 5).map((t: any) => (
                <div key={t.id} className="p-3.5 rounded-xl border transition-all duration-300 hover:scale-[1.01] flex flex-col gap-1" style={{ background: `${COLORS.DOUCEUR}15`, borderColor: `${COLORS.DOUCEUR}30` }}>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#29453E] dark:text-white text-sm tracking-tight">{t.medicament}</p>
                    <span className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <p className="text-xs text-[#3C6C5F]/75 dark:text-[#9DAE7A]/75 font-medium mt-0.5 leading-relaxed">{t.description}</p>
                  <p className="text-[10px] font-bold text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50 mt-1 border-t border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20 pt-1">
                    {safeT('vet_animal_care', pageTexts)}: {t.animal.numero} ({t.animal.type})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD AGRICULTEUR AVEC AGROMONITORING
// ============================================

function AppAgriDashboard({ 
  agriStats, weatherData, weatherLoading, weatherError, 
  exportPDF, loading, success, error, period, setPeriod,
  t, pageTexts 
}: any) {
  const getActivityData = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const total = (agriStats?.totalAnimaux || 0) + (agriStats?.totalCultures || 0);
    return days.map((day, index) => ({
      label: day,
      value: Math.floor(total * (0.1 + (index % 3) * 0.1))
    }));
  };

  const getProductionData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const total = (agriStats?.totalCultures || 0) * 2 + (agriStats?.totalAnimaux || 0);
    return months.map((month, index) => ({
      label: month,
      value: Math.floor(total * (0.3 + (index / 12)))
    }));
  };

  const activityData = getActivityData();
  const productionData = getProductionData();

  const totalFermes = agriStats?.totalFermes || 0;
  const totalTerrains = agriStats?.totalTerrains || 0;
  const totalAnimaux = agriStats?.totalAnimaux || 0;
  const totalCultures = agriStats?.totalCultures || 0;
  const trend = totalFermes > 0 ? '+15%' : '0%';

  // Récupérer les fermes et terrains depuis agriStats
  const fermes = agriStats?.fermes || [];
  const terrains = agriStats?.terrains || [];

  const handleRefresh = () => window.location.reload();

  return (
    <div className="min-h-screen p-4 md:p-6 transition-colors duration-500" style={{ background: `linear-gradient(135deg, ${COLORS.SOLEIL}40, ${COLORS.PRINTEMPS}20)` }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#29453E] dark:text-white tracking-tight">{t('dashboard_agri_title', pageTexts)}</h1>
          <p className="text-xs md:text-sm text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 font-medium mt-1">{t('dashboard_agri_subtitle', pageTexts)}</p>
        </div>
        <HeaderActions
          onExport={() => exportPDF(period)}
          onRefresh={handleRefresh}
          loading={loading}
          period={period}
          setPeriod={setPeriod}
          showAddButton={false}
        />
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl text-[#29453E] dark:text-white text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300" style={{ background: `${COLORS.PRINTEMPS}30`, border: `1px solid ${COLORS.PRINTEMPS}50` }}>
          <CheckCircle2 size={16} style={{ color: COLORS.NATURE }} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
        <div className="lg:col-span-1">
          <AppWeather weatherData={weatherData} loading={weatherLoading} error={weatherError} />
        </div>
        <div className="lg:col-span-3">
          <AppStats stats={{ total: totalAnimaux + totalCultures, active: totalAnimaux, new: totalTerrains, trend: trend }} t={t} pageTexts={pageTexts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AppChart data={activityData} title={t('agri_activity', pageTexts)} subtitle={t('agri_activity_sub', pageTexts)} />
        <AppChart data={productionData} title={t('agri_production', pageTexts)} subtitle={t('agri_production_sub', pageTexts)} />
      </div>

      {/* Dashboard Agromonitoring avec les fermes réelles */}
      <div className="mb-8">
        <AgriDashboardWithAgromonitoring
          agriStats={agriStats}
          t={t}
          pageTexts={pageTexts}
          fermes={fermes}
          terrains={terrains}
        />
      </div>

      {/* Statistiques des fermes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(60,108,95,0.15)] group-hover:scale-105 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${COLORS.NATURE}, ${COLORS.JOIE_DE_VIVRE})` }}>
            <Building2 size={20} className="text-white" />
          </div>
          <p className="text-2xl font-black text-[#29453E] dark:text-white tracking-tight">{totalFermes}</p>
          <p className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-widest mt-1">{t('agri_farms', pageTexts)}</p>
        </div>
        
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(60,108,95,0.15)] group-hover:scale-105 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${COLORS.PRINTEMPS}, ${COLORS.NATURE})` }}>
            <TreePine size={20} className="text-white" />
          </div>
          <p className="text-2xl font-black text-[#29453E] dark:text-white tracking-tight">{totalTerrains}</p>
          <p className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-widest mt-1">{t('agri_lands', pageTexts)}</p>
        </div>
        
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(60,108,95,0.15)] group-hover:scale-105 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${COLORS.DOUCEUR}, ${COLORS.SOLEIL})` }}>
            <Beef size={20} className="text-white" />
          </div>
          <p className="text-2xl font-black text-[#29453E] dark:text-white tracking-tight">{totalAnimaux}</p>
          <p className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-widest mt-1">{t('agri_animals', pageTexts)}</p>
        </div>
        
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(60,108,95,0.15)] group-hover:scale-105 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${COLORS.PRINTEMPS}, ${COLORS.DOUCEUR})` }}>
            <Sprout size={20} className="text-white" />
          </div>
          <p className="text-2xl font-black text-[#29453E] dark:text-white tracking-tight">{totalCultures}</p>
          <p className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-widest mt-1">{t('agri_crops', pageTexts)}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD EMPLOYÉ
// ============================================
// ============================================
// DASHBOARD EMPLOYÉ - CORRIGÉ
// ============================================

// ============================================
// DASHBOARD EMPLOYÉ - CORRIGÉ AVEC STATISTIQUES
// ============================================

function EmployeeDashboardWithTranslation({ 
  employeInfo,
  currentUser,
  t,
  pageTexts
}: { 
  employeInfo: any;
  currentUser: User;
  t: (key: string, texts: Record<string, string>) => string;
  pageTexts: Record<string, string>;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'all' | 'month'>('all');

  // === RÉCUPÉRATION DES DONNÉES AVEC FALLBACKS ===
  const terrains = employeInfo?.terrains || (employeInfo?.terrainAssigne ? [employeInfo.terrainAssigne] : []);
  const terrainsAssignes = employeInfo?.terrainsAssignes || (employeInfo?.terrainAssigne ? [employeInfo.terrainAssigne] : []);
  const animaux = employeInfo?.animaux || (employeInfo?.animauxAssignes ? employeInfo.animauxAssignes.map((aa: any) => aa.animal) : []);
  const cultures = employeInfo?.cultures || (employeInfo?.culturesAssignees ? employeInfo.culturesAssignees.map((ca: any) => ca.culture) : []);

  // === STATISTIQUES ANIMAUX ===
  // Compter les animaux malades et sains
  const animauxMalades = animaux.filter((a: any) => 
    a.etatSante?.toLowerCase() === 'malade' || 
    a.etatSante?.toLowerCase() === 'en traitement' ||
    a.etatSante?.toLowerCase() === 'critique'
  ).length;

  const animauxSains = animaux.filter((a: any) => 
    a.etatSante?.toLowerCase() === 'sain' || 
    a.etatSante?.toLowerCase() === 'bonne santé' ||
    a.etatSante?.toLowerCase() === 'en bonne santé' ||
    !a.etatSante // Si pas d'état, considéré comme sain par défaut
  ).length;

  // Si l'état n'est pas défini, on considère comme "Non défini"
  const animauxNonDefinis = animaux.filter((a: any) => 
    !a.etatSante || a.etatSante?.trim() === ''
  ).length;

  // === STATISTIQUES CULTURES ===
  const culturesActives = cultures.filter((c: any) => 
    c.etat?.toLowerCase() === 'active' || 
    c.etat?.toLowerCase() === 'en croissance' ||
    c.etat?.toLowerCase() === 'bonne' ||
    c.etat?.toLowerCase() === 'excellente'
  ).length;

  const culturesEnDanger = cultures.filter((c: any) => 
    c.etat?.toLowerCase() === 'en danger' || 
    c.etat?.toLowerCase() === 'critique' ||
    c.etat?.toLowerCase() === 'mauvaise'
  ).length;

  const culturesTerminees = cultures.filter((c: any) => 
    c.etat?.toLowerCase() === 'terminée' || 
    c.etat?.toLowerCase() === 'récoltée' ||
    c.etat?.toLowerCase() === 'finie'
  ).length;

  // === STATISTIQUES GÉNÉRALES ===
  const totalTerrains = terrains.length;
  const totalAnimaux = animaux.length;
  const totalCultures = cultures.length;
  const totalAssignes = terrainsAssignes.length;

  const stats = {
    total: totalTerrains + totalAnimaux + totalCultures,
    active: totalAnimaux + totalCultures,
    new: totalAssignes,
    trend: totalTerrains > 0 ? "+12%" : "0%",
  };

  // === DONNÉES POUR LES GRAPHIQUES ===
  const getWeeklyData = () => {
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const total = totalAnimaux + totalCultures + totalTerrains;
    return days.map((day, index) => ({
      label: day,
      value: total > 0 ? Math.floor(total * (0.05 + (index % 3) * 0.1)) : 0,
    }));
  };

  const getMonthlyData = () => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
    const total = totalAnimaux + totalCultures;
    return months.map((month, index) => ({
      label: month,
      value: total > 0 ? Math.floor(total * (0.3 + index / 12)) : 0,
    }));
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();

  // === MÉTÉO ===
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = "0fbf83700b09f6c038cb29dac628ff2a";
      const city = "Hammamet";
      
      try {
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;
        const currentResponse = await fetch(currentUrl);
        if (!currentResponse.ok) throw new Error(`Erreur météo: ${currentResponse.status}`);
        const currentData = await currentResponse.json();

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`;
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) throw new Error(`Erreur prévisions: ${forecastResponse.status}`);
        const forecastData = await forecastResponse.json();

        const dailyForecasts: WeatherData['daily'] = [];
        for (let i = 0; i < forecastData.list.length; i += 8) {
          if (i + 7 < forecastData.list.length) {
            const dayData = forecastData.list.slice(i, i + 8);
            const temps = dayData.map((item: any) => item.main.temp);
            dailyForecasts.push({
              dt: dayData[0].dt,
              temp: {
                day: temps.reduce((a: number, b: number) => a + b, 0) / temps.length,
                min: Math.min(...temps),
                max: Math.max(...temps)
              },
              weather: dayData[0].weather
            });
          }
        }

        setWeatherData({
          current: {
            temp: currentData.main.temp,
            feels_like: currentData.main.feels_like,
            humidity: currentData.main.humidity,
            wind_speed: currentData.wind.speed,
            weather: currentData.weather,
          },
          daily: dailyForecasts.slice(0, 5)
        });
        
      } catch (err) {
        console.error("Erreur météo:", err);
        setWeatherError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // === EXPORT PDF ===
  const exportPDF = async (selectedPeriod: 'all' | 'month' = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/export-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          role: currentUser.role,
          period: selectedPeriod,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          if (errorText.includes('<!DOCTYPE')) {
            errorMessage = 'L\'API n\'est pas accessible. Vérifiez que le serveur est en cours d\'exécution.';
          } else if (errorText) {
            errorMessage = errorText.substring(0, 100);
          }
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/pdf')) {
        const text = await response.text();
        throw new Error(`Le serveur n'a pas renvoyé un PDF valide: ${text.substring(0, 100)}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Le PDF généré est vide');

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${currentUser.role}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Dashboard exporté avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => window.location.reload();

  // === RENDU PRINCIPAL ===
  return (
    <div className="min-h-screen p-4 md:p-6 transition-colors duration-500" style={{ background: `linear-gradient(135deg, ${COLORS.SOLEIL}40, ${COLORS.PRINTEMPS}20)` }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#29453E] dark:text-white tracking-tight">
            {t('dashboard_employee_title', pageTexts)}
          </h1>
          <p className="text-xs md:text-sm text-[#3C6C5F]/70 dark:text-[#9DAE7A]/60 font-medium mt-1">
            {t('dashboard_employee_subtitle', pageTexts)}
          </p>
          <p className="text-xs text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50 mt-1">
            👤 {currentUser.prenom} {currentUser.nom} • {currentUser.email}
          </p>
        </div>
        <HeaderActions
          onExport={() => exportPDF(period)}
          onRefresh={handleRefresh}
          loading={loading}
          period={period}
          setPeriod={setPeriod}
          showAddButton={false}
        />
      </div>

      {/* Messages de succès/erreur */}
      {success && (
        <div className="mb-6 p-4 rounded-2xl text-[#29453E] dark:text-white text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300" style={{ background: `${COLORS.PRINTEMPS}30`, border: `1px solid ${COLORS.PRINTEMPS}50` }}>
          <CheckCircle2 size={16} style={{ color: COLORS.NATURE }} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
        <div className="lg:col-span-1">
          <AppWeather weatherData={weatherData} loading={weatherLoading} error={weatherError} />
        </div>
        <div className="lg:col-span-3">
          <AppStats stats={stats} t={t} pageTexts={pageTexts} />
        </div>
      </div>

      {/* NOUVEAU : Statistiques détaillées des animaux et cultures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Statistiques Animaux */}
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30">
          <h3 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight mb-4 flex items-center gap-2">
            <Beef size={20} className="text-[#3C6C5F]" />
            {t('health_herd', pageTexts)}
            <span className="ml-auto text-xs bg-[#FFF3DA] dark:bg-[#29453E]/30 px-2 py-0.5 rounded-full">
              {totalAnimaux} {t('stats_total', pageTexts).toLowerCase()}
            </span>
          </h3>
          
          {totalAnimaux === 0 ? (
            <div className="text-center py-6 text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50">
              <Beef size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">{t('no_animals', pageTexts)}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Animaux Sains */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#9DAE7A]/10 dark:bg-[#9DAE7A]/5 border border-[#9DAE7A]/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#9DAE7A]/20">
                    <CheckCircle2 size={18} className="text-[#3C6C5F]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#29453E] dark:text-white text-sm">{t('healthy', pageTexts)}</p>
                    <p className="text-[10px] text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{t('in_good_health', pageTexts)}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-[#3C6C5F]">{animauxSains}</span>
              </div>

              {/* Animaux Malades */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/40">
                    <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-red-700 dark:text-red-400 text-sm">{t('sick_in_treatment', pageTexts)}</p>
                    <p className="text-[10px] text-red-500/70 dark:text-red-400/60">{t('need_attention', pageTexts)}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-red-600 dark:text-red-400">{animauxMalades}</span>
              </div>

              {/* Animaux sans état */}
              {animauxNonDefinis > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200/50 dark:border-yellow-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/40">
                      <AlertTriangle size={18} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">{t('state_undefined', pageTexts)}</p>
                      <p className="text-[10px] text-yellow-500/70 dark:text-yellow-400/60">{t('update_state', pageTexts)}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{animauxNonDefinis}</span>
                </div>
              )}

              {/* Pourcentage de santé */}
              <div className="mt-3 pt-3 border-t border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20">
                <div className="flex justify-between text-xs font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70">
                  <span>{t('health_rate', pageTexts)}</span>
                  <span>{totalAnimaux > 0 ? Math.round((animauxSains / totalAnimaux) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-[#FFF3DA] dark:bg-[#29453E]/30 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${totalAnimaux > 0 ? (animauxSains / totalAnimaux) * 100 : 0}%`,
                      background: `linear-gradient(90deg, ${COLORS.NATURE}, ${COLORS.PRINTEMPS})`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistiques Cultures */}
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30">
          <h3 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight mb-4 flex items-center gap-2">
            <Sprout size={20} className="text-[#3C6C5F]" />
            {t('crop_state', pageTexts)}
            <span className="ml-auto text-xs bg-[#FFF3DA] dark:bg-[#29453E]/30 px-2 py-0.5 rounded-full">
              {totalCultures} {t('stats_total', pageTexts).toLowerCase()}
            </span>
          </h3>
          
          {totalCultures === 0 ? (
            <div className="text-center py-6 text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50">
              <Sprout size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">{t('no_crops', pageTexts)}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cultures Actives */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#9DAE7A]/10 dark:bg-[#9DAE7A]/5 border border-[#9DAE7A]/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#9DAE7A]/20">
                    <Sprout size={18} className="text-[#3C6C5F]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#29453E] dark:text-white text-sm">{t('active_growing', pageTexts)}</p>
                    <p className="text-[10px] text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{t('good_state', pageTexts)}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-[#3C6C5F]">{culturesActives}</span>
              </div>

              {/* Cultures en Danger */}
              {culturesEnDanger > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-900/40">
                      <AlertTriangle size={18} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">{t('in_danger_sick', pageTexts)}</p>
                      <p className="text-[10px] text-orange-500/70 dark:text-orange-400/60">{t('need_intervention', pageTexts)}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{culturesEnDanger}</span>
                </div>
              )}

              {/* Cultures Terminées */}
              {culturesTerminees > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/40">
                      <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-blue-700 dark:text-blue-400 text-sm">Terminées / Récoltées</p>
                      <p className="text-[10px] text-blue-500/70 dark:text-blue-400/60">Cycle terminé</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{culturesTerminees}</span>
                </div>
              )}

              {/* Taux de succès des cultures */}
              <div className="mt-3 pt-3 border-t border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20">
                <div className="flex justify-between text-xs font-bold text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70">
                  <span>Taux de réussite</span>
                  <span>{totalCultures > 0 ? Math.round(((culturesActives + culturesTerminees) / totalCultures) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-[#FFF3DA] dark:bg-[#29453E]/30 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${totalCultures > 0 ? ((culturesActives + culturesTerminees) / totalCultures) * 100 : 0}%`,
                      background: `linear-gradient(90deg, ${COLORS.NATURE}, ${COLORS.PRINTEMPS})`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AppChart data={weeklyData} title={t('weekly_activity', pageTexts)} subtitle={t('weekly_activity_sub', pageTexts)} />
        <AppChart data={monthlyData} title={t('monthly_evolution', pageTexts)} subtitle={t('monthly_evolution_sub', pageTexts)} />
      </div>

      {/* Liste des terrains, animaux et cultures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Terrains */}
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30">
          <h3 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight mb-4 flex items-center gap-2">
            <TreePine size={18} className="text-[#3C6C5F]" />
            {t('employee_lands', pageTexts)}
            <span className="ml-auto text-xs bg-[#FFF3DA] dark:bg-[#29453E]/30 px-2 py-0.5 rounded-full">
              {totalTerrains}
            </span>
          </h3>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {terrains.length === 0 ? (
              <div className="text-center py-8 text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50">
                <TreePine size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">{t('employee_no_lands', pageTexts)}</p>
              </div>
            ) : (
              terrains.map((terrain: any) => (
                <div key={terrain.id} className="rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20 bg-[#FAFAFA] dark:bg-[#0d1a15] p-4 hover:shadow-md transition-all duration-300">
                  <div className="font-bold text-sm text-[#29453E] dark:text-white tracking-tight">{terrain.nom}</div>
                  <div className="text-[11px] font-semibold text-[#3C6C5F]/75 dark:text-[#9DAE7A]/60 mt-2 flex items-center gap-1">
                    <MapPin size={11} className="text-[#3C6C5F]/50" />
                    <span>{terrain.localisation || "Non spécifiée"}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#3C6C5F]/75 dark:text-[#9DAE7A]/60 mt-1">
                    Ferme: <span className="font-bold">{terrain.ferme?.nom || "Non assignée"}</span>
                  </div>
                  <div className="text-[10px] font-bold text-[#3C6C5F] dark:text-[#9DAE7A] mt-3 pt-2.5 border-t border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20 flex gap-3">
                    <span>{terrain.animaux?.length ?? 0} {t('agri_animals', pageTexts)}</span>
                    <span>•</span>
                    <span>{terrain.cultures?.length ?? 0} {t('agri_crops', pageTexts)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Animaux */}
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30">
          <h3 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight mb-4 flex items-center gap-2">
            <Beef size={18} className="text-[#3C6C5F]" />
            {t('employee_animals', pageTexts)}
            <span className="ml-auto text-xs bg-[#FFF3DA] dark:bg-[#29453E]/30 px-2 py-0.5 rounded-full">
              {totalAnimaux}
            </span>
          </h3>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {animaux.length === 0 ? (
              <div className="text-center py-8 text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50">
                <Beef size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">{t('employee_no_animals', pageTexts)}</p>
              </div>
            ) : (
              animaux.map((animal: any) => {
                const estMalade = animal.etatSante?.toLowerCase() === 'malade' || 
                                  animal.etatSante?.toLowerCase() === 'en traitement' ||
                                  animal.etatSante?.toLowerCase() === 'critique';
                const estSain = animal.etatSante?.toLowerCase() === 'sain' || 
                                animal.etatSante?.toLowerCase() === 'bonne santé' ||
                                animal.etatSante?.toLowerCase() === 'en bonne santé';
                
                return (
                  <div key={animal.id} className="rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20 bg-[#FAFAFA] dark:bg-[#0d1a15] p-4 hover:shadow-md transition-all duration-300 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-[#29453E] dark:text-white tracking-tight">
                        {animal.numero}
                      </div>
                      <div className="text-[11px] font-semibold text-[#3C6C5F]/75 dark:text-[#9DAE7A]/60 mt-1">
                        {animal.type} • Terrain: <span className="font-bold">{animal.terrain?.nom || "Non assigné"}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wide uppercase border ${
                      estMalade ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200/40' :
                      estSain ? 'bg-[#9DAE7A]/20 text-[#3C6C5F] dark:bg-[#9DAE7A]/10 dark:text-[#9DAE7A] border-[#9DAE7A]/30' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border-yellow-200/40'
                    }`}>
                      {animal.etatSante || "Non défini"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cultures */}
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30">
          <h3 className="font-extrabold text-[#29453E] dark:text-white text-base tracking-tight mb-4 flex items-center gap-2">
            <Sprout size={18} className="text-[#3C6C5F]" />
            {t('employee_crops', pageTexts)}
            <span className="ml-auto text-xs bg-[#FFF3DA] dark:bg-[#29453E]/30 px-2 py-0.5 rounded-full">
              {totalCultures}
            </span>
          </h3>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {cultures.length === 0 ? (
              <div className="text-center py-8 text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50">
                <Sprout size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">{t('employee_no_crops', pageTexts)}</p>
              </div>
            ) : (
              cultures.map((culture: any) => {
                const estActive = culture.etat?.toLowerCase() === 'active' || 
                                 culture.etat?.toLowerCase() === 'en croissance' ||
                                 culture.etat?.toLowerCase() === 'bonne' ||
                                 culture.etat?.toLowerCase() === 'excellente';
                const estTerminee = culture.etat?.toLowerCase() === 'terminée' || 
                                   culture.etat?.toLowerCase() === 'récoltée' ||
                                   culture.etat?.toLowerCase() === 'finie';
                const estEnDanger = culture.etat?.toLowerCase() === 'en danger' || 
                                   culture.etat?.toLowerCase() === 'critique' ||
                                   culture.etat?.toLowerCase() === 'mauvaise';
                
                return (
                  <div key={culture.id} className="rounded-xl border border-[#FFF3DA]/50 dark:border-[#3C6C5F]/20 bg-[#FAFAFA] dark:bg-[#0d1a15] p-4 hover:shadow-md transition-all duration-300 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-[#29453E] dark:text-white tracking-tight">
                        {culture.nom}
                      </div>
                      <div className="text-[11px] font-semibold text-[#3C6C5F]/75 dark:text-[#9DAE7A]/60 mt-1">
                        Terrain: <span className="font-bold">{culture.terrain?.nom || "Non assigné"}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wide uppercase border ${
                      estActive ? 'bg-[#9DAE7A]/20 text-[#3C6C5F] dark:bg-[#9DAE7A]/10 dark:text-[#9DAE7A] border-[#9DAE7A]/30' :
                      estTerminee ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/40' :
                      estEnDanger ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200/40' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300 border-gray-200/40'
                    }`}>
                      {culture.etat || "Non défini"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Statistiques rapides améliorées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(60,108,95,0.15)] group-hover:scale-105 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${COLORS.NATURE}, ${COLORS.JOIE_DE_VIVRE})` }}>
            <TreePine size={20} className="text-white" />
          </div>
          <p className="text-2xl font-black text-[#29453E] dark:text-white tracking-tight">{totalTerrains}</p>
          <p className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-widest mt-1">{t('agri_lands', pageTexts)}</p>
        </div>
        
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(60,108,95,0.15)] group-hover:scale-105 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${COLORS.PRINTEMPS}, ${COLORS.NATURE})` }}>
            <Beef size={20} className="text-white" />
          </div>
          <p className="text-2xl font-black text-[#29453E] dark:text-white tracking-tight">{totalAnimaux}</p>
          <p className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-widest mt-1">{t('agri_animals', pageTexts)}</p>
          <p className="text-[8px] font-bold mt-0.5 text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40">
            {animauxSains} sains • {animauxMalades} malades
          </p>
        </div>
        
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(60,108,95,0.15)] group-hover:scale-105 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${COLORS.DOUCEUR}, ${COLORS.SOLEIL})` }}>
            <Sprout size={20} className="text-white" />
          </div>
          <p className="text-2xl font-black text-[#29453E] dark:text-white tracking-tight">{totalCultures}</p>
          <p className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-widest mt-1">{t('agri_crops', pageTexts)}</p>
          <p className="text-[8px] font-bold mt-0.5 text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40">
            {culturesActives} actives • {culturesTerminees} terminées
          </p>
        </div>
        
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFF3DA]/40 dark:border-[#3C6C5F]/30 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#FFC490] dark:hover:border-[#FFC490]/50 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(60,108,95,0.15)] group-hover:scale-105 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${COLORS.PRINTEMPS}, ${COLORS.DOUCEUR})` }}>
            <Building2 size={20} className="text-white" />
          </div>
          <p className="text-2xl font-black text-[#29453E] dark:text-white tracking-tight">{totalAssignes}</p>
          <p className="text-[10px] font-bold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-widest mt-1">{t('employee_assigned_lands', pageTexts)}</p>
        </div>
      </div>
    </div>
  );
}


// ============================================
// COMPOSANT PRINCIPAL EXPORTÉ
// ============================================

export default function DashboardView({
  initialUsers,
  initialConnectedUserIndex = 0,
  employeInfo,
  vetStats,
  agriStats,
  employeeStats,
}: DashboardViewProps) {
  const { language, t, translateAllTexts } = useTranslation();

  const pageTexts = useMemo(() => ({
    dashboard_admin_title: "Dashboard Admin",
    dashboard_admin_subtitle: "Gestion globale et supervision du système agricole",
    dashboard_vet_title: "Dashboard Vétérinaire",
    dashboard_vet_subtitle: "Suivi de la santé du bétail et historique des soins médicaux",
    dashboard_agri_title: "Dashboard Agriculteur",
    dashboard_agri_subtitle: "Suivi en temps réel des performances et gestion des ressources agricoles",
    dashboard_employee_title: "Dashboard Employé",
    dashboard_employee_subtitle: "Suivi des terrains, animaux et cultures liés à votre ferme",
    stats_total: "Total",
    stats_active: "Actifs",
    stats_new: "Nouveaux",
    stats_trend: "Tendance",
    weekly_activity: "Activité hebdomadaire",
    weekly_activity_sub: "Inscriptions des utilisateurs",
    monthly_evolution: "Évolution mensuelle",
    monthly_evolution_sub: "Nombre d'utilisateurs",
    role_distribution: "Répartition par rôle",
    role_distribution_sub: "Distribution des utilisateurs",
    key_indicators: "Indicateurs clés",
    key_indicators_sub: "Statistiques générales du système",
    registered_users: "Utilisateurs enregistrés",
    accounts_registered: "comptes enregistrés",
    search_user: "Rechercher un utilisateur...",
    user: "Utilisateur",
    email: "Email",
    role: "Rôle",
    actions: "Actions",
    delete_user: "Supprimer l'utilisateur",
    add_user: "Ajouter un utilisateur",
    first_name: "Prénom",
    last_name: "Nom",
    password: "Mot de passe",
    phone_optional: "Téléphone (Optionnel)",
    cancel: "Annuler",
    saving: "Enregistrement...",
    create_account: "Créer le compte",
    delete_confirmation: "Voulez-vous vraiment supprimer cet utilisateur ?",
    error_occurred: "Une erreur est survenue",
    role_admin: "Administrateur",
    role_agriculteur: "Agriculteur",
    role_employe: "Employé",
    role_veterinaire: "Vétérinaire",
    vet_consultations: "Consultations par jour",
    vet_consultations_sub: "Nombre de traitements administrés",
    vet_care_evolution: "Évolution des soins",
    vet_care_evolution_sub: "Traitements mensuels cumulés",
    vet_monitored_animals: "Animaux sous surveillance",
    vet_all_healthy: "Tous les animaux sont en bonne santé !",
    vet_sick: "Malade",
    vet_recent_treatments: "Traitements récents",
    vet_no_treatments: "Aucun traitement enregistré récemment.",
    vet_animal_care: "Animal en soins",
    vet_new_treatment: "Nouveau traitement",
    vet_treatment: "Traitement",
    agri_activity: "Activité agricole",
    agri_activity_sub: "Performance des activités par jour",
    agri_production: "Production mensuelle",
    agri_production_sub: "Évolution globale des cultures et cheptels",
    agri_farms: "Fermes",
    agri_lands: "Terrains",
    agri_animals: "Animaux",
    agri_crops: "Cultures",
    employee_lands: "Mes terrains",
    employee_no_lands: "Aucun terrain assigné.",
    employee_animals: "Animaux liés",
    employee_no_animals: "Aucun animal lié à vos terrains.",
    employee_crops: "Cultures liées",
    employee_no_crops: "Aucune culture liée à vos terrains.",
    employee_assigned_lands: "Terrains assignés",
    all: "Tous",
    month: "30 jours",
    download_report: "Télécharger le rapport PDF",
    refresh: "Rafraîchir",
    ia_image: "IA Image",
    new: "New",
    weather_unavailable: "Météo indisponible",
    weather_data_unavailable: "Données non disponibles",
    feels_like: "Ressenti",
    no_data: "Aucune donnée disponible",
    health_herd: "Santé du cheptel",
    no_animals: "Aucun animal lié à vos terrains.",
    healthy: "Sains",
    in_good_health: "En bonne santé",
    sick_in_treatment: "Malades / En traitement",
    need_attention: "Nécessitent une attention",
    state_undefined: "État non défini",
    update_state: "Mettre à jour l'état",
    health_rate: "Taux de santé",
    crop_state: "État des cultures",
    no_crops: "Aucune culture liée à vos terrains.",
    active_growing: "Actives / En croissance",
    good_state: "Bon état",
    in_danger_sick: "En danger / Malades",
    need_intervention: "Nécessitent une intervention",
  }), []);

  useEffect(() => {
    let isMounted = true;
    const doTranslation = async () => {
      if (isMounted && language !== 'fr') {
        await translateAllTexts(pageTexts, language);
      } else if (isMounted && language === 'fr') {
        await translateAllTexts(pageTexts, 'fr');
      }
    };
    doTranslation();
    return () => { isMounted = false; };
  }, [language]);

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState<'all' | 'month'>('all');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedUserIndex] = useState(initialConnectedUserIndex);
  const connectedUser = users[connectedUserIndex] || {
    id: 0,
    nom: "",
    prenom: "",
    role: Role.ADMIN,
    email: "",
  };

  const exportPDF = async (selectedPeriod: 'all' | 'month' = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/export-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: connectedUser.id,
          role: connectedUser.role,
          period: selectedPeriod,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          if (errorText.includes('<!DOCTYPE')) {
            errorMessage = 'L\'API n\'est pas accessible. Vérifiez que le serveur est en cours d\'exécution.';
          } else if (errorText) {
            errorMessage = errorText.substring(0, 100);
          }
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/pdf')) {
        const text = await response.text();
        throw new Error(`Le serveur n'a pas renvoyé un PDF valide: ${text.substring(0, 100)}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Le PDF généré est vide');

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${connectedUser.role}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('📥 Dashboard exporté avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState<Role>(Role.EMPLOYE);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = "0fbf83700b09f6c038cb29dac628ff2a";
      const city = "Hammamet";
      
      try {
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;
        const currentResponse = await fetch(currentUrl);
        if (!currentResponse.ok) throw new Error(`Erreur météo: ${currentResponse.status}`);
        const currentData = await currentResponse.json();

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`;
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) throw new Error(`Erreur prévisions: ${forecastResponse.status}`);
        const forecastData = await forecastResponse.json();

        const dailyForecasts: WeatherData['daily'] = [];
        for (let i = 0; i < forecastData.list.length; i += 8) {
          if (i + 7 < forecastData.list.length) {
            const dayData = forecastData.list.slice(i, i + 8);
            const temps = dayData.map((item: any) => item.main.temp);
            dailyForecasts.push({
              dt: dayData[0].dt,
              temp: {
                day: temps.reduce((a: number, b: number) => a + b, 0) / temps.length,
                min: Math.min(...temps),
                max: Math.max(...temps)
              },
              weather: dayData[0].weather
            });
          }
        }

        setWeatherData({
          current: {
            temp: currentData.main.temp,
            feels_like: currentData.main.feels_like,
            humidity: currentData.main.humidity,
            wind_speed: currentData.wind.speed,
            weather: currentData.weather,
          },
          daily: dailyForecasts.slice(0, 5)
        });
        
      } catch (err) {
        console.error("Erreur météo:", err);
        setWeatherError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.prenom} ${u.nom}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDeleteUser = async (id: number) => {
    if (!confirm(t('delete_confirmation', pageTexts))) return;

    const result = await deleteUtilisateurAction(id);
    if (result.success) {
      setUsers(users.filter((u) => u.id !== id));
    } else {
      alert(result.error || t('error_occurred', pageTexts));
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage(null);

    const response = await addUtilisateurAction({
      nom,
      prenom,
      email,
      motDePasse,
      telephone: telephone || undefined,
      role,
    });

    setModalLoading(false);

    if (response.success && response.data) {
      setUsers([response.data, ...users]);
      setNom("");
      setPrenom("");
      setEmail("");
      setMotDePasse("");
      setTelephone("");
      setRole(Role.EMPLOYE);
      setIsModalOpen(false);
    } else {
      setModalMessage(response.error || t('error_occurred', pageTexts));
    }
  };

  if (connectedUser.role === Role.ADMIN) {
    return (
      <AppAdminDashboard 
        users={users}
        filteredUsers={filteredUsers}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleDeleteUser={handleDeleteUser}
        weatherData={weatherData}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleAddUserSubmit={handleAddUserSubmit}
        nom={nom}
        setNom={setNom}
        prenom={prenom}
        setPrenom={setPrenom}
        email={email}
        setEmail={setEmail}
        motDePasse={motDePasse}
        setMotDePasse={setMotDePasse}
        telephone={telephone}
        setTelephone={setTelephone}
        role={role}
        setRole={setRole}
        modalLoading={modalLoading}
        modalMessage={modalMessage}
        exportPDF={exportPDF}
        loading={loading}
        success={success}
        error={error}
        period={period}
        setPeriod={setPeriod}
        t={t}
        pageTexts={pageTexts}
      />
    );
  }

  if (connectedUser.role === Role.VETERINAIRE) {
    return (
      <AppVetDashboard 
        vetStats={vetStats}
        weatherData={weatherData}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        exportPDF={exportPDF}
        loading={loading}
        success={success}
        error={error}
        period={period}
        setPeriod={setPeriod}
        t={t}
        pageTexts={pageTexts}
      />
    );
  }

  if (connectedUser.role === Role.AGRICULTEUR) {
    return (
      <AppAgriDashboard 
        agriStats={agriStats}
        weatherData={weatherData}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        exportPDF={exportPDF}
        loading={loading}
        success={success}
        error={error}
        period={period}
        setPeriod={setPeriod}
        t={t}
        pageTexts={pageTexts}
      />
    );
  }

  if (connectedUser.role === Role.EMPLOYE) {
    return (
      <EmployeeDashboardWithTranslation
        employeInfo={employeInfo}
        currentUser={connectedUser}
        t={t}
        pageTexts={pageTexts}
      />
    );
  }

  return (
    <EmployeeDashboardWithTranslation
      employeInfo={employeeStats}
      currentUser={connectedUser}
      t={t}
      pageTexts={pageTexts}
    />
  );
}