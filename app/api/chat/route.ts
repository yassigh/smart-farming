// app/api/chat/route.ts — IA enrichie avec données ferme réelles
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/db';

// ============================================================
// Contexte agricole local (fallback)
// ============================================================
const knowledgeBase: Record<string, string> = {
  tomate: "🍅 **Conseils Tomates**\n• Espacez les plants de 50 cm\n• Arrosez au pied le matin, jamais sur les feuilles\n• Taillez les gourmands régulièrement\n• Apportez du compost en début de saison\n• Récoltez quand elles sont bien rouges et fermes",
  maïs: "🌽 **Culture du Maïs**\n• Semez en lignes espacées de 80 cm\n• Sol réchauffé à min. 12°C\n• Arrosage régulier surtout à la floraison\n• Apportez de l'azote au stade 6-8 feuilles\n• Récoltez quand les grains sont bien jaunes",
  blé: "🌾 **Culture du Blé**\n• Semis d'automne idéal (Oct-Nov)\n• Densité : 200-250 kg/ha\n• Fertilisation azotée fractionnée\n• Traitement fongicide si humidité élevée\n• Récolte dès 14% d'humidité du grain",
  maladie: "🔬 **Prévention Maladies**\n• Surveillez les taches et décolorations foliaires\n• Vérifiez le dessous des feuilles (insectes)\n• Isolez immédiatement les plantes malades\n• Purin d'ortie : excellent traitement naturel\n• Rotation des cultures pour rompre le cycle des maladies",
  engrais: "🌱 **Fertilisation**\n• Analysez votre sol avant tout apport\n• Compost maison : apport en automne\n• Fumier bien décomposé : 20-30 t/ha\n• Engrais verts (légumineuses) pour l'azote\n• pH idéal du sol : 6.0 à 7.0",
  arrosage: "💧 **Irrigation Optimale**\n• Arrosez tôt le matin ou en soirée\n• Goutte-à-goutte : économie de 40% d'eau\n• Paillage pour réduire l'évaporation\n• Vérifiez l'humidité à 30 cm de profondeur\n• Adaptez selon la météo locale",
  animal: "🐄 **Santé Animale**\n• Surveillez l'appétit et le comportement\n• Vaccinations à jour selon le calendrier\n• Contrôle vétérinaire 2x/an minimum\n• Litière propre et sèche en permanence\n• Isolez tout animal présentant des symptômes",
  finance: "💰 **Gestion Financière**\n• Suivez vos charges vs revenus mensuellement\n• Visez un ratio revenus/dépenses > 1.3\n• Diversifiez les sources de revenus\n• Anticipez les besoins en trésorerie\n• Investissez dans l'automatisation progressive",
  météo: "🌤️ **Adaptation Météo**\n• Consultez les prévisions agricoles quotidiennement\n• Protégez les cultures sensibles du gel\n• Prévoyez des réserves d'eau pour les sécheresses\n• Installez des brise-vent pour réduire l'évaporation\n• Adaptez les semis selon les prévisions saisonnières",
  sol: "🌍 **Gestion du Sol**\n• Analyse du sol tous les 2-3 ans\n• Évitez le tassement (ne travaillez pas humide)\n• Rotation des cultures pour maintenir la fertilité\n• Matière organique : clé de la vie du sol\n• Couvre-sol en hiver pour éviter l'érosion",
  récolte: "🌿 **Optimisation Récolte**\n• Récoltez au bon stade de maturité\n• Le matin est le meilleur moment (plantes fraîches)\n• Utilisez des outils adaptés et désinfectés\n• Conditionnement rapide après récolte\n• Stockez selon les températures recommandées",
  irrigation: "💧 **Système d'Irrigation**\n• Goutte-à-goutte : le plus efficace (95% efficacité)\n• Aspersion : idéale pour grandes surfaces\n• Planifiez selon l'évapotranspiration\n• Automatisez avec des capteurs d'humidité\n• Économisez jusqu'à 50% d'eau vs arrosage manuel",
};

// ============================================================
// Construction du contexte de la ferme depuis la BDD
// ============================================================
async function buildFarmContext(fermeId: number): Promise<string> {
  try {
    const ferme = await db.ferme.findUnique({
      where: { id: fermeId },
      include: {
        terrains: {
          include: {
            cultures: { orderBy: { datePlantation: 'desc' }, take: 10 },
            animaux: { take: 20 },
          },
        },
        depenses: { orderBy: { date: 'desc' }, take: 5 },
        revenus: { orderBy: { date: 'desc' }, take: 5 },
        predictions: {
          orderBy: { date: 'desc' },
          take: 5,
          include: { conseils: { take: 2 } },
        },
      },
    });

    if (!ferme) return '';

    const nbCultures = ferme.terrains.reduce((acc, t) => acc + t.cultures.length, 0);
    const nbAnimaux = ferme.terrains.reduce((acc, t) => acc + t.animaux.length, 0);
    const totalRevenus = ferme.revenus.reduce((sum, r) => sum + r.montant, 0);
    const totalDepenses = ferme.depenses.reduce((sum, d) => sum + d.montant, 0);
    const benefice = totalRevenus - totalDepenses;

    const typesCultures = ferme.terrains
      .flatMap(t => t.cultures.map(c => c.nom))
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 8)
      .join(', ');

    const typesAnimaux = ferme.terrains
      .flatMap(t => t.animaux.map(a => a.type))
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5)
      .join(', ');

    const dernieresPredictions = ferme.predictions
      .map(p => `- ${p.type}: ${p.resultat} (confiance: ${p.confiance}%)`)
      .join('\n');

    return `
DONNÉES RÉELLES DE LA FERME "${ferme.nom}":
- Superficie: ${ferme.superficie || 'Non renseignée'} ha
- Nombre de terrains: ${ferme.terrains.length}
- Cultures actives (${nbCultures} au total): ${typesCultures || 'Aucune'}
- Animaux (${nbAnimaux} au total): ${typesAnimaux || 'Aucun'}
- Revenus récents: ${totalRevenus.toLocaleString('fr-DZ')} DA
- Dépenses récentes: ${totalDepenses.toLocaleString('fr-DZ')} DA
- Bénéfice/Perte: ${benefice >= 0 ? '+' : ''}${benefice.toLocaleString('fr-DZ')} DA
- Dernières prédictions IA:
${dernieresPredictions || '  Aucune prédiction générée'}
`;
  } catch (error) {
    console.error('[Chat] Erreur chargement contexte ferme:', error);
    return '';
  }
}

// ============================================================
// Appel Gemini avec contexte complet
// ============================================================
async function callGemini(
  message: string,
  farmContext: string,
  token: string
): Promise<string | null> {
  const systemPrompt = `Tu es AgriBot, un assistant agricole expert pour Smart Ferme. Tu dois:
1. Analyser les données réelles de la ferme fournies
2. Donner des conseils PRÉCIS et PERSONNALISÉS basés sur ces données
3. Répondre toujours en français, de manière claire et structurée
4. Utiliser des emojis pertinents pour rendre la réponse lisible
5. Être concis mais complet (max 200 mots)

${farmContext ? farmContext : 'Ferme sans données spécifiques disponibles.'}`;

  const fullPrompt = `${systemPrompt}\n\nQuestion de l'agriculteur: ${message}`;

  try {
    const ai = new GoogleGenAI({ apiKey: token });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: fullPrompt,
    });

    let reply = (response.text || '').trim();
    if (!reply || reply.length < 5) return null;

    return reply.length > 10 ? reply : null;
  } catch (error: any) {
    console.warn('[Gemini] Erreur réseau/API:', error.message);
    return null;
  }
}

// ============================================================
// Fallback local intelligent basé sur les données de la ferme
// ============================================================
function getLocalResponse(message: string, farmContext: string): string {
  const lowerMsg = message.toLowerCase();

  // Chercher une correspondance dans la base de connaissances
  for (const [keyword, response] of Object.entries(knowledgeBase)) {
    if (lowerMsg.includes(keyword)) {
      return response;
    }
  }

  // Réponses contextuelles
  if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut') || lowerMsg.includes('hello')) {
    return "👋 **Bonjour !** Je suis AgriBot, votre assistant Smart Ferme.\n\nJe peux vous conseiller sur :\n🌱 Cultures et semis\n💧 Irrigation et eau\n🐄 Santé animale\n💰 Finances agricoles\n🌤️ Adaptation météo\n🔬 Maladies et traitements\n\nPosez votre question !";
  }

  if (lowerMsg.includes('merci')) {
    return "🙏 Avec plaisir ! N'hésitez pas si vous avez d'autres questions. Bonne récolte ! 🌾";
  }

  if (lowerMsg.includes('aide') || lowerMsg.includes('que faire') || lowerMsg.includes('comment')) {
    return "📋 **Je peux vous aider sur :**\n\n🌱 Cultures (tomates, maïs, blé, légumes)\n💧 Irrigation et gestion de l'eau\n🌿 Engrais et fertilisation\n🔬 Détection et traitement des maladies\n🐄 Santé et élevage animal\n💰 Finances et rentabilité\n🌤️ Adaptation aux conditions météo\n🌍 Gestion du sol\n\nPosez une question précise pour des conseils personnalisés !";
  }

  // Réponse générale avec contexte
  if (farmContext) {
    return `🌾 **Assistant AgriBot**\n\nJe n'ai pas trouvé de réponse spécifique à votre question dans mes connaissances locales. Voici ce que je vous suggère :\n\n• Reformulez votre question avec des mots-clés comme : *tomate, maïs, irrigation, maladie, engrais, animal, finance*\n• Ou consultez un expert agricole local pour des conseils personnalisés\n\n💡 **Astuce** : Cliquez sur une des suggestions ci-dessous pour un conseil rapide !`;
  }

  return "🌾 **AgriBot** à votre service !\n\nPosez-moi une question sur :\n• Cultures et semis\n• Irrigation\n• Maladies\n• Finances\n• Animaux\n• Météo et sol";
}

// ============================================================
// Route principale POST
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, fermeId } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 });
    }

    const token =
      process.env.GEMINI_API_KEY || '';

    // 1. Construire le contexte de la ferme
    let farmContext = '';
    if (fermeId) {
      farmContext = await buildFarmContext(Number(fermeId));
    }

    let reply = '';
    let source: 'gemini' | 'local' = 'local';

    // 2. Essayer Gemini
    if (token) {
      const geminiReply = await callGemini(message, farmContext, token);
      if (geminiReply) {
        reply = geminiReply;
        source = 'gemini';
      }
    }

    // 3. Fallback local
    if (!reply) {
      reply = getLocalResponse(message, farmContext);
      source = 'local';
    }

    // 4. Sauvegarder le conseil en base si fermeId fourni
    if (fermeId && reply) {
      try {
        // Chercher la dernière prédiction de la ferme pour lier le conseil
        const lastPrediction = await db.prediction.findFirst({
          where: { fermeId: Number(fermeId) },
          orderBy: { date: 'desc' },
        });

        if (lastPrediction) {
          await db.conseil.create({
            data: {
              description: `❓ ${message.slice(0, 100)}\n\n${reply.slice(0, 500)}`,
              date: new Date(),
              predictionId: lastPrediction.id,
            },
          });
        }
      } catch (dbError) {
        // Ne pas bloquer la réponse si la sauvegarde échoue
        console.warn('[Chat] Impossible de sauvegarder le conseil:', dbError);
      }
    }

    return NextResponse.json({
      reply,
      source,
      hasFarmContext: !!farmContext,
    });
  } catch (error) {
    console.error('❌ Erreur chat:', error);
    return NextResponse.json({
      reply:
        "🌾 Une erreur est survenue. Conseil général : arrosez vos cultures le matin et surveillez l'apparition de maladies. Reformulez votre question !",
      source: 'local',
    });
  }
}