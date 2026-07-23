// lib/ai/simpleAIService.ts — Prédictions enrichies avec météo + données réelles
import { db } from "@/lib/db";
import { FarmHealthScore, PredictionIA, AnalyseComplete, NiveauRisque } from "@/models/predictionIA";

export class SimpleAIService {

  /**
   * Génère une analyse complète de la ferme
   */
  async generateFullAnalysis(fermeId: number): Promise<AnalyseComplete | null> {
    const ferme = await db.ferme.findUnique({
      where: { id: fermeId },
      include: {
        terrains: {
          include: {
            cultures: { orderBy: { datePlantation: 'desc' } },
            animaux: true,
          },
        },
        depenses: { orderBy: { date: 'desc' }, take: 20 },
        revenus: { orderBy: { date: 'desc' }, take: 20 },
        predictions: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!ferme) return null;

    // Récupérer les données météo en temps réel
    const weatherData = await this.fetchWeatherData();

    const healthScore = await this.calculateHealthScore(ferme, weatherData);

    const predictions = [
      { type: 'RENDEMENT', data: this.predictRendement(ferme, weatherData) },
      { type: 'IRRIGATION', data: this.predictIrrigation(ferme, weatherData) },
      { type: 'MALADIE', data: this.predictMaladie(ferme, weatherData) },
      { type: 'FINANCES', data: this.predictFinances(ferme) },
    ];

    const resume = this.generateResume(ferme, healthScore);

    return {
      healthScore,
      predictions: predictions.map(p => ({ ...p.data, type: p.type })),
      resume,
    };
  }

  /**
   * Récupère les données météo depuis Open-Meteo
   */
  private async fetchWeatherData(): Promise<any> {
    try {
      const lat = 36.7538;
      const lon = 3.0588;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa/Algiers&forecast_days=3`;

      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return null;
      const data = await res.json();

      return {
        temperature: data.current?.temperature_2m ?? 25,
        humidity: data.current?.relative_humidity_2m ?? 60,
        precipitation: data.current?.precipitation ?? 0,
        windSpeed: data.current?.wind_speed_10m ?? 10,
        weatherCode: data.current?.weather_code ?? 0,
        forecastRain: (data.daily?.precipitation_sum ?? [0, 0, 0]).slice(0, 3).reduce((a: number, b: number) => a + b, 0),
      };
    } catch {
      // Valeurs par défaut si la météo est indisponible
      return {
        temperature: 25,
        humidity: 60,
        precipitation: 0,
        windSpeed: 12,
        weatherCode: 0,
        forecastRain: 5,
      };
    }
  }

  /**
   * Calcul du score de santé avec météo
   */
  private async calculateHealthScore(ferme: any, weather: any): Promise<FarmHealthScore> {
    const rendement = this.scoreRendement(ferme, weather);
    const animaux = this.scoreAnimaux(ferme);
    const finances = this.scoreFinances(ferme);

    // Bonus météo si conditions favorables
    const weatherBonus = weather
      ? (weather.temperature >= 18 && weather.temperature <= 32 && weather.precipitation < 10 ? 5 : 0)
      : 0;

    const score = Math.min(100, Math.round((rendement + animaux + finances) / 3) + weatherBonus);

    return {
      score,
      niveau: score >= 80 ? 'EXCELLENT' : score >= 60 ? 'BON' : score >= 40 ? 'MOYEN' : 'FAIBLE',
      details: { rendement, animaux, finances },
      recommandations: this.generateRecommandations({ rendement, animaux, finances }, ferme, weather),
    };
  }

  /**
   * Score de rendement basé sur les vraies cultures
   */
  private scoreRendement(ferme: any, weather: any): number {
    const allCultures = ferme.terrains.flatMap((t: any) => t.cultures);
    const nbCultures = allCultures.length;

    // Score de base
    let score = Math.min(100, 40 + (nbCultures * 6));

    // Bonus selon la diversité des cultures
    const typesCultures = new Set(allCultures.map((c: any) => c.nom)).size;
    score += Math.min(15, typesCultures * 3);

    // Bonus état des cultures
    const culturesEnCours = allCultures.filter((c: any) => c.etat !== 'RECOLTE').length;
    score += Math.min(10, culturesEnCours * 2);

    // Malus météo si trop chaud ou gel
    if (weather) {
      if (weather.temperature > 38) score -= 10;
      if (weather.temperature < 5) score -= 15;
      if (weather.forecastRain > 50) score -= 5;
    }

    return Math.max(10, Math.min(100, Math.round(score)));
  }

  /**
   * Score de santé animale
   */
  private scoreAnimaux(ferme: any): number {
    const allAnimaux = ferme.terrains.flatMap((t: any) => t.animaux);
    const nbAnimaux = allAnimaux.length;

    if (nbAnimaux === 0) return 40; // Score neutre si pas d'animaux

    let score = Math.min(100, 45 + (nbAnimaux * 3));

    // Bonus selon les traitements récents (si disponible)
    const animauxSains = allAnimaux.filter((a: any) =>
      a.etatSante === 'BON' || a.etatSante === 'EXCELLENT' || !a.etatSante
    ).length;
    const tauxSante = nbAnimaux > 0 ? (animauxSains / nbAnimaux) * 100 : 100;
    score = Math.round(score * (tauxSante / 100) + (tauxSante * 0.3));

    return Math.max(10, Math.min(100, Math.round(score)));
  }

  /**
   * Score financier
   */
  private scoreFinances(ferme: any): number {
    const totalRevenus = ferme.revenus.reduce((sum: number, r: any) => sum + r.montant, 0);
    const totalDepenses = ferme.depenses.reduce((sum: number, d: any) => sum + d.montant, 0);

    if (totalRevenus === 0 && totalDepenses === 0) return 50;
    if (totalRevenus === 0) return 20;

    const ratio = totalRevenus / (totalDepenses || 1);

    // Ratio > 1.5 = excellent, 1.0-1.5 = bon, < 1.0 = problème
    const score = ratio >= 1.5 ? 90 :
                  ratio >= 1.2 ? 75 :
                  ratio >= 1.0 ? 60 :
                  ratio >= 0.8 ? 40 : 20;

    return Math.min(100, score);
  }

  /**
   * Prédiction du rendement avec météo
   */
  private predictRendement(ferme: any, weather: any): PredictionIA {
    const allCultures = ferme.terrains.flatMap((t: any) => t.cultures);
    const nbCultures = allCultures.length;
    const typesCultures = [...new Set(allCultures.map((c: any) => c.nom))].slice(0, 5).join(', ');
    const superficie = ferme.superficie || 10;

    // Rendement de base selon nombre de cultures et superficie
    let rendementBase = 3.5;
    if (nbCultures >= 10) rendementBase = 5.5;
    else if (nbCultures >= 5) rendementBase = 4.5;
    else if (nbCultures >= 2) rendementBase = 4.0;

    // Ajustement météo
    let adjustement = 1.0;
    let facteurMétéo = '';
    if (weather) {
      if (weather.temperature >= 20 && weather.temperature <= 28) {
        adjustement += 0.1;
        facteurMétéo = 'Température optimale ✓';
      } else if (weather.temperature > 35) {
        adjustement -= 0.2;
        facteurMétéo = 'Chaleur excessive ⚠️';
      } else if (weather.temperature < 10) {
        adjustement -= 0.3;
        facteurMétéo = 'Froid risqué ⚠️';
      }
      if (weather.humidity >= 50 && weather.humidity <= 75) {
        adjustement += 0.05;
      }
    }

    const rendementFinal = (rendementBase * adjustement).toFixed(1);
    const confiance = Math.min(95, 65 + (nbCultures * 3));

    const recommendation = nbCultures === 0
      ? '🌱 Aucune culture enregistrée. Commencez par ajouter vos cultures.'
      : nbCultures < 3
      ? `🌿 Diversifiez vos cultures au-delà de ${typesCultures || 'la culture actuelle'} pour améliorer le rendement global.`
      : `✅ Bonnes pratiques culturales sur ${typesCultures}. Maintenez la fertilisation et l'irrigation régulière.`;

    return {
      resultat: `${rendementFinal} t/ha${facteurMétéo ? ` (${facteurMétéo})` : ''}`,
      confiance,
      recommandation: recommendation,
      risque: parseFloat(rendementFinal) >= 4.5 ? 'FAIBLE' : parseFloat(rendementFinal) >= 3.0 ? 'MOYEN' : 'ELEVE',
      facteurs: ['Diversité cultures', 'Météo actuelle', 'Superficie', 'Historique'],
    };
  }

  /**
   * Prédiction irrigation avec météo réelle
   */
  private predictIrrigation(ferme: any, weather: any): PredictionIA {
    const nbCultures = ferme.terrains.reduce((acc: number, t: any) => acc + t.cultures.length, 0);

    let besoinsBase = 1500 + (nbCultures * 180);
    let urgence = 'normale';
    let recommandation = '';

    if (weather) {
      // Ajuster selon la météo réelle
      if (weather.temperature > 30) {
        besoinsBase += 500;
        urgence = 'élevée';
      }
      if (weather.precipitation > 5) {
        besoinsBase -= 300;
        urgence = 'réduite';
      }
      if (weather.forecastRain > 15) {
        urgence = 'à reporter';
      }
      if (weather.humidity > 80) {
        besoinsBase -= 200;
      }

      const tempC = weather.temperature;
      const pluie = weather.forecastRain;

      if (pluie > 15) {
        recommandation = `🌧️ Pluies prévues (${pluie.toFixed(0)} mm sur 3j). Reportez l'irrigation et vérifiez le drainage.`;
      } else if (tempC > 32) {
        recommandation = `☀️ Forte chaleur (${tempC}°C). Arrosez tôt le matin en priorité pour vos ${nbCultures} cultures.`;
      } else {
        recommandation = `💧 Irriguer ${(besoinsBase / 1000).toFixed(1)} m³/ha. Privilégiez le goutte-à-goutte (économie 40% eau).`;
      }
    } else {
      recommandation = `💧 Besoin estimé : ${(besoinsBase / 1000).toFixed(1)} m³/ha. Arrosez dans les 48h si pas de pluie.`;
    }

    return {
      resultat: `${besoinsBase.toLocaleString('fr-DZ')} L/ha/semaine (urgence ${urgence})`,
      confiance: 82,
      recommandation,
      risque: urgence === 'élevée' ? 'ELEVE' : urgence === 'normale' ? 'MOYEN' : 'FAIBLE',
      facteurs: ['Météo temps réel', 'Température', 'Humidité', 'Type de culture'],
    };
  }

  /**
   * Prédiction maladies avec météo
   */
  private predictMaladie(ferme: any, weather: any): PredictionIA {
    const allAnimaux = ferme.terrains.flatMap((t: any) => t.animaux);
    const nbAnimaux = allAnimaux.length;
    const nbCultures = ferme.terrains.reduce((acc: number, t: any) => acc + t.cultures.length, 0);

    let risqueAnimal: NiveauRisque = nbAnimaux > 20 ? 'ELEVE' : nbAnimaux > 10 ? 'MOYEN' : 'FAIBLE';
    let risqueCulture: NiveauRisque = 'FAIBLE';
    let facteursMétéo = '';

    if (weather) {
      // Conditions favorables aux maladies fongiques
      if (weather.humidity > 80 && weather.temperature > 20) {
        risqueCulture = 'ELEVE';
        facteursMétéo = 'Humidité élevée + chaleur : risque fongique élevé';
      } else if (weather.humidity > 70) {
        risqueCulture = 'MOYEN';
        facteursMétéo = 'Humidité modérée : surveillance recommandée';
      }
    }

    const risqueGlobal: NiveauRisque = (risqueAnimal === 'ELEVE' || risqueCulture === 'ELEVE') ? 'ELEVE'
      : (risqueAnimal === 'MOYEN' || risqueCulture === 'MOYEN') ? 'MOYEN' : 'FAIBLE';

    let resultat = '';
    let recommandation = '';

    if (risqueGlobal === 'ELEVE') {
      resultat = `Risque élevé — ${facteursMétéo || 'Densité animale importante'}`;
      recommandation = nbAnimaux > 0
        ? `🔴 Isolez les animaux suspects et appelez le vétérinaire. ${facteursMétéo ? 'Traitez préventivement les cultures avec un fongicide.' : ''}`
        : `🔴 ${facteursMétéo}. Appliquez un traitement fongique préventif sur vos ${nbCultures} cultures.`;
    } else if (risqueGlobal === 'MOYEN') {
      resultat = `Risque modéré — Surveillance recommandée`;
      recommandation = `🟡 Inspectez vos cultures et animaux 2x/semaine. ${facteursMétéo || 'Maintenez une bonne ventilation des espaces animaux.'}`;
    } else {
      resultat = `Risque faible — Conditions favorables`;
      recommandation = `✅ Conditions sanitaires correctes. Maintenez la surveillance habituelle et les vaccinations à jour.`;
    }

    return {
      resultat,
      confiance: 75,
      recommandation,
      risque: risqueGlobal,
      facteurs: ['Densité animale', 'Humidité', 'Température', 'Historique médical'],
    };
  }

  /**
   * Prédiction financière
   */
  private predictFinances(ferme: any): PredictionIA {
    const totalRevenus = ferme.revenus.reduce((sum: number, r: any) => sum + r.montant, 0);
    const totalDepenses = ferme.depenses.reduce((sum: number, d: any) => sum + d.montant, 0);
    const benefice = totalRevenus - totalDepenses;
    const ratio = totalRevenus > 0 ? totalRevenus / (totalDepenses || 1) : 0;

    // Projection annuelle (extrapolation sur 12 mois)
    const projectionAnnuelle = benefice * 12;

    let recommandation = '';
    let risque: NiveauRisque = 'MOYEN';

    if (totalRevenus === 0 && totalDepenses === 0) {
      recommandation = '📊 Commencez à enregistrer vos revenus et dépenses pour obtenir une analyse financière.';
      risque = 'MOYEN';
    } else if (ratio >= 1.5) {
      recommandation = `💚 Excellent ratio revenus/dépenses (${ratio.toFixed(1)}x). Investissez dans des équipements modernes.`;
      risque = 'FAIBLE';
    } else if (ratio >= 1.0) {
      recommandation = `🟡 Bénéfice positif (${benefice.toLocaleString('fr-DZ')} DA). Réduisez les dépenses de 10% pour améliorer la marge.`;
      risque = 'MOYEN';
    } else {
      recommandation = `🔴 Dépenses supérieures aux revenus. Révisez votre budget et identifiez les postes à réduire en priorité.`;
      risque = 'ELEVE';
    }

    return {
      resultat: projectionAnnuelle !== 0
        ? `Projection: ${projectionAnnuelle >= 0 ? '+' : ''}${projectionAnnuelle.toLocaleString('fr-DZ')} DA/an`
        : 'Données financières insuffisantes',
      confiance: totalRevenus > 0 ? 85 : 40,
      recommandation,
      risque,
      facteurs: ['Revenus historiques', 'Dépenses courantes', 'Ratio R/D', 'Tendance'],
    };
  }

  /**
   * Génération de recommandations enrichies
   */
  private generateRecommandations(scores: any, ferme: any, weather: any): string[] {
    const recs: string[] = [];
    const nbCultures = ferme.terrains.reduce((acc: number, t: any) => acc + t.cultures.length, 0);
    const nbAnimaux = ferme.terrains.reduce((acc: number, t: any) => acc + t.animaux.length, 0);

    if (scores.rendement < 60) {
      recs.push(nbCultures === 0
        ? '🌱 Enregistrez vos cultures pour activer les prédictions de rendement'
        : '🌿 Améliorez les pratiques culturales : fertilisation et rotation des cultures');
    }

    if (scores.animaux < 60 && nbAnimaux > 0) {
      recs.push('🐄 Renforcez le suivi vétérinaire et vérifiez les conditions d\'hébergement');
    }

    if (scores.finances < 60) {
      recs.push('💰 Optimisez la gestion financière : réduisez les dépenses non essentielles');
    }

    // Recommandations météo
    if (weather) {
      if (weather.temperature > 35) {
        recs.push('☀️ Canicule détectée : irriguer tôt le matin, protégez les jeunes plants');
      }
      if (weather.humidity > 85) {
        recs.push('💧 Humidité très élevée : risque de maladies fongiques, traitez préventivement');
      }
      if (weather.forecastRain > 20) {
        recs.push('🌧️ Fortes pluies prévues : vérifiez le drainage de vos terrains');
      }
    }

    if (recs.length === 0) {
      recs.push('✅ Excellentes performances ! Maintenez vos bonnes pratiques agricoles');
      if (nbCultures > 5) recs.push('🏆 Diversité culturale optimale — continuez ainsi');
    }

    return recs;
  }

  /**
   * Génération du résumé
   */
  private generateResume(ferme: any, healthScore: FarmHealthScore): string {
    const nbCultures = ferme.terrains.reduce((acc: number, t: any) => acc + t.cultures.length, 0);
    const nbAnimaux = ferme.terrains.reduce((acc: number, t: any) => acc + t.animaux.length, 0);
    const totalRevenus = ferme.revenus.reduce((sum: number, r: any) => sum + r.montant, 0);

    return `🏡 ${ferme.nom}\n` +
           `📊 Score: ${healthScore.score}/100 (${healthScore.niveau})\n` +
           `🌱 ${nbCultures} cultures • 🐄 ${nbAnimaux} animaux\n` +
           `💰 Revenus: ${totalRevenus.toLocaleString('fr-DZ')} DA\n` +
           `💡 ${healthScore.recommandations.length} recommandation(s)`;
  }

  /**
   * Répond aux questions de l'assistant (version simple)
   */
  async askQuestion(fermeId: number, question: string): Promise<string> {
    const ferme = await db.ferme.findUnique({
      where: { id: fermeId },
      include: {
        terrains: {
          include: {
            cultures: { take: 10 },
            animaux: { take: 20 },
          },
        },
        depenses: { take: 10 },
        revenus: { take: 10 },
        predictions: { take: 5, orderBy: { date: 'desc' } },
      },
    });

    if (!ferme) return '⚠️ Ferme non trouvée';

    const q = question.toLowerCase();
    const nbCultures = ferme.terrains.reduce((acc, t) => acc + t.cultures.length, 0);
    const nbAnimaux = ferme.terrains.reduce((acc, t) => acc + t.animaux.length, 0);
    const totalRevenus = ferme.revenus.reduce((sum, r) => sum + r.montant, 0);
    const totalDepenses = ferme.depenses.reduce((sum, d) => sum + d.montant, 0);
    const typesCultures = [...new Set(ferme.terrains.flatMap(t => t.cultures.map(c => c.nom)))].join(', ');

    let reponse = '';

    if (q.includes('rendement') || q.includes('production') || q.includes('culture')) {
      const dernierRendement = ferme.predictions.find(p => p.type === 'RENDEMENT');
      reponse = `📈 **Analyse du rendement de ${ferme.nom}**\n\n` +
                `• ${nbCultures} culture(s) active(s)${typesCultures ? ` : ${typesCultures}` : ''}\n` +
                (dernierRendement ? `• Dernière prédiction : ${dernierRendement.resultat} (${dernierRendement.confiance}% confiance)\n` : '') +
                `\n💡 **Conseil** : ${nbCultures < 3 ? 'Diversifiez vos cultures pour réduire les risques.' : 'Maintenez la rotation des cultures et la fertilisation organique.'}`;
    }
    else if (q.includes('animal') || q.includes('maladie') || q.includes('santé') || q.includes('vétérinaire')) {
      reponse = `🐄 **Santé animale — ${ferme.nom}**\n\n` +
                `• ${nbAnimaux} animal(aux) enregistré(s)\n` +
                `• Surveillance : perte d'appétit, fièvre, comportement anormal\n` +
                `• Vaccinations : respectez le calendrier vétérinaire\n` +
                `\n💡 Visites vétérinaires recommandées : 2x/an minimum`;
    }
    else if (q.includes('irrigation') || q.includes('eau') || q.includes('arrosage')) {
      reponse = `💧 **Plan d'irrigation pour ${ferme.nom}**\n\n` +
                `• Besoin estimé : ${(1500 + nbCultures * 180).toLocaleString('fr-DZ')} L/ha/semaine\n` +
                `• Goutte-à-goutte recommandé (économie 40%)\n` +
                `• Arrosez tôt le matin (6h-8h)\n` +
                `\n💡 Installez des capteurs d'humidité pour automatiser l'irrigation`;
    }
    else if (q.includes('finance') || q.includes('benefice') || q.includes('revenu') || q.includes('dépense')) {
      const benefice = totalRevenus - totalDepenses;
      reponse = `💰 **Finances — ${ferme.nom}**\n\n` +
                `• Revenus : ${totalRevenus.toLocaleString('fr-DZ')} DA\n` +
                `• Dépenses : ${totalDepenses.toLocaleString('fr-DZ')} DA\n` +
                `• Bénéfice : ${benefice >= 0 ? '+' : ''}${benefice.toLocaleString('fr-DZ')} DA\n` +
                `\n💡 ${benefice < 0 ? 'Réduisez les dépenses non essentielles en priorité.' : 'Bonne santé financière ! Envisagez d\'investir dans du matériel.'}`;
    }
    else if (q.includes('météo') || q.includes('climat') || q.includes('pluie') || q.includes('température')) {
      reponse = `🌤️ **Météo agricole**\n\n` +
                `• Consultez les prévisions agricoles locales quotidiennement\n` +
                `• Adaptez l'irrigation selon les pluies prévues\n` +
                `• Protégez vos cultures en cas d'alerte gel ou grêle\n` +
                `\n💡 L'onglet Météo du tableau de bord affiche les données en temps réel`;
    }
    else {
      reponse = `🌾 **Assistant AgriBot — ${ferme.nom}**\n\n` +
                `Votre ferme en résumé :\n` +
                `• 🌱 ${nbCultures} culture(s)${typesCultures ? ` (${typesCultures})` : ''}\n` +
                `• 🐄 ${nbAnimaux} animal(aux)\n` +
                `• 💰 Revenus : ${totalRevenus.toLocaleString('fr-DZ')} DA\n\n` +
                `ℹ️ Posez une question précise sur : rendement, irrigation, animaux, finances, météo`;
    }

    return reponse;
  }
}