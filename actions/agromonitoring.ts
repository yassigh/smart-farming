// actions/agromonitoring.ts

const API_KEY = process.env.AGROMONITORING_API_KEY;
const BASE_URL = "https://api.agromonitoring.com/api";

// Types
export interface Polygon {
  id?: number;
  name: string;
  coordinates: number[][][];
  center?: { lat: number; lon: number };
  area?: number;
  cropType?: string;
}

export interface NDVIData {
  date: string;
  ndvi: number;
  min?: number;
  max?: number;
}

export interface FieldHealth {
  polygonId: number;
  polygonName: string;
  currentNDVI: number;
  previousNDVI: number;
  healthStatus: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  soilMoisture: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface AgromonitoringAlert {
  id: string;
  type: 'drought' | 'flood' | 'frost' | 'pest' | 'weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  polygonId: number;
  polygonName: string;
  date: string;
  read: boolean;
}

// ============================================
// CRÉATION DE POLYGONES POUR LES FERMES
// ============================================

export function createHammametPolygon(name: string, offsetLat: number = 0, offsetLon: number = 0): Polygon {
  const baseLat = 36.4;
  const baseLon = 10.6;
  
  const latOffset = 0.0009 + offsetLat;
  const lonOffset = 0.0012 + offsetLon;
  
  return {
    name: name,
    coordinates: [[
      [baseLon + lonOffset, baseLat + latOffset],
      [baseLon + lonOffset + 0.002, baseLat + latOffset],
      [baseLon + lonOffset + 0.002, baseLat + latOffset - 0.0018],
      [baseLon + lonOffset, baseLat + latOffset - 0.0018],
      [baseLon + lonOffset, baseLat + latOffset]
    ]],
    cropType: 'mixed'
  };
}

/**
 * Vérifie si la clé API est configurée
 */
function isApiKeyConfigured(): boolean {
  if (!API_KEY || API_KEY === 'votre_clé_api_agromonitoring') {
    console.warn('[Agromonitoring] Clé API non configurée - Mode simulation');
    return false;
  }
  return true;
}

/**
 * Crée ou met à jour un polygone dans Agromonitoring
 */
export async function createPolygon(polygon: Polygon): Promise<{ id: number } | null> {
  if (!isApiKeyConfigured()) {
    console.warn('[Agromonitoring] Mode simulation - Création polygone simulé');
    return { id: Math.floor(Math.random() * 1000) };
  }

  try {
    const response = await fetch(`${BASE_URL}/polygons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        name: polygon.name,
        geo_json: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: polygon.coordinates
          },
          properties: {
            name: polygon.name,
            crop: polygon.cropType || 'mixed'
          }
        }
      })
    });

    if (!response.ok) {
      console.error('[Agromonitoring] Erreur création polygone:', response.status);
      return { id: Math.floor(Math.random() * 1000) };
    }

    const data = await response.json();
    return { id: data.id };
  } catch (error) {
    console.error('[Agromonitoring] Erreur createPolygon:', error);
    return { id: Math.floor(Math.random() * 1000) };
  }
}

/**
 * Récupère tous les polygones
 */
export async function getPolygons(): Promise<Polygon[]> {
  if (!isApiKeyConfigured()) {
    console.warn('[Agromonitoring] Mode simulation - Données simulées');
    return getMockPolygons();
  }

  try {
    const response = await fetch(`${BASE_URL}/polygons?appid=${API_KEY}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    if (!response.ok) {
      console.warn('[Agromonitoring] API inaccessible - Données simulées');
      return getMockPolygons();
    }

    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      coordinates: item.geo_json?.geometry?.coordinates || [],
      center: item.center || { lat: 36.4, lon: 10.6 },
      area: item.area || 1
    }));
  } catch (error) {
    console.error('[Agromonitoring] Erreur getPolygons:', error);
    return getMockPolygons();
  }
}

/**
 * Données simulées pour le développement
 */
function getMockPolygons(): Polygon[] {
  return [
    {
      id: 1,
      name: 'Ferme Hammamet 1',
      coordinates: [[[10.6, 36.4], [10.602, 36.4], [10.602, 36.398], [10.6, 36.398], [10.6, 36.4]]],
      center: { lat: 36.399, lon: 10.601 },
      area: 2.5,
      cropType: 'mixed'
    },
    {
      id: 2,
      name: 'Ferme Hammamet 2',
      coordinates: [[[10.605, 36.405], [10.607, 36.405], [10.607, 36.403], [10.605, 36.403], [10.605, 36.405]]],
      center: { lat: 36.404, lon: 10.606 },
      area: 3.2,
      cropType: 'olives'
    }
  ];
}

// ============================================
// DONNÉES NDVI (SANTÉ DES CULTURES) - SIMULÉES
// ============================================

export async function getNDVIHistory(
  polygonId: number,
  startDate: string,
  endDate: string
): Promise<NDVIData[]> {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push({
      date: current.toISOString().split('T')[0],
      ndvi: 0.2 + Math.random() * 0.5,
      min: 0.1 + Math.random() * 0.2,
      max: 0.3 + Math.random() * 0.5
    });
    current.setDate(current.getDate() + 7);
  }
  
  return dates;
}

export async function getCurrentNDVI(polygonId: number): Promise<number> {
  return 0.3 + Math.random() * 0.5;
}

// ============================================
// ALERTES - SIMULÉES
// ============================================

export async function getAgromonitoringAlerts(
  polygonId?: number
): Promise<AgromonitoringAlert[]> {
  const alerts: AgromonitoringAlert[] = [
    {
      id: '1',
      type: 'drought',
      severity: 'medium',
      title: 'Sécheresse modérée détectée',
      description: 'Les précipitations sont inférieures à la moyenne sur les 30 derniers jours.',
      polygonId: polygonId || 1,
      polygonName: 'Ferme Hammamet 1',
      date: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'pest',
      severity: 'high',
      title: 'Risque élevé de ravageurs',
      description: 'Les conditions climatiques favorisent le développement des ravageurs.',
      polygonId: polygonId || 1,
      polygonName: 'Ferme Hammamet 1',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      read: false
    }
  ];
  
  return alerts;
}

// ============================================
// SANTÉ DES PARCELLES
// ============================================

export async function getFieldHealth(polygonId: number): Promise<FieldHealth | null> {
  try {
    const currentNDVI = await getCurrentNDVI(polygonId);
    const alerts = await getAgromonitoringAlerts(polygonId);
    const polygons = await getPolygons();
    const polygon = polygons.find(p => p.id === polygonId);

    if (!polygon) {
      return {
        polygonId: polygonId,
        polygonName: `Parcelle ${polygonId}`,
        currentNDVI: 0.4 + Math.random() * 0.3,
        previousNDVI: 0.3 + Math.random() * 0.3,
        healthStatus: 'good',
        soilMoisture: 25 + Math.random() * 30,
        riskLevel: 'low',
        recommendations: ['Bonne santé générale', 'Continuer la surveillance']
      };
    }

    let healthStatus: FieldHealth['healthStatus'] = 'good';
    if (currentNDVI > 0.6) healthStatus = 'excellent';
    else if (currentNDVI > 0.4) healthStatus = 'good';
    else if (currentNDVI > 0.3) healthStatus = 'moderate';
    else if (currentNDVI > 0.2) healthStatus = 'poor';
    else healthStatus = 'critical';

    const recommendations: string[] = [];
    if (currentNDVI < 0.3) {
      recommendations.push('Fertilisation recommandée - NDVI faible');
    }
    if (alerts.some(a => a.severity === 'high' || a.severity === 'critical')) {
      const criticalCount = alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length;
      recommendations.push(`${criticalCount} alerte(s) critique(s) à traiter`);
    }
    if (currentNDVI < 0.4 && healthStatus !== 'critical') {
      recommendations.push('Surveillance renforcée conseillée');
    }
    if (recommendations.length === 0) {
      recommendations.push('Parcelle en bonne santé');
    }

    return {
      polygonId,
      polygonName: polygon.name || `Parcelle ${polygonId}`,
      currentNDVI,
      previousNDVI: currentNDVI * (0.85 + Math.random() * 0.3),
      healthStatus,
      soilMoisture: 20 + Math.random() * 50,
      riskLevel: alerts.some(a => a.severity === 'critical') ? 'high' : 
                 alerts.some(a => a.severity === 'high') ? 'medium' : 'low',
      recommendations
    };
  } catch (error) {
    console.error('[Agromonitoring] Erreur getFieldHealth:', error);
    return {
      polygonId,
      polygonName: `Parcelle ${polygonId}`,
      currentNDVI: 0.4,
      previousNDVI: 0.35,
      healthStatus: 'good',
      soilMoisture: 30,
      riskLevel: 'low',
      recommendations: ['Données en attente de chargement']
    };
  }
}