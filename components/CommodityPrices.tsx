// components/CommodityPrices.tsx - Version avec données dynamiques
"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wheat,
  Coffee,
  RefreshCw,
  Loader2,
  AlertCircle,
  Leaf,
  Droplet,
  Apple,
  Flower2,
  Package,
  Scale,
  Gauge,
  BarChart3,
  DollarSign,
  Clock,
  Zap,
  LucideIcon,
} from "lucide-react";

interface CommodityPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  icon: React.ReactNode;
   bgGradient: string;
  color: string;
  emoji: string;
  unit: string;
  unitLabel: string;
}

const COMMODITY_CONFIG: Record<string, { 
  color: string; 
  icon: LucideIcon;
  bgGradient: string;
  unit: string;
  unitLabel: string;
}> = {
  "ZW=F": { 
    color: "from-amber-500 to-yellow-600", 
    icon: Wheat,
    bgGradient: "from-amber-50 to-yellow-50",
    unit: "TND/tonne",
    unitLabel: "par tonne"
  },
  "ZC=F": { 
    color: "from-yellow-500 to-amber-600", 
    icon: Leaf,
    bgGradient: "from-yellow-50 to-amber-50",
    unit: "TND/tonne",
    unitLabel: "par tonne"
  },
  "ZS=F": { 
    color: "from-green-500 to-emerald-600", 
    icon: Droplet,
    bgGradient: "from-green-50 to-emerald-50",
    unit: "TND/tonne",
    unitLabel: "par tonne"
  },
  "KC=F": { 
    color: "from-amber-700 to-brown-800", 
    icon: Coffee,
    bgGradient: "from-amber-50 to-brown-50",
    unit: "TND/kg",
    unitLabel: "par kg"
  },
  // Ajout de nouveaux produits
  "CL=F": {
    color: "from-blue-500 to-indigo-600",
    icon: Droplet,
    bgGradient: "from-blue-50 to-indigo-50",
    unit: "TND/litre",
    unitLabel: "par litre"
  },
  "SU=F": {
    color: "from-rose-500 to-pink-600",
    icon: Flower2,
    bgGradient: "from-rose-50 to-pink-50",
    unit: "TND/tonne",
    unitLabel: "par tonne"
  },
  "CT=F": {
    color: "from-teal-500 to-cyan-600",
    icon: Apple,
    bgGradient: "from-teal-50 to-cyan-50",
    unit: "TND/kg",
    unitLabel: "par kg"
  },
};

export default function CommodityPrices() {
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/commodity-prices");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur de récupération");
      }

      const data = await response.json();

      if (data.success && data.prices) {
        const mappedPrices = data.prices.map((item: any) => {
          const config = COMMODITY_CONFIG[item.symbol] || COMMODITY_CONFIG["ZW=F"];
          const IconComponent = config.icon;
          
          return {
            ...item,
            icon: <IconComponent size={16} className="text-white" />,
            color: config.color,
            bgGradient: config.bgGradient,
            unit: config.unit,
            unitLabel: config.unitLabel,
          };
        });
        setPrices(mappedPrices);
        if (data.exchangeRate) {
          setExchangeRate(data.exchangeRate);
        }
        setLastUpdate(new Date());
      } else {
        throw new Error(data.error || "Données invalides");
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPrices();
  };

  if (loading && prices.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8E3DC] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#29453E] flex items-center gap-2">
              <BarChart3 size={20} className="text-[#3C6C5F]" />
              Prix des matières premières
            </h3>
            <p className="text-xs text-[#3C6C5F]/50">Marchés agricoles en Tunisie</p>
          </div>
          <div className="animate-spin">
            <Loader2 size={20} className="text-[#3C6C5F]" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-[#F8F6F3] animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8E3DC] p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* En-tête modernisé */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-[#29453E] flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white">
              <BarChart3 size={18} />
            </div>
            Prix des matières premières
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-[#3C6C5F]/50">
              Marchés agricoles en Tunisie
            </p>
            {exchangeRate && (
              <span className="text-[10px] bg-[#F8F6F3] px-2 py-0.5 rounded-full flex items-center gap-1 text-[#3C6C5F]/60">
                <DollarSign size={10} />
                1 USD = {exchangeRate.toFixed(3)} TND
              </span>
            )}
            {lastUpdate && (
              <span className="text-[10px] bg-[#F8F6F3] px-2 py-0.5 rounded-full flex items-center gap-1 text-[#3C6C5F]/40">
                <Clock size={10} />
                {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-[#F8F6F3] transition-all disabled:opacity-50 group"
        >
          <RefreshCw size={16} className={`text-[#3C6C5F] ${refreshing ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-500`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={fetchPrices} className="ml-auto text-red-600 font-medium hover:underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Grille des prix */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {prices.map((item) => {
          const isPositive = item.change >= 0;
          const formattedPrice = item.price.toFixed(2);
          const formattedChange = item.changePercent.toFixed(2);
          const formattedChangeValue = item.change.toFixed(2);

          return (
            <div
              key={item.symbol}
              className="group relative rounded-xl p-4 bg-gradient-to-br from-white to-[#FAFAFA] border border-[#E8E3DC] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#3C6C5F]/20"
            >
              {/* Fond décoratif */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
              
              <div className="relative">
                {/* Icône avec badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-sm`}>
                    {item.icon}
                  </div>
                  <span className="text-lg">{item.emoji}</span>
                </div>
                
                {/* Nom du produit */}
                <p className="text-xs font-medium text-[#3C6C5F]/60 uppercase tracking-wider truncate">
                  {item.name}
                </p>
                
                {/* Prix */}
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className="text-lg font-bold text-[#29453E]">
                    {formattedPrice}
                  </p>
                  <span className="text-[10px] font-normal text-[#3C6C5F]/40">
                    {item.unit}
                  </span>
                </div>
                
                {/* Variation */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isPositive ? (
                    <div className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <TrendingUp size={10} className="mr-0.5" />
                      <span className="text-xs font-bold">+{formattedChange}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                      <TrendingDown size={10} className="mr-0.5" />
                      <span className="text-xs font-bold">{formattedChange}%</span>
                    </div>
                  )}
                  <span className={`text-[10px] ${isPositive ? "text-emerald-500" : "text-red-500"} font-medium`}>
                    {isPositive ? "+" : ""}{formattedChangeValue}
                  </span>
                </div>

                {/* Badge unité */}
                <div className="absolute bottom-2 right-2">
                  <span className="text-[8px] bg-[#F8F6F3] px-1.5 py-0.5 rounded-full text-[#3C6C5F]/30 font-medium">
                    {item.unitLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pied de page */}
      <div className="mt-4 pt-3 border-t border-[#E8E3DC]/50 flex flex-wrap justify-between items-center gap-2">
        <p className="text-[10px] text-[#3C6C5F]/30 flex items-center gap-1">
          <Zap size={10} />
          Données en temps réel de Yahoo Finance
        </p>
        <div className="flex items-center gap-3 text-[10px] text-[#3C6C5F]/30">
          <span className="flex items-center gap-1">
            <Scale size={10} />
            Tonnes
          </span>
          <span className="flex items-center gap-1">
            <Package size={10} />
            Kilogrammes
          </span>
          <span className="flex items-center gap-1">
            <Gauge size={10} />
            Litres
          </span>
        </div>
      </div>
    </div>
  );
}