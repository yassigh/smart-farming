// components/DashboardView.tsx
"use client";

import { useState, useEffect } from "react";
import { Role } from "@prisma/client";
import { addUtilisateurAction, deleteUtilisateurAction } from "@/actions/utilisateur";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
  Settings,
  PawPrint,
  Stethoscope,
  Activity,
  Warehouse,
  Map,
  Wheat,
  Calendar,
  User,
  HeartPulse,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  Shield,
  UserCircle,
  UserPlus,
  Mail,
  Phone,
  Lock,
  Briefcase,
  Home,
  TreePine,
  Sprout,
  Syringe,
  Pill,
  Dog,
  Store,
  Landmark,
  Building2,
  Flower2,
  Leaf,
  Apple,
  Beef,
  Milk,
  Tractor,
  Droplets,
  Sun,
  Moon,
  Cloud,
  Thermometer,
  Wind,
  Compass,
  Target,
  Award,
  Trophy,
  Star,
  Sparkles,
  Rocket,
  Zap,
  Crown,
  Gem,
  Diamond,
  Medal,
  BadgeCheck,
  Heart,
  Smile,
  Laugh,
  Coffee,
  Music,
  Camera,
  Video,
  Mic,
  Headphones,
  Snowflake,
  Gauge,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudSun,
  CloudMoon,
  Umbrella,
  Waves,
  Filter,
  X,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  RefreshCw,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Types
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
// COMPOSANT STATISTIQUES AVEC PALETTE APP
// ============================================
function AppStats({ stats }: { stats: any; title?: string }) {
  const statItems = [
    { label: 'Total', value: stats?.total || 0, icon: Users, color: 'from-[#3C6C5F] to-[#29453E]' },
    { label: 'Actifs', value: stats?.active || 0, icon: CheckCircle2, color: 'from-[#9DAE7A] to-[#3C6C5F]' },
    { label: 'Nouveaux', value: stats?.new || 0, icon: Sparkles, color: 'from-[#FFC490] to-[#D4A574]' },
    { label: 'Tendance', value: stats?.trend || '+0%', icon: TrendingUp, color: 'from-[#29453E] to-[#3C6C5F]' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div key={index} className="relative overflow-hidden bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FFC490]/20 dark:border-[#FFC490]/10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
              <item.icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 uppercase tracking-wider">{item.label}</p>
              <p className="text-2xl font-bold text-[#29453E] dark:text-white">{item.value}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFC490]/20 to-transparent"></div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// COMPOSANT MÉTÉO AVEC PALETTE APP
// ============================================
function AppWeather({ weatherData, loading, error }: { weatherData: WeatherData | null; loading: boolean; error: string | null }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF3DA] dark:bg-[#2a3f38]"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded w-3/4"></div>
            <div className="h-3 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertTriangle size={20} />
          <div>
            <p className="font-semibold text-sm">Météo indisponible</p>
            <p className="text-xs text-red-500/80">{error || "Données non disponibles"}</p>
          </div>
        </div>
      </div>
    );
  }

  const current = weatherData.current;
  const weatherMain = current.weather[0]?.main || 'clear';
  
  const getWeatherIcon = (main: string) => {
    const iconMap: Record<string, { icon: any; bg: string }> = {
      'clear': { icon: Sun, bg: 'from-yellow-400 to-orange-500' },
      'clouds': { icon: Cloud, bg: 'from-gray-400 to-gray-600' },
      'rain': { icon: CloudRain, bg: 'from-blue-400 to-blue-600' },
      'drizzle': { icon: Droplets, bg: 'from-blue-300 to-blue-500' },
      'thunderstorm': { icon: CloudLightning, bg: 'from-yellow-500 to-purple-600' },
      'snow': { icon: CloudSnow, bg: 'from-blue-200 to-blue-400' },
      'mist': { icon: CloudFog, bg: 'from-gray-300 to-gray-500' },
      'fog': { icon: CloudFog, bg: 'from-gray-300 to-gray-500' },
    };
    return iconMap[main.toLowerCase()] || { icon: Sun, bg: 'from-yellow-400 to-orange-500' };
  };

  const weatherInfo = getWeatherIcon(weatherMain);
  const WeatherIcon = weatherInfo.icon;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#29453E] via-[#3C6C5F] to-[#29453E] rounded-2xl p-6 shadow-xl border border-[#FFC490]/20`}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/10">
                <WeatherIcon size={32} className="text-white" />
              </div>
              <div>
                <span className="text-3xl font-bold">{Math.round(current.temp)}°C</span>
                <p className="text-sm opacity-80 capitalize">{current.weather[0]?.description || 'Météo'}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Hammamet</p>
            <p className="text-xs opacity-70">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <Droplets size={14} className="text-blue-200" />
            <span className="text-sm">{current.humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind size={14} className="text-blue-200" />
            <span className="text-sm">{Math.round(current.wind_speed)} m/s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Thermometer size={14} className="text-orange-200" />
            <span className="text-sm">Ressenti {Math.round(current.feels_like)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT GRAPHIQUE AVEC PALETTE APP
// ============================================
function AppChart({ data, title, subtitle, type = 'bar' }: { 
  data: any[]; 
  title: string; 
  subtitle?: string; 
  type?: 'bar' | 'line';
}) {
  const [chartType, setChartType] = useState<'bar' | 'line'>(type);
  const max = Math.max(...data.map(d => d.value || 0), 1);
  const colors = ['#3C6C5F', '#9DAE7A', '#FFC490', '#29453E', '#D4A574'];

  if (data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-[#29453E] dark:text-white text-lg">{title}</h3>
            {subtitle && <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{subtitle}</p>}
          </div>
        </div>
        <div className="h-56 flex flex-col items-center justify-center text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40">
          <BarChart3 size={40} className="mb-2 opacity-30" />
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-[#29453E] dark:text-white text-lg">{title}</h3>
          {subtitle && <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-lg transition-all ${
              chartType === 'bar' 
                ? 'bg-[#FFF3DA] dark:bg-[#2a3f38] text-[#3C6C5F] dark:text-[#9DAE7A]' 
                : 'text-[#3C6C5F]/40 hover:text-[#3C6C5F] dark:text-[#9DAE7A]/40 dark:hover:text-[#9DAE7A]'
            }`}
          >
            <BarChart3 size={18} />
          </button>
          <button 
            onClick={() => setChartType('line')}
            className={`p-2 rounded-lg transition-all ${
              chartType === 'line' 
                ? 'bg-[#FFF3DA] dark:bg-[#2a3f38] text-[#3C6C5F] dark:text-[#9DAE7A]' 
                : 'text-[#3C6C5F]/40 hover:text-[#3C6C5F] dark:text-[#9DAE7A]/40 dark:hover:text-[#9DAE7A]'
            }`}
          >
            <LineChart size={18} />
          </button>
        </div>
      </div>
      
      <div className="h-56 relative">
        {chartType === 'line' ? (
          <div className="w-full h-full relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points={data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = 100 - (d.value / max) * 85 - 7;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#3C6C5F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-30"
              />
              <polyline
                points={data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = 100 - (d.value / max) * 85 - 7;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#3C6C5F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
              {data.map((d, index) => (
                <span key={index} className="text-[10px] text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium">
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-end gap-2 pb-6">
            {data.map((item, index) => {
              const value = item.value || 0;
              const height = Math.max((value / max) * 100, 4);
              const color = colors[index % colors.length];
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full relative group">
                    <div 
                      className="w-full rounded-lg transition-all duration-500 hover:scale-105 relative"
                      style={{ 
                        height: `${height}%`,
                        minHeight: '4px',
                        background: `linear-gradient(to top, ${color}, ${color}dd)`,
                        boxShadow: '0 2px 8px rgba(60,108,95,0.2)'
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#29453E] dark:bg-[#1a2e28] text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        {value}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD ADMIN AVEC PALETTE APP
// ============================================
function AppAdminDashboard({ 
  users, filteredUsers, searchQuery, setSearchQuery, handleDeleteUser, 
  weatherData, weatherLoading, weatherError,
  isModalOpen, setIsModalOpen, handleAddUserSubmit,
  nom, setNom, prenom, setPrenom, email, setEmail, 
  motDePasse, setMotDePasse, telephone, setTelephone, 
  role, setRole, modalLoading, modalMessage,
  exportPDF, loading, success, error, period, setPeriod
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
      { label: 'Admin', value: users.filter((u: User) => u.role === Role.ADMIN).length },
      { label: 'Agriculteur', value: users.filter((u: User) => u.role === Role.AGRICULTEUR).length },
      { label: 'Vétérinaire', value: users.filter((u: User) => u.role === Role.VETERINAIRE).length },
      { label: 'Employé', value: users.filter((u: User) => u.role === Role.EMPLOYE).length },
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d1a15] p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#29453E] dark:text-white">Dashboard Admin</h1>
          <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Gestion globale du système</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28] text-sm text-[#29453E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]"
          >
            <option value="all">Tous</option>
            <option value="month">30 jours</option>
          </select>
          <button 
            onClick={() => exportPDF(period)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1a2e28] border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed relative"
            title="Télécharger le rapport PDF"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1a2e28] border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all shadow-sm"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <UserPlus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-4 bg-[#DDF3E8] dark:bg-[#2a3f38] border border-[#9DAE7A] dark:border-[#9DAE7A] rounded-2xl text-[#29453E] dark:text-white text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-[#3C6C5F]" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-1">
          <AppWeather weatherData={weatherData} loading={weatherLoading} error={weatherError} />
        </div>
        <div className="lg:col-span-3">
          <AppStats stats={{ total: totalUsers, active: activeUsers, new: newUsers, trend: trend }} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AppChart data={weeklyData} title="Activité hebdomadaire" subtitle="Inscriptions des utilisateurs" />
        <AppChart data={monthlyData} title="Évolution mensuelle" subtitle="Nombre d'utilisateurs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <AppChart data={roleData} title="Répartition par rôle" subtitle="Distribution des utilisateurs" />
        <div className="lg:col-span-2 bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10">
          <h3 className="font-bold text-[#29453E] dark:text-white text-lg mb-4">Indicateurs clés</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-xl">
              <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Total</p>
              <p className="text-2xl font-bold text-[#3C6C5F] dark:text-[#9DAE7A]">{totalUsers}</p>
            </div>
            <div className="p-4 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-xl">
              <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Actifs</p>
              <p className="text-2xl font-bold text-[#3C6C5F] dark:text-[#9DAE7A]">{activeUsers}</p>
            </div>
            <div className="p-4 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-xl">
              <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Nouveaux</p>
              <p className="text-2xl font-bold text-[#FFC490] dark:text-[#D4A574]">{newUsers}</p>
            </div>
            <div className="p-4 bg-[#DDF3E8] dark:bg-[#2a3f38] rounded-xl">
              <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Tendance</p>
              <p className="text-2xl font-bold text-[#29453E] dark:text-white">{trend}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-[#1a2e28] rounded-2xl shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#FFC490]/20 dark:border-[#FFC490]/10 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#29453E] dark:text-white">Utilisateurs enregistrés</h2>
            <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{filteredUsers.length} résultats</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-sm text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/40 dark:placeholder:text-[#9DAE7A]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all w-48"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFF3DA] dark:bg-[#2a3f38] text-[#3C6C5F] dark:text-[#9DAE7A] text-xs font-semibold uppercase">
                <th className="px-6 py-3 text-left">Utilisateur</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Rôle</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="border-t border-[#FFC490]/10 dark:border-[#FFC490]/5 hover:bg-[#FFF3DA]/30 dark:hover:bg-[#2a3f38]/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {user.prenom?.[0]}{user.nom?.[0]}
                      </div>
                      <span className="font-medium text-[#29453E] dark:text-white">{user.prenom} {user.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{user.email}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === Role.ADMIN ? 'bg-[#DDF3E8] dark:bg-[#2a3f38] text-[#29453E] dark:text-[#9DAE7A]' :
                      user.role === Role.AGRICULTEUR ? 'bg-[#DDF3E8] dark:bg-[#2a3f38] text-[#3C6C5F] dark:text-[#9DAE7A]' :
                      user.role === Role.VETERINAIRE ? 'bg-[#FFF3DA] dark:bg-[#2a3f38] text-[#FFC490] dark:text-[#D4A574]' :
                      'bg-[#FAFAFA] dark:bg-[#2a3f38] text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#3C6C5F]/40 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2e28] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#29453E] dark:text-white">Ajouter un utilisateur</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all">
                <X size={20} className="text-[#3C6C5F]/60" />
              </button>
            </div>
            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-sm text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]" required />
                <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-sm text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]" required />
              </div>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-sm text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]" required />
              <input type="password" placeholder="Mot de passe" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-sm text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]" required />
              <input type="tel" placeholder="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-sm text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]" />
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full px-4 py-2.5 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-sm text-[#29453E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]">
                <option value={Role.EMPLOYE}>Employé</option>
                <option value={Role.AGRICULTEUR}>Agriculteur</option>
                <option value={Role.VETERINAIRE}>Vétérinaire</option>
                <option value={Role.ADMIN}>Administrateur</option>
              </select>
              {modalMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {modalMessage}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#29453E] dark:text-white font-semibold hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all">Annuler</button>
                <button type="submit" disabled={modalLoading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold transition-all disabled:opacity-50 shadow-md hover:shadow-lg">
                  {modalLoading ? "Enregistrement..." : "Créer"}
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
// DASHBOARD VÉTÉRINAIRE AVEC PALETTE APP
// ============================================
function AppVetDashboard({ vetStats, weatherData, weatherLoading, weatherError, exportPDF, loading, success, error, period, setPeriod }: any) {
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
  const myTreatments = vetStats?.myTreatmentsCount || 0;
  const trend = totalAnimals > 0 ? `+${Math.round((sickAnimals / totalAnimals) * 100)}%` : '0%';

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d1a15] p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#29453E] dark:text-white">Dashboard Vétérinaire</h1>
          <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Suivi de la santé et des traitements</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28] text-sm text-[#29453E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]"
          >
            <option value="all">Tous</option>
            <option value="month">30 jours</option>
          </select>
          <button 
            onClick={() => exportPDF(period)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1a2e28] border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </button>
          <Link href="/dashboard/traitements/add" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2">
            <Syringe size={18} />
            Nouveau traitement
          </Link>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-4 bg-[#DDF3E8] dark:bg-[#2a3f38] border border-[#9DAE7A] dark:border-[#9DAE7A] rounded-2xl text-[#29453E] dark:text-white text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="text-[#3C6C5F]" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-1">
          <AppWeather weatherData={weatherData} loading={weatherLoading} error={weatherError} />
        </div>
        <div className="lg:col-span-3">
          <AppStats stats={{ total: totalAnimals, active: totalAnimals, new: sickAnimals, trend: trend }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AppChart data={consultationsData} title="Consultations par jour" subtitle="Nombre de traitements" />
        <AppChart data={monthlyTreatments} title="Évolution des soins" subtitle="Traitements mensuels" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10">
          <h3 className="font-bold text-[#29453E] dark:text-white text-lg mb-4">Animaux sous surveillance</h3>
          {vetStats?.sickAnimalsList?.length === 0 ? (
            <div className="text-center py-8 text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">
              <BadgeCheck size={40} className="mx-auto text-[#3C6C5F] mb-2" />
              <p>Aucun animal malade</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vetStats?.sickAnimalsList?.slice(0, 5).map((animal: any) => (
                <div key={animal.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                  <div>
                    <p className="font-semibold text-[#29453E] dark:text-white">{animal.numero}</p>
                    <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{animal.type} • {animal.race}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Malade</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10">
          <h3 className="font-bold text-[#29453E] dark:text-white text-lg mb-4">Traitements récents</h3>
          {vetStats?.recentTreatmentsList?.length === 0 ? (
            <div className="text-center py-8 text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">
              <Stethoscope size={40} className="mx-auto text-[#3C6C5F] mb-2" />
              <p>Aucun traitement récent</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vetStats?.recentTreatmentsList?.slice(0, 5).map((t: any) => (
                <div key={t.id} className="p-3 bg-[#FFF3DA]/30 dark:bg-[#2a3f38] rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#29453E] dark:text-white">{t.medicament}</p>
                    <span className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">{t.description}</p>
                  <p className="text-xs text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 mt-1">Animal: {t.animal.numero}</p>
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
// DASHBOARD AGRICULTEUR AVEC PALETTE APP
// ============================================
function AppAgriDashboard({ agriStats, weatherData, weatherLoading, weatherError, exportPDF, loading, success, error, period, setPeriod }: any) {
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d1a15] p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#29453E] dark:text-white">Dashboard Agriculteur</h1>
          <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Suivi des performances et des cultures</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28] text-sm text-[#29453E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]"
          >
            <option value="all">Tous</option>
            <option value="month">30 jours</option>
          </select>
          <button 
            onClick={() => exportPDF(period)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1a2e28] border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-4 bg-[#DDF3E8] dark:bg-[#2a3f38] border border-[#9DAE7A] dark:border-[#9DAE7A] rounded-2xl text-[#29453E] dark:text-white text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="text-[#3C6C5F]" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-1">
          <AppWeather weatherData={weatherData} loading={weatherLoading} error={weatherError} />
        </div>
        <div className="lg:col-span-3">
          <AppStats stats={{ total: totalAnimaux + totalCultures, active: totalAnimaux, new: totalTerrains, trend: trend }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AppChart data={activityData} title="Activité agricole" subtitle="Par jour" />
        <AppChart data={productionData} title="Production mensuelle" subtitle="Évolution" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Building2 size={22} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-[#29453E] dark:text-white">{totalFermes}</p>
          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Fermes</p>
        </div>
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9DAE7A] to-[#3C6C5F] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <TreePine size={22} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-[#29453E] dark:text-white">{totalTerrains}</p>
          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Terrains</p>
        </div>
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFC490] to-[#D4A574] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Beef size={22} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-[#29453E] dark:text-white">{totalAnimaux}</p>
          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Animaux</p>
        </div>
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#29453E] to-[#1f332e] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Sprout size={22} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-[#29453E] dark:text-white">{totalCultures}</p>
          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Cultures</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD EMPLOYÉ AVEC PALETTE APP
// ============================================
function AppEmployeeDashboard({ agriStats, weatherData, weatherLoading, weatherError, exportPDF, loading, success, error, period, setPeriod }: any) {
  const totalFermes = agriStats?.totalFermes || 0;
  const totalTerrains = agriStats?.totalTerrains || 0;
  const totalAnimaux = agriStats?.totalAnimaux || 0;
  const totalCultures = agriStats?.totalCultures || 0;
  
  const stats = {
    total: totalFermes + totalTerrains + totalAnimaux + totalCultures,
    active: totalAnimaux + totalCultures,
    new: totalTerrains,
    trend: totalFermes > 0 ? '+12%' : '0%'
  };

  const getMonthlyData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const total = totalAnimaux + totalCultures;
    return months.map((month, index) => ({
      label: month,
      value: Math.floor(total * (0.3 + (index / 12)))
    }));
  };

  const getWeeklyData = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const total = totalAnimaux + totalTerrains;
    return days.map((day, index) => ({
      label: day,
      value: Math.floor(total * (0.05 + (index % 3) * 0.1))
    }));
  };

  const monthlyData = getMonthlyData();
  const weeklyData = getWeeklyData();

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d1a15] p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#29453E] dark:text-white">Dashboard Employé</h1>
          <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Informations générales de l'exploitation</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-white dark:bg-[#1a2e28] text-sm text-[#29453E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]"
          >
            <option value="all">Tous</option>
            <option value="month">30 jours</option>
          </select>
          <button 
            onClick={() => exportPDF(period)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1a2e28] border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#1a2e28] border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-[#29453E] dark:text-white font-semibold text-sm hover:bg-[#FFF3DA] dark:hover:bg-[#2a3f38] transition-all shadow-sm flex items-center gap-2">
            <RefreshCw size={16} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-4 bg-[#DDF3E8] dark:bg-[#2a3f38] border border-[#9DAE7A] dark:border-[#9DAE7A] rounded-2xl text-[#29453E] dark:text-white text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="text-[#3C6C5F]" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-1">
          <AppWeather weatherData={weatherData} loading={weatherLoading} error={weatherError} />
        </div>
        <div className="lg:col-span-3">
          <AppStats stats={stats} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AppChart data={monthlyData} title="Évolution mensuelle" subtitle="Données globales" />
        <AppChart data={weeklyData} title="Activité hebdomadaire" subtitle="Performance" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Building2 size={22} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-[#29453E] dark:text-white">{totalFermes}</p>
          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Fermes</p>
        </div>
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9DAE7A] to-[#3C6C5F] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <TreePine size={22} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-[#29453E] dark:text-white">{totalTerrains}</p>
          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Terrains</p>
        </div>
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFC490] to-[#D4A574] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Beef size={22} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-[#29453E] dark:text-white">{totalAnimaux}</p>
          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Animaux</p>
        </div>
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-5 shadow-lg border border-[#FFC490]/20 dark:border-[#FFC490]/10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#29453E] to-[#1f332e] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Sprout size={22} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-[#29453E] dark:text-white">{totalCultures}</p>
          <p className="text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">Cultures</p>
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
  vetStats,
  agriStats,
}: DashboardViewProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState<'all' | 'month'>('all');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedUserIndex] = useState(initialConnectedUserIndex);
  const connectedUser = users[connectedUserIndex] || {
    nom: "",
    prenom: "",
    role: Role.ADMIN,
    email: "",
  };
// Dans DashboardView.tsx - version simplifiée de exportPDF

// Dans DashboardView.tsx - fonction exportPDF corrigée

const exportPDF = async (selectedPeriod: 'all' | 'month' = 'all') => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/export-dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: connectedUser.id,
        role: connectedUser.role,
        period: selectedPeriod,
      }),
    });

    // ✅ CORRECTION: Lire le corps UNE SEULE FOIS
    if (!response.ok) {
      // Lire le texte une seule fois
      const errorText = await response.text();
      let errorMessage = `Erreur ${response.status}`;
      
      // Essayer de parser comme JSON
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Si ce n'est pas du JSON, utiliser le texte
        if (errorText.includes('<!DOCTYPE')) {
          errorMessage = 'L\'API n\'est pas accessible. Vérifiez que le serveur est en cours d\'exécution.';
        } else if (errorText) {
          errorMessage = errorText.substring(0, 100);
        }
      }
      throw new Error(errorMessage);
    }

    // ✅ Vérifier le content-type avant de lire le blob
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/pdf')) {
      // Lire le texte une seule fois pour le message d'erreur
      const text = await response.text();
      throw new Error(`Le serveur n'a pas renvoyé un PDF valide: ${text.substring(0, 100)}`);
    }

    // ✅ Lire le blob (le corps est consommé ici)
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Le PDF généré est vide');
    }

    // Télécharger le fichier
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
        
        if (!currentResponse.ok) {
          throw new Error(`Erreur météo: ${currentResponse.status}`);
        }
        
        const currentData = await currentResponse.json();

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`;
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
          throw new Error(`Erreur prévisions: ${forecastResponse.status}`);
        }
        
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
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    const result = await deleteUtilisateurAction(id);
    if (result.success) {
      setUsers(users.filter((u) => u.id !== id));
    } else {
      alert(result.error || "Erreur lors de la suppression");
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
      setModalMessage(response.error || "Une erreur est survenue.");
    }
  };

  // Rendu selon le rôle avec les composants à la palette de l'application
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
      />
    );
  }

  return (
    <AppEmployeeDashboard 
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
    />
  );
}