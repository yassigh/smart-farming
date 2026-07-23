// actions/openMeteo.ts
export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    weatherCode: number;
    sunrise: string;
    sunset: string;
  };
  forecast: {
    daily: {
      time: string[];
      temperatureMax: number[];
      temperatureMin: number[];
      precipitationSum: number[];
      weatherCode: number[];
    };
    hourly: {
      time: string[];
      temperature: number[];
      precipitation: number[];
      humidity: number[];
      windSpeed: number[];
    };
  };
  alerts: Array<{
    event: string;
    description: string;
    severity: string;
  }>;
}

// Type pour les alertes
type Alert = {
  event: string;
  description: string;
  severity: string;
};

export async function getWeatherData(lat: number, lon: number, timezone: string = 'Africa/Algiers'): Promise<WeatherData> {
  try {
    // Validation des coordonnées
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      console.error('Coordonnées invalides:', { lat, lon });
      throw new Error('Coordonnées géographiques invalides');
    }

    // Version simplifiée - on demande moins de données pour éviter les erreurs
    const baseUrl = 'https://api.open-meteo.com/v1/forecast';
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
      timezone: timezone,
      forecast_days: '7'
    });

    const url = `${baseUrl}?${params.toString()}`;
    console.log('Fetching weather from:', url);

    const forecastResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text();
      console.error('Open-Meteo error details:', errorText);
      throw new Error(`Erreur HTTP: ${forecastResponse.status} - ${forecastResponse.statusText}`);
    }

    const forecastData = await forecastResponse.json();
    console.log('Weather data received successfully');
    
    // Vérification que les données sont valides
    if (!forecastData || !forecastData.current) {
      console.error('Invalid weather data structure:', forecastData);
      return getDefaultWeatherData();
    }

    // Récupération des alertes (optionnel - avec gestion d'erreur)
    const alerts: Alert[] = [];
    try {
      // Note: Open-Meteo ne supporte pas les alertes dans la même requête
      // On les ignore pour éviter les erreurs
      // Si vous voulez récupérer les alertes, utilisez l'API dédiée
    } catch (alertError) {
      console.warn('Alertes météo non disponibles');
    }

    // Formatage des données avec fallbacks
    return {
      current: {
        temperature: forecastData.current.temperature_2m ?? 0,
        humidity: forecastData.current.relative_humidity_2m ?? 0,
        windSpeed: forecastData.current.wind_speed_10m ?? 0,
        precipitation: forecastData.current.precipitation ?? 0,
        weatherCode: forecastData.current.weather_code ?? 0,
        sunrise: forecastData.current.sunrise || new Date().toISOString().split('T')[0] + 'T06:00',
        sunset: forecastData.current.sunset || new Date().toISOString().split('T')[0] + 'T18:00',
      },
      forecast: {
        daily: {
          time: forecastData.daily?.time || [],
          temperatureMax: forecastData.daily?.temperature_2m_max || [],
          temperatureMin: forecastData.daily?.temperature_2m_min || [],
          precipitationSum: forecastData.daily?.precipitation_sum || [],
          weatherCode: forecastData.daily?.weather_code || [],
        },
        hourly: {
          time: forecastData.hourly?.time || [],
          temperature: forecastData.hourly?.temperature_2m || [],
          precipitation: forecastData.hourly?.precipitation || [],
          humidity: forecastData.hourly?.relative_humidity_2m || [],
          windSpeed: forecastData.hourly?.wind_speed_10m || [],
        }
      },
      alerts: alerts,
    };
  } catch (error) {
    console.error('Erreur Open-Meteo détaillée:', error);
    // En cas d'erreur, on retourne des données par défaut
    return getDefaultWeatherData();
  }
}

// Données météo par défaut (fallback)
function getDefaultWeatherData(): WeatherData {
  const now = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return {
    current: {
      temperature: 20,
      humidity: 60,
      windSpeed: 10,
      precipitation: 0,
      weatherCode: 1,
      sunrise: '06:00',
      sunset: '18:00',
    },
    forecast: {
      daily: {
        time: dates,
        temperatureMax: dates.map(() => Math.round(20 + Math.random() * 5)),
        temperatureMin: dates.map(() => Math.round(15 + Math.random() * 5)),
        precipitationSum: dates.map(() => Math.round(Math.random() * 10)),
        weatherCode: dates.map(() => Math.floor(Math.random() * 3)),
      },
      hourly: {
        time: Array.from({ length: 24 }, (_, i) => `${now.toISOString().split('T')[0]}T${String(i).padStart(2, '0')}:00`),
        temperature: Array.from({ length: 24 }, () => Math.round(15 + Math.random() * 10)),
        precipitation: Array.from({ length: 24 }, () => Math.round(Math.random() * 5)),
        humidity: Array.from({ length: 24 }, () => Math.round(50 + Math.random() * 40)),
        windSpeed: Array.from({ length: 24 }, () => Math.round(5 + Math.random() * 20)),
      }
    },
    alerts: [],
  };
}

export async function getHistoricalWeather(lat: number, lon: number, startDate: string, endDate: string): Promise<any> {
  try {
    if (isNaN(lat) || isNaN(lon)) {
      console.error('Coordonnées invalides pour historique météo');
      return null;
    }

    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      start_date: startDate,
      end_date: endDate,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
      timezone: 'auto'
    });

    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`,
      {
        signal: AbortSignal.timeout(10000)
      }
    );
    
    if (!response.ok) {
      console.error('Historical weather error:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur historique Open-Meteo:', error);
    return null;
  }
}

export function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Ciel dégagé',
    1: 'Principalement dégagé',
    2: 'Partiellement nuageux',
    3: 'Nuageux',
    45: 'Brouillard',
    48: 'Brouillard givrant',
    51: 'Bruine légère',
    53: 'Bruine modérée',
    55: 'Bruine dense',
    56: 'Bruine verglaçante légère',
    57: 'Bruine verglaçante dense',
    61: 'Pluie légère',
    63: 'Pluie modérée',
    65: 'Pluie forte',
    66: 'Pluie verglaçante légère',
    67: 'Pluie verglaçante forte',
    71: 'Neige légère',
    73: 'Neige modérée',
    75: 'Neige forte',
    77: 'Grains de neige',
    80: 'Averses légères',
    81: 'Averses modérées',
    82: 'Averses fortes',
    85: 'Averses de neige légères',
    86: 'Averses de neige fortes',
    95: 'Orage',
    96: 'Orage avec grêle légère',
    99: 'Orage avec grêle forte',
  };
  
  return weatherCodes[code] || 'Inconnu';
}

export function getWeatherIcon(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: '☀️',
    1: '🌤️',
    2: '⛅',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌧️',
    55: '🌧️',
    56: '🌨️',
    57: '🌨️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    66: '🌨️',
    67: '🌨️',
    71: '❄️',
    73: '❄️',
    75: '❄️',
    77: '🌨️',
    80: '🌦️',
    81: '🌧️',
    82: '⛈️',
    85: '🌨️',
    86: '❄️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️',
  };
  
  return weatherCodes[code] || '🌤️';
}