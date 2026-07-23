// components/AgriDashboardWithAgromonitoring.tsx

import { useState, useEffect } from 'react';
import { 
  Sprout, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  MapPin,
  Droplet,
  RefreshCw,
  Thermometer,
  LayoutGrid,
  Bell,
  FileText,
  Home,
  CloudRain,
  Sun,
  Wind,
  Activity,
  Shield,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  Eye,
  Monitor,
  Database,
  Settings
} from 'lucide-react';
import { 
  getPolygons, 
  getFieldHealth, 
  getAgromonitoringAlerts,
  createPolygon,
  FieldHealth,
  AgromonitoringAlert,
  Polygon
} from '@/actions/agromonitoring';
import { getWeatherData } from '@/actions/openMeteo';

interface AgriDashboardWithAgromonitoringProps {
  agriStats?: any;
  t: (key: string, texts: any) => string;
  pageTexts: any;
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
}

export default function AgriDashboardWithAgromonitoring({ 
  agriStats, 
  t, 
  pageTexts,
  fermes = [],
  terrains = []
}: AgriDashboardWithAgromonitoringProps) {
  const [loading, setLoading] = useState(true);
  const [polygons, setPolygons] = useState<any[]>([]);
  const [fieldHealth, setFieldHealth] = useState<FieldHealth[]>([]);
  const [alerts, setAlerts] = useState<AgromonitoringAlert[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [fermes, terrains]);

  /**
   * Convertit une ferme en polygone Agromonitoring
   */
  const convertFermeToPolygon = (ferme: any): Polygon | null => {
    // Si la ferme a des coordonnées, les utiliser
    if (ferme.latitude && ferme.longitude) {
      const lat = Number(ferme.latitude);
      const lon = Number(ferme.longitude);
      
      // Créer un polygone autour du point (zone de ~200m)
      const offset = 0.0015;
      return {
        name: ferme.nom,
        coordinates: [[
          [lon - offset, lat - offset],
          [lon + offset, lat - offset],
          [lon + offset, lat + offset],
          [lon - offset, lat + offset],
          [lon - offset, lat - offset]
        ]],
        cropType: 'mixed'
      };
    }
    
    // Sinon, utiliser les coordonnées par défaut de la Tunisie
    // avec un offset basé sur l'ID pour les différencier
    const baseLat = 36.4;
    const baseLon = 10.6;
    const idOffset = (ferme.id || 0) * 0.003;
    
    return {
      name: ferme.nom,
      coordinates: [[
        [baseLon + idOffset - 0.001, baseLat + idOffset - 0.001],
        [baseLon + idOffset + 0.001, baseLat + idOffset - 0.001],
        [baseLon + idOffset + 0.001, baseLat + idOffset + 0.001],
        [baseLon + idOffset - 0.001, baseLat + idOffset + 0.001],
        [baseLon + idOffset - 0.001, baseLat + idOffset - 0.001]
      ]],
      cropType: 'mixed'
    };
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let existingPolygons = await getPolygons();
      
      // Si des fermes sont fournies, les utiliser
      if (fermes.length > 0) {
        // Créer des polygones pour chaque ferme
        const fermePolygons = fermes
          .map(ferme => convertFermeToPolygon(ferme))
          .filter(p => p !== null) as Polygon[];
        
        // Si aucun polygone n'existe, en créer un pour chaque ferme
        if (existingPolygons.length === 0) {
          for (const polygon of fermePolygons) {
            await createPolygon(polygon);
          }
          existingPolygons = await getPolygons();
        } else {
          // Mettre à jour les noms des polygones avec les noms des fermes
          setPolygons(fermePolygons);
        }
      } else if (terrains.length > 0) {
        // Utiliser les terrains si les fermes ne sont pas disponibles
        const terrainPolygons = terrains
          .map(terrain => {
            if (terrain.latitude && terrain.longitude) {
              const lat = Number(terrain.latitude);
              const lon = Number(terrain.longitude);
              const offset = 0.001;
              return {
                name: terrain.nom,
                coordinates: [[
                  [lon - offset, lat - offset],
                  [lon + offset, lat - offset],
                  [lon + offset, lat + offset],
                  [lon - offset, lat + offset],
                  [lon - offset, lat - offset]
                ]],
                cropType: 'mixed'
              } as Polygon;
            }
            return null;
          })
          .filter(p => p !== null) as Polygon[];
        
        if (existingPolygons.length === 0 && terrainPolygons.length > 0) {
          for (const polygon of terrainPolygons) {
            await createPolygon(polygon);
          }
          existingPolygons = await getPolygons();
        } else if (terrainPolygons.length > 0) {
          setPolygons(terrainPolygons);
        }
      }
      
      // Si toujours aucun polygone, utiliser les coordonnées par défaut
      if (polygons.length === 0 && existingPolygons.length === 0) {
        const defaultPolygon = {
          name: 'Ferme Principale',
          coordinates: [[
            [10.598, 36.398],
            [10.602, 36.398],
            [10.602, 36.402],
            [10.598, 36.402],
            [10.598, 36.398]
          ]],
          cropType: 'mixed'
        };
        await createPolygon(defaultPolygon);
        existingPolygons = await getPolygons();
      }

      // Utiliser les polygones existants s'ils existent
      if (existingPolygons.length > 0) {
        setPolygons(existingPolygons);
      }

      // 3. Chargement de la santé des parcelles
      const polygonsToUse = polygons.length > 0 ? polygons : existingPolygons;
      if (polygonsToUse.length > 0) {
        const healthData = await Promise.all(
          polygonsToUse.map((p: any) => getFieldHealth(p.id || 0))
        );
        setFieldHealth(healthData.filter(h => h !== null) as FieldHealth[]);
      }

      // 4. Chargement des alertes
      const alertsData = await getAgromonitoringAlerts();
      setAlerts(alertsData);

      // 5. Chargement de la météo pour la première ferme
      const firstFerme = fermes.find(f => f.latitude && f.longitude);
      if (firstFerme && firstFerme.latitude && firstFerme.longitude) {
        try {
          const weather = await getWeatherData(
            Number(firstFerme.latitude), 
            Number(firstFerme.longitude), 
            'Africa/Tunis'
          );
          if (weather) setWeatherData(weather);
        } catch (weatherError) {
          console.warn('Météo non disponible pour cette ferme');
        }
      } else {
        // Météo par défaut pour Hammamet
        try {
          const weather = await getWeatherData(36.4, 10.6, 'Africa/Tunis');
          if (weather) setWeatherData(weather);
        } catch (weatherError) {
          console.warn('Météo non disponible');
        }
      }

    } catch (error) {
      console.error('Erreur chargement:', error);
      setError('Erreur de chargement des données - Utilisation des données simulées');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500 bg-green-50 border-green-200';
      case 'good': return 'text-[#3C6C5F] bg-[#DDF3E8] border-[#9DAE7A]';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excellente';
      case 'good': return 'Bonne';
      case 'moderate': return 'Moyenne';
      case 'poor': return 'Faible';
      case 'critical': return 'Critique';
      default: return 'Inconnue';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Récupérer la localisation pour l'affichage
  const getLocationDisplay = () => {
    if (fermes.length > 0) {
      const firstFerme = fermes.find(f => f.localisation);
      if (firstFerme?.localisation) return firstFerme.localisation;
    }
    if (terrains.length > 0) {
      const firstTerrain = terrains.find(t => t.localisation);
      if (firstTerrain?.localisation) return firstTerrain.localisation;
    }
    return 'Tunisie';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-[#3C6C5F] mr-3" size={24} />
        <span className="text-[#3C6C5F]">Chargement des données Agromonitoring...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-[#1a2e28] rounded-2xl shadow-lg border border-[#FFC490]/20">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#29453E] dark:text-white flex items-center gap-2">
            <Sprout size={24} className="text-[#3C6C5F]" />
            Surveillance des cultures
          </h2>
          <p className="text-sm text-[#3C6C5F]/60 flex items-center gap-1">
            <LayoutGrid size={14} />
            {polygons.length} parcelle(s)
            <span className="mx-1">•</span>
            <Bell size={14} />
            {alerts.filter(a => !a.read).length} alerte(s) non lue(s)
            {fermes.length > 0 && (
              <>
                <span className="mx-1">•</span>
                <Home size={14} />
                {fermes.length} ferme(s)
              </>
            )}
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#3C6C5F] text-white rounded-xl hover:bg-[#29453E] transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Rafraîchir
        </button>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-700 flex items-center gap-3">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Météo */}
      {weatherData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl p-3 border border-[#FFC490]/10">
            <div className="flex items-center gap-3">
              <Thermometer size={18} className="text-[#D4A574]" />
              <div>
                <p className="text-sm font-bold text-[#29453E] dark:text-white">
                  {weatherData.current.temperature}°C
                </p>
                <p className="text-xs text-[#3C6C5F]/60">Température</p>
              </div>
            </div>
          </div>
          <div className="bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl p-3 border border-[#FFC490]/10">
            <div className="flex items-center gap-3">
              <Droplet size={18} className="text-blue-500" />
              <div>
                <p className="text-sm font-bold text-[#29453E] dark:text-white">
                  {weatherData.current.humidity || 0}%
                </p>
                <p className="text-xs text-[#3C6C5F]/60">Humidité</p>
              </div>
            </div>
          </div>
          <div className="bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl p-3 border border-[#FFC490]/10">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-[#3C6C5F]" />
              <div>
                <p className="text-sm font-bold text-[#29453E] dark:text-white">
                  {polygons.length} parcelle(s)
                </p>
                <p className="text-xs text-[#3C6C5F]/60">{getLocationDisplay()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des fermes */}
      {fermes.length > 0 && (
        <div className="bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl p-3 border border-[#FFC490]/10">
          <h3 className="text-xs font-semibold text-[#3C6C5F]/60 mb-2 flex items-center gap-1">
            <MapPin size={12} />
            Fermes surveillées
          </h3>
          <div className="flex flex-wrap gap-2">
            {fermes.map((ferme) => (
              <span 
                key={ferme.id}
                className="px-3 py-1 bg-white dark:bg-[#1a2e28] rounded-full text-xs font-medium text-[#29453E] dark:text-white border border-[#FFC490]/20 flex items-center gap-1"
              >
                <Home size={12} />
                {ferme.nom}
                {ferme.localisation && (
                  <span className="ml-1 text-[#3C6C5F]/60">• {ferme.localisation}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Santé des parcelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fieldHealth.map((field, index) => {
          // Trouver la ferme correspondante
          const ferme = fermes.find(f => f.id === field.polygonId);
          const polygon = polygons[index];
          
          return (
            <div
              key={field.polygonId}
              className="bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl p-4 border border-[#FFC490]/10 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-[#29453E] dark:text-white text-sm flex items-center gap-1">
                    <Activity size={14} className="text-[#3C6C5F]" />
                    {field.polygonName}
                  </h3>
                  {ferme && ferme.localisation && (
                    <p className="text-[10px] text-[#3C6C5F]/60 flex items-center gap-1">
                      <MapPin size={10} />
                      {ferme.localisation}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${getHealthColor(field.healthStatus)}`}>
                  {getHealthLabel(field.healthStatus)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#3C6C5F]/60 flex items-center gap-1">
                    <TrendingUp size={12} />
                    NDVI
                  </span>
                  <span className="font-bold text-[#29453E] dark:text-white">
                    {field.currentNDVI.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#FFF3DA] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(field.currentNDVI * 100, 100)}%`,
                      background: `linear-gradient(to right, #ff6b6b, #ffd93d, #6bcf7f)`
                    }}
                  />
                </div>
                
                {field.recommendations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#FFC490]/10">
                    <p className="text-xs font-semibold text-[#D4A574] flex items-center gap-1">
                      <FileText size={12} />
                      Recommandations
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {field.recommendations.slice(0, 2).map((rec, i) => (
                        <li key={i} className="text-xs text-[#3C6C5F]/70 flex items-start gap-1">
                          <span className="text-[#D4A574]">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="bg-[#FAFAFA] dark:bg-[#0d1a15] rounded-xl p-4 border border-[#FFC490]/10">
          <h3 className="font-bold text-[#29453E] dark:text-white mb-3 flex items-center gap-2">
            <Bell size={18} className="text-[#D4A574]" />
            Alertes
            {alerts.filter(a => !a.read).length > 0 && (
              <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                {alerts.filter(a => !a.read).length}
              </span>
            )}
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border transition-all ${
                  !alert.read ? 'bg-[#FFF3DA]/30 border-[#FFC490]/30' : 'bg-white/50 border-[#FFC490]/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityColor(alert.severity)}`}>
                        <Shield size={10} className="inline mr-1" />
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#3C6C5F]/60 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(alert.date).toLocaleDateString('fr-FR')}
                      </span>
                      {alert.polygonName && (
                        <span className="text-[10px] bg-[#FFF3DA] dark:bg-[#2a3f38] px-2 py-0.5 rounded-full text-[#3C6C5F]/70 flex items-center gap-1">
                          <MapPin size={10} />
                          {alert.polygonName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#29453E] dark:text-white mt-1 flex items-center gap-1">
                      <AlertTriangle size={12} className="text-[#D4A574]" />
                      {alert.title}
                    </p>
                    <p className="text-xs text-[#3C6C5F]/70 line-clamp-1">
                      {alert.description}
                    </p>
                  </div>
                  {!alert.read && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0 mt-1 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message si aucune donnée */}
      {fieldHealth.length === 0 && !loading && (
        <div className="text-center py-8">
          <Database size={48} className="text-[#3C6C5F]/20 mx-auto mb-3" />
          <p className="text-[#3C6C5F]/60">Aucune parcelle surveillée</p>
          <p className="text-xs text-[#3C6C5F]/40 mt-1">
            Ajoutez des coordonnées à vos fermes pour activer la surveillance
          </p>
        </div>
      )}
    </div>
  );
}