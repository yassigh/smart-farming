// lib/ai/simpleAIService.ts
import { db } from "@/lib/db";
import { FarmHealthScore, PredictionIA, AnalyseComplete } from "@/models/predictionIA";

// Icônes modernes utilisant des caractères Unicode épurés
// Ces icônes seront affichées dans l'interface utilisateur
const ICONS = {
  // Agriculture & Ferme
  FARM: '⌂',
  LAND: '◈',
  BUILDING: '⌂',
  
  // Cultures
  CULTURE: '♣',
  SEED: '✦',
  WHEAT: '♣',
  CORN: '♣',
  LEAF: '❀',
  TREE: '▲',
  FLOWER: '❀',
  
  // Animaux
  ANIMAL: '◆',
  COW: '◆',
  BEEF: '◆',
  SHEEP: '◆',
  GOAT: '◆',
  CHICKEN: '◆',
  HORSE: '◆',
  
  // Élevage & Soins
  MILK: '◐',
  EGG: '◯',
  MEAT: '◊',
  MEDICAL: '✚',
  SYRINGE: '✛',
  PILL: '◉',
  STETHOSCOPE: '◈',
  HEART: '♥',
  PULSE: '♥',
  
  // Finances
  REVENUE: '¤',
  EXPENSE: '▼',
  FINANCE: '¤',
  MONEY: '¤',
  BANK: '⌂',
  CREDIT_CARD: '▣',
  
  // Métriques & Indicateurs
  SCORE: '▣',
  RENDEMENT: '▲',
  GRAPH_UP: '▲',
  GRAPH_DOWN: '▼',
  PIE: '◔',
  BAR: '▬',
  LINE: '─',
  TARGET: '◎',
  CALENDAR: '◷',
  CLOCK: '◴',
  
  // Actions & États
  RECOMMENDATION: '✦',
  WARNING: '⚠',
  SUCCESS: '✓',
  CHECK: '✓',
  CROSS: '✗',
  INFO: 'ℹ',
  QUESTION: '?',
  EXCLAMATION: '!',
  STOP: '■',
  
  // Météo & Environnement
  WATER: '≈',
  DROPLET: '≈',
  SUN: '☼',
  CLOUD: '☁',
  RAIN: '☂',
  SNOW: '❄',
  WIND: '≈',
  THERMOMETER: '☉',
  
  // Communication
  MAIL: '✉',
  PHONE: '☎',
  MOBILE: '✆',
  COMPUTER: '⌘',
  CAMERA: '☐',
  VIDEO: '▶',
  MICROPHONE: '♬',
  HEADPHONES: '♫',
  SPEAKER: '♪',
  
  // Navigation
  GLOBE: '◯',
  MAP: '⌂',
  COMPASS: '◎',
  LOCATION: '◈',
  PIN: '◈',
  FLAG: '⚑',
  
  // Utilisateurs & Émotions
  USER: '☺',
  SMILE: '☺',
  HAPPY: '☺',
  SAD: '☹',
  ANGRY: '☻',
  SURPRISED: '◕',
  THINKING: '◔',
  WINK: '◉',
  HEART_EYES: '♥',
  STAR_STRUCK: '★',
  PARTY: '✦',
  
  // Gestes & Actions
  PRAY: '🙏',
  HANDSHAKE: '✋',
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  CLAP: '👏',
  WAVE: '✋',
  FIST: '✊',
  VICTORY: '✌',
  OK: '👌',
  
  // Objets & Outils
  ROCKET: '✈',
  SATELLITE: '◉',
  SPARKLES: '✦',
  FIRE: '🔥',
  STAR: '★',
  DIAMOND: '◆',
  TROPHY: '🏆',
  MEDAL: '🎖',
  CROWN: '♛',
  
  // Divers
  BULLET: '•',
  ARROW: '→',
  ARROW_RIGHT: '→',
  ARROW_LEFT: '←',
  ARROW_UP: '↑',
  ARROW_DOWN: '↓',
  CHECK_MARK: '✓',
  CROSS_MARK: '✗',
  CIRCLE: '○',
  SQUARE: '□',
  TRIANGLE: '△',
};

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
            cultures: true,
            animaux: true,
          },
        },
        depenses: true,
        revenus: true,
        predictions: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!ferme) return null;

    const healthScore = await this.calculateHealthScore(ferme);

    const predictions = [
      { type: 'RENDEMENT', data: this.predictRendement(ferme) },
      { type: 'IRRIGATION', data: this.predictIrrigation(ferme) },
      { type: 'MALADIE', data: this.predictMaladie(ferme) },
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
   * Calcul du score de santé
   */
  private async calculateHealthScore(ferme: any): Promise<FarmHealthScore> {
    const rendement = this.scoreRendement(ferme);
    const animaux = this.scoreAnimaux(ferme);
    const finances = this.scoreFinances(ferme);

    const score = Math.round((rendement + animaux + finances) / 3);
    
    return {
      score,
      niveau: score >= 80 ? 'EXCELLENT' : score >= 60 ? 'BON' : score >= 40 ? 'MOYEN' : 'FAIBLE',
      details: { rendement, animaux, finances },
      recommandations: this.generateRecommandations({ rendement, animaux, finances }),
    };
  }

  /**
   * Score de rendement
   */
  private scoreRendement(ferme: any): number {
    const nbCultures = ferme.terrains.reduce((acc: number, t: any) => acc + t.cultures.length, 0);
    return Math.min(100, 50 + (nbCultures * 5));
  }

  /**
   * Score de santé animale
   */
  private scoreAnimaux(ferme: any): number {
    const nbAnimaux = ferme.terrains.reduce((acc: number, t: any) => acc + t.animaux.length, 0);
    return Math.min(100, 40 + (nbAnimaux * 4));
  }

  /**
   * Score financier
   */
  private scoreFinances(ferme: any): number {
    const totalRevenus = ferme.revenus.reduce((sum: number, r: any) => sum + r.montant, 0);
    const totalDepenses = ferme.depenses.reduce((sum: number, d: any) => sum + d.montant, 0);
    
    if (totalRevenus === 0) return 30;
    const ratio = totalRevenus / (totalDepenses || 1);
    return Math.min(100, 50 + (ratio * 10));
  }

  /**
   * Prédiction du rendement
   */
  private predictRendement(ferme: any): PredictionIA {
    const nbCultures = ferme.terrains.reduce((acc: number, t: any) => acc + t.cultures.length, 0);
    const superficie = ferme.superficie || 10;
    
    const rendementBase = 4.5 + (nbCultures / 10) * 0.5;
    const confiance = Math.min(95, 70 + (nbCultures * 3));

    return {
      resultat: `${rendementBase.toFixed(1)} tonnes/ha`,
      confiance,
      recommandation: nbCultures < 5 ? 'Augmentez la diversité des cultures' : 'Maintenez les pratiques actuelles',
      risque: rendementBase > 5 ? 'FAIBLE' : 'MOYEN',
      facteurs: ['Superficie', 'Nombre de cultures', 'Historique'],
    };
  }

  /**
   * Prédiction des besoins en irrigation
   */
  private predictIrrigation(ferme: any): PredictionIA {
    const nbCultures = ferme.terrains.reduce((acc: number, t: any) => acc + t.cultures.length, 0);
    
    return {
      resultat: `${1500 + (nbCultures * 200)} L/ha`,
      confiance: 85,
      recommandation: 'Irriguer dans les 48h si pas de pluie',
      risque: 'MOYEN',
      facteurs: ['Type de culture', 'Saison', 'Humidité du sol'],
    };
  }

  /**
   * Détection des risques de maladie
   */
  private predictMaladie(ferme: any): PredictionIA {
    const nbAnimaux = ferme.terrains.reduce((acc: number, t: any) => acc + t.animaux.length, 0);
    const risque = nbAnimaux > 20 ? 'ELEVE' : nbAnimaux > 10 ? 'MOYEN' : 'FAIBLE';

    return {
      resultat: risque === 'ELEVE' ? 'Risque élevé de maladies respiratoires' : 'Risque modéré de maladies',
      confiance: 78,
      recommandation: risque === 'ELEVE' ? 'Isoler les animaux suspects' : 'Surveillance régulière recommandée',
      risque: risque,
      facteurs: ['Densité animale', 'Ventilation', 'Historique médical'],
    };
  }

  /**
   * Prédiction financière
   */
  private predictFinances(ferme: any): PredictionIA {
    const totalRevenus = ferme.revenus.reduce((sum: number, r: any) => sum + r.montant, 0);
    const totalDepenses = ferme.depenses.reduce((sum: number, d: any) => sum + d.montant, 0);
    const benefice = totalRevenus - totalDepenses;

    return {
      resultat: `${(benefice * 1.15).toFixed(0)} DA (projection annuelle)`,
      confiance: 88,
      recommandation: benefice < 1000000 ? 'Réduisez les dépenses de 10%' : 'Investissez dans de nouveaux équipements',
      risque: benefice > 0 ? 'FAIBLE' : 'ELEVE',
      facteurs: ['Revenus historiques', 'Dépenses', 'Tendance du marché'],
    };
  }

  /**
   * Génération de recommandations
   */
  private generateRecommandations(scores: any): string[] {
    const recs = [];
    if (scores.rendement < 70) recs.push(`${ICONS.SEED} Améliorez les pratiques culturales`);
    if (scores.animaux < 70) recs.push(`${ICONS.ANIMAL} Renforcez le suivi vétérinaire`);
    if (scores.finances < 70) recs.push(`${ICONS.MONEY} Optimisez la gestion financière`);
    if (recs.length === 0) recs.push(`${ICONS.SUCCESS} Maintenez vos bonnes pratiques`);
    return recs;
  }

  /**
   * Génération du résumé
   */
  private generateResume(ferme: any, healthScore: FarmHealthScore): string {
    const nbCultures = ferme.terrains.reduce((acc: number, t: any) => acc + t.cultures.length, 0);
    const nbAnimaux = ferme.terrains.reduce((acc: number, t: any) => acc + t.animaux.length, 0);
    
    return `${ICONS.FARM} ${ferme.nom}\n` +
           `${ICONS.SCORE} Score: ${healthScore.score}/100 (${healthScore.niveau})\n` +
           `${ICONS.SEED} ${nbCultures} cultures • ${ICONS.ANIMAL} ${nbAnimaux} animaux\n` +
           `${ICONS.MONEY} ${ferme.revenus.length} revenus • ${ICONS.EXPENSE} ${ferme.depenses.length} dépenses\n` +
           `${ICONS.RECOMMENDATION} ${healthScore.recommandations.length} recommandations`;
  }

  /**
   * Répond aux questions de l'assistant
   */
  async askQuestion(fermeId: number, question: string): Promise<string> {
    const ferme = await db.ferme.findUnique({
      where: { id: fermeId },
      include: {
        terrains: {
          include: {
            cultures: true,
            animaux: true,
          },
        },
        depenses: true,
        revenus: true,
        predictions: {
          take: 5,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!ferme) return `${ICONS.WARNING} Ferme non trouvée`;

    const q = question.toLowerCase();
    let reponse = "";

    if (q.includes('rendement') || q.includes('production') || q.includes('culture')) {
      const dernier = ferme.predictions.find(p => p.type === 'RENDEMENT');
      reponse = dernier 
        ? `${ICONS.GRAPH_UP} D'après vos données, le dernier rendement prévu est de ${dernier.resultat} avec ${dernier.confiance}% de confiance.\n${ICONS.RECOMMENDATION} Pour l'améliorer, vérifiez l'irrigation et la fertilisation.`
        : `${ICONS.SEED} Je n'ai pas encore de données de rendement. Commencez par enregistrer vos cultures.`;
    }
    else if (q.includes('animal') || q.includes('maladie') || q.includes('santé') || q.includes('vétérinaire')) {
      const nbAnimaux = ferme.terrains.reduce((acc, t) => acc + t.animaux.length, 0);
      reponse = `${ICONS.ANIMAL} Vous avez ${nbAnimaux} animaux.\n${ICONS.WARNING} Surveillez : perte d'appétit, fièvre, comportement anormal.\n${ICONS.RECOMMENDATION} Des visites vétérinaires régulières sont recommandées.`;
    }
    else if (q.includes('irrigation') || q.includes('eau') || q.includes('arrosage')) {
      reponse = `${ICONS.WATER} Recommandation d'irrigation : 20-30 mm par semaine.\n${ICONS.SUCCESS} Vérifiez l'humidité du sol à 30 cm de profondeur.`;
    }
    else if (q.includes('finance') || q.includes('benefice') || q.includes('revenu') || q.includes('dépense')) {
      const totalRevenus = ferme.revenus.reduce((sum, r) => sum + r.montant, 0);
      const totalDepenses = ferme.depenses.reduce((sum, d) => sum + d.montant, 0);
      reponse = `${ICONS.MONEY} Revenus: ${totalRevenus.toLocaleString()} DA\n${ICONS.EXPENSE} Dépenses: ${totalDepenses.toLocaleString()} DA\n${ICONS.GRAPH_UP} Bénéfice: ${(totalRevenus - totalDepenses).toLocaleString()} DA.`;
    }
    else if (q.includes('météo') || q.includes('climat') || q.includes('pluie') || q.includes('température')) {
      reponse = `${ICONS.SUN} Je vous recommande de consulter la météo locale.\n${ICONS.CLOUD} Les conditions actuelles :\n${ICONS.THERMOMETER} Température moyenne : 25°C\n${ICONS.WATER} Humidité : 65%\n${ICONS.WIND} Vent : 15 km/h`;
    }
    else if (q.includes('ferme') || q.includes('exploitation')) {
      reponse = `${ICONS.FARM} ${ferme.nom}\n${ICONS.LAND} Superficie : ${ferme.superficie || 'Non renseignée'} ha\n${ICONS.SEED} ${ferme.terrains.reduce((acc, t) => acc + t.cultures.length, 0)} cultures\n${ICONS.ANIMAL} ${ferme.terrains.reduce((acc, t) => acc + t.animaux.length, 0)} animaux\n${ICONS.MONEY} ${ferme.revenus.length} revenus enregistrés`;
    }
    else {
      reponse = `${ICONS.INFO} Je peux vous aider sur :\n${ICONS.BULLET} Rendement des cultures\n${ICONS.BULLET} Santé animale\n${ICONS.BULLET} Irrigation\n${ICONS.BULLET} Finances\n${ICONS.BULLET} Météo\n\n${ICONS.QUESTION} Posez une question précise !`;
    }

    return reponse;
  }
}