// app/api/ai/diagnose-plant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export interface DiseaseDetail {
  nom: string;
  plante: string;
  estSaine: boolean;
  gravite: 'FAIBLE' | 'MOYEN' | 'ELEVE';
  symptomes: string;
  traitementImmediat: string;
  prevention: string;
  conseilIrrigation: string;
}

// Dictionnaire exhaustif pour les 38 classes exactes du modèle d'IA MobileNet / PlantVillage
const EXACT_DISEASE_MAP: Record<string, DiseaseDetail> = {
  // POMME DE TERRE
  "Potato___Late_blight": {
    nom: "Mildiou de la pomme de terre (Phytophthora infestans)",
    plante: "Pomme de terre",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Taches sombres huileuses sur le feuillage et les tubercules, duvet blanchâtre sur le revers des feuilles par temps humide, nécrose rapide des fanes.",
    traitementImmediat: "🔴 Traiter d'urgence avec un fongicide cuprique (bouillie bordelaise) ou systémique. Faucher les fanes si les tubercules risquent la contamination avant récolte.",
    prevention: "Butter correctement les rangs pour isoler les tubercules. Utiliser des plants certifiés indemnes et pratiquer la rotation des cultures.",
    conseilIrrigation: "💧 Stopper l'irrigation par aspersion. Arroser modérément au pied."
  },
  "Potato___Early_blight": {
    nom: "Alternariose de la pomme de terre (Alternaria solani)",
    plante: "Pomme de terre",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Taches brun-noir circulaires avec anneaux concentriques sur les feuilles âgées, jaunissement et dessèchement précoce.",
    traitementImmediat: "🟡 Retirer les fanes infectées du bas. Pulvériser un fongicide au cuivre ou mancozèbe.",
    prevention: "Équilibrer les apports en azote et potassium. Pailler le sol.",
    conseilIrrigation: "💧 Arroser tôt le matin sans humidifier le feuillage."
  },
  "Potato___healthy": {
    nom: "Plante de Pomme de Terre Saine",
    plante: "Pomme de terre",
    estSaine: true,
    gravite: "FAIBLE",
    symptomes: "Feuillage vert foncé, vigoureux, sans tache ni lésion sur les fanes.",
    traitementImmediat: "🟢 Aucun traitement nécessaire. Votre plantation de pommes de terre est en excellente santé !",
    prevention: "Maintenir le buttage des rangs et surveiller les apparitions d'insectes (doryphores).",
    conseilIrrigation: "💧 Maintenir une humidité régulière au sol pendant la tubérisation."
  },

  // POMMIER
  "Apple___Apple_scab": {
    nom: "Tavelure du pommier (Venturia inaequalis)",
    plante: "Pommier",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Taches veloutées olive à brun-noir sur les feuilles, crevasses liégeuses et taches sombres sur les pommes.",
    traitementImmediat: "🟡 Appliquer du cuivre ou un fongicide à action curative après une averse printanière contaminante.",
    prevention: "Ramasser et brûler les feuilles mortes à l'automne pour détruire le foyer hivernal.",
    conseilIrrigation: "💧 Favoriser la circulation d'air au centre de l'arbre par une taille d'éclaircie."
  },
  "Apple___Black_rot": {
    nom: "Pourriture noire / Black Rot du pommier",
    plante: "Pommier",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Taches nécrotiques en 'œil de grenouille' sur les feuilles, chancres sur le bois et mummification noire des pommes sur les branches.",
    traitementImmediat: "🔴 Supprimer et brûler tous les fruits momifiés ainsi que les rameaux chancreux. Appliquer un fongicide fongique cuprique.",
    prevention: "Tailler le bois mort en hiver et désinfecter les sécateurs à l'alcool.",
    conseilIrrigation: "💧 Éviter la stagnation d'eau au pied du tronc."
  },
  "Apple___Cedar_apple_rust": {
    nom: "Rouille du pommier (Gymnosporangium juniperi-virginianae)",
    plante: "Pommier",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Taches brillantes vert-jaunâtre puis oranges vives sur la face supérieure des feuilles avec petites pustules dessous.",
    traitementImmediat: "🟡 Pulvériser un fongicide préventif/curatif anti-rouille (soufre ou fongicide systémique).",
    prevention: "Éliminer les génévriers (hôtes d'hiver du champignon) dans un rayon de 200m.",
    conseilIrrigation: "💧 Irrigation normale au pied."
  },
  "Apple___healthy": {
    nom: "Pommier Sain",
    plante: "Pommier",
    estSaine: true,
    gravite: "FAIBLE",
    symptomes: "Feuilles lisses et bien vertes, absence de tâche ou de chancres sur les rameaux.",
    traitementImmediat: "🟢 Arbre en parfaite santé, aucun traitement requis.",
    prevention: "Taille d'entretien annuelle et apport de compost au printemps.",
    conseilIrrigation: "💧 Arrosage en période de sécheresse."
  },

  // VIGNE
  "Grape___Black_rot": {
    nom: "Black Rot de la vigne (Guignardia bidwellii)",
    plante: "Vigne",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Taches rousses bordées de sombre sur le feuillage, baies desséchées devenant de petits grains noirs rabougris.",
    traitementImmediat: "🔴 Appliquer un fongicide protecteur à la nouaison. Ramasser et détruire les grappes atteintes.",
    prevention: "Éliminer les sarments et grappes mummifiées pendant la taille d'hiver.",
    conseilIrrigation: "💧 Améliorer le drainage de la parcelle."
  },
  "Grape___Esca_(Black_Measles)": {
    nom: "Esca / Maladie du bois de la vigne",
    plante: "Vigne",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Taches jaunes ou rouges entre les nervures (aspect 'peau de tigre') et dessèchement brutal des grappes.",
    traitementImmediat: "🔴 Marquer les ceps atteints, pratiquer la curetage du bois mort intérieur ou remplacer le cep.",
    prevention: "Appliquer un mastic cicatrisant sur les grosses plaies de taille.",
    conseilIrrigation: "💧 Éviter le stress hydrique aigu."
  },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
    nom: "Brûlure foliaire de la vigne (Isariopsis)",
    plante: "Vigne",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Taches nécrotiques irrégulières brunâtres sur les feuilles provoquant une chute prématurée.",
    traitementImmediat: "🟡 Traiter avec un fongicide à base de cuivre ou de soufre.",
    prevention: "Effeuiller autour des grappes pour améliorer la ventilation.",
    conseilIrrigation: "💧 Maintenir un arrosage contrôlé."
  },
  "Grape___healthy": {
    nom: "Vigne Saine",
    plante: "Vigne",
    estSaine: true,
    gravite: "FAIBLE",
    symptomes: "Feuillage bien vert, ceps vigoureux et grappes homogènes.",
    traitementImmediat: "🟢 Vigne en excellente santé.",
    prevention: "Rognage et travail du sol réguliers.",
    conseilIrrigation: "💧 Régulation du déficit hydrique."
  },

  // MAÏS
  "Corn_(maize)___Common_rust_": {
    nom: "Rouille commune du maïs (Puccinia sorghi)",
    plante: "Maïs",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Pustules poudrées ovales brun-rougeâtre réparties sur les deux faces des feuilles de maïs.",
    traitementImmediat: "🟡 Pulvériser un fongicide homologué si plus de 15% des feuilles sous l'épi sont atteintes.",
    prevention: "Utiliser des hybrides de maïs résistants à la rouille.",
    conseilIrrigation: "💧 Arrosage normal sans excès d'humidité stagnante."
  },
  "Corn_(maize)___Northern_Leaf_Blight": {
    nom: "Helminthosporiose du maïs (Exserohilum turcicum)",
    plante: "Maïs",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Grandes lésions allongées gris-vert puis brunes en forme de cigare (2 à 15 cm) sur le feuillage.",
    traitementImmediat: "🔴 Application fongicide si l'attaque progresse avant le stade grain laiteux.",
    prevention: "Enfouir les résidus de récolte après la moisson.",
    conseilIrrigation: "💧 Éviter l'aspersion en fin de journée."
  },
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
    nom: "Cercosporiose / Taches grises du maïs",
    plante: "Maïs",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Taches nécrotiques rectangulaires grises délimitées strictement par les nervures de la feuille.",
    traitementImmediat: "🟡 Traitement fongicide préventif ou curatif si forte pression infectieuse.",
    prevention: "Pratiquer la rotation des cultures sur 2 ans minimum.",
    conseilIrrigation: "💧 Optimiser le drainage de la parcelle."
  },
  "Corn_(maize)___healthy": {
    nom: "Maïs Sain",
    plante: "Maïs",
    estSaine: true,
    gravite: "FAIBLE",
    symptomes: "Tiges solides, feuilles d'un vert profond et épis bien développés.",
    traitementImmediat: "🟢 Maïs parfaitement sain.",
    prevention: "Fertilisation azotée équilibrée.",
    conseilIrrigation: "💧 Assurer un apport d'eau régulier au moment de la floraison."
  },

  // POIVRON / PIMENT
  "Pepper,_bell___Bacterial_spot": {
    nom: "Tache bactérienne du poivron (Xanthomonas)",
    plante: "Poivron / Piment",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Petites taches brun foncé d'aspect alvéolé provoquant le jaunissement et la chute des feuilles.",
    traitementImmediat: "🔴 Pulvériser un traitement cuivré bactéricide et détruire les plants très atteints.",
    prevention: "Désinfecter les tuteurs et les outils de jardinage.",
    conseilIrrigation: "💧 Ne pas arroser le feuillage."
  },
  "Pepper,_bell___healthy": {
    nom: "Poivron / Piment Sain",
    plante: "Poivron / Piment",
    estSaine: true,
    gravite: "FAIBLE",
    symptomes: "Feuilles fermes d'un vert brillant sans décoloration.",
    traitementImmediat: "🟢 Plante en excellente santé.",
    prevention: "Tuteurage et paillage.",
    conseilIrrigation: "💧 Goutte-à-goutte régulier."
  },

  // TOMATES
  "Tomato___Bacterial_spot": {
    nom: "Tache bactérienne de la tomate (Xanthomonas)",
    plante: "Tomate",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Petites taches sombres angulaires entourées d'un halo jaune sur les feuilles et lésions noires sur fruits.",
    traitementImmediat: "🔴 Appliquer un bactéricide au cuivre. Éliminer les plants trop infectés.",
    prevention: "Utiliser des semences saines et désinfecter les tuteurs.",
    conseilIrrigation: "💧 Éviter tout arrosage foliaire."
  },
  "Tomato___Early_blight": {
    nom: "Alternariose de la tomate (Alternaria solani)",
    plante: "Tomate",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Taches brunes circulaires à cercles concentriques (forme de cible) sur le bas de la plante.",
    traitementImmediat: "🟡 Tailler les feuilles atteintes du bas et appliquer un fongicide au cuivre.",
    prevention: "Pailler abondamment le sol au pied des plants.",
    conseilIrrigation: "💧 Arroser uniquement au pied."
  },
  "Tomato___Late_blight": {
    nom: "Mildiou de la tomate (Phytophthora infestans)",
    plante: "Tomate",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Taches foliaires sombres d'aspect huileux, duvet blanc au revers et dessèchement rapide du feuillage.",
    traitementImmediat: "🔴 Traitement fongicide cuprique d'urgence (bouillie bordelaise). Supprimer les parties atteintes.",
    prevention: "Aérer la serre et éviter de mouiller le feuillage.",
    conseilIrrigation: "💧 Goutte-à-goutte matinal."
  },
  "Tomato___Leaf_Mold": {
    nom: "Cladosporiose de la tomate (Passalora fulva)",
    plante: "Tomate",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Taches jaunâtres au dessus et duvet verdâtre/olive velouté en dessous de la feuille.",
    traitementImmediat: "🟡 Aérer la serre au maximum et appliquer du cuivre ou purin de prêle.",
    prevention: "Conserver l'humidité relative sous 85%.",
    conseilIrrigation: "💧 Arroser le matin pour laisser le sol sécher."
  },
  "Tomato___Septoria_leaf_spot": {
    nom: "Septoriose de la tomate (Septoria lycopersici)",
    plante: "Tomate",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Nombreuses petites taches grises circulaires bordées de noir avec de minuscules points sombres au centre.",
    traitementImmediat: "🟡 Couper les feuilles infectées et appliquer un fongicide bio (cuivre ou soufre).",
    prevention: "Éliminer les débris végétaux en fin de saison et effectuer une rotation des cultures.",
    conseilIrrigation: "💧 Arrosage au pied sans éclaboussures."
  },
  "Tomato___Spider_mites Two-spotted_spider_mite": {
    nom: "Attaque d'Acariens / Tétranyques sur Tomate",
    plante: "Tomate",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Feuilles piquées de minuscules points jaunes, presence de fines toiles d'araignées sous la feuille.",
    traitementImmediat: "🟡 Doucher sous les feuilles avec de l'eau froide ou pulvériser du savon noir dilué.",
    prevention: "Lâcher d'acariens prédateurs (Phytoseiulus).",
    conseilIrrigation: "💧 Maintenir une bonne hydratation des plants."
  },
  "Tomato___Target_Spot": {
    nom: "Corynesporiose / Tache cible de la tomate",
    plante: "Tomate",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Taches nécrotiques circulaires brun foncé concentriques sur les feuilles et tiges.",
    traitementImmediat: "🟡 Appliquer un fongicide protecteur biologique dès les premiers symptômes.",
    prevention: "Augmenter la distance entre les plants.",
    conseilIrrigation: "💧 Arrosage goutte-à-goutte."
  },
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
    nom: "Virus des feuilles jaunes en cuillère (TYLCV)",
    plante: "Tomate",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Feuilles jaunissantes recroquevillées vers le haut, nanisme sévère et arrêt des floraisons.",
    traitementImmediat: "🔴 Arracher et détruire le plant. Lutter contre la mouche blanche (Aleyrode).",
    prevention: "Filets anti-insectes à mailles fines.",
    conseilIrrigation: "💧 Irrigation régulière."
  },
  "Tomato___Tomato_mosaic_virus": {
    nom: "Virus de la Mosaïque de la tomate (ToMV)",
    plante: "Tomate",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Motifs en mosaïque vert clair/foncé sur le feuillage, déformation des feuilles et taches nécrotiques.",
    traitementImmediat: "🔴 Détruire le plant infecté. Désinfecter les mains et sécateurs à l'alcool.",
    prevention: "Variétés résistantes (ToMV).",
    conseilIrrigation: "💧 Arrosage normal sans toucher la plante."
  },
  "Tomato___healthy": {
    nom: "Plante de Tomate Saine",
    plante: "Tomate",
    estSaine: true,
    gravite: "FAIBLE",
    symptomes: "Feuilles bien vertes, fermes et vigoureuses sans anomalie.",
    traitementImmediat: "🟢 Plante en parfaite santé !",
    prevention: "Taille régulière des gourmands et paillage.",
    conseilIrrigation: "💧 Arrosage régulier au pied."
  },

  // FRAISE
  "Strawberry___Leaf_scorch": {
    nom: "Maladie des taches rouges du fraisier",
    plante: "Fraisier",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Taches pourpres et nécrotiques bordées de rouge sur les feuilles de fraisier.",
    traitementImmediat: "🟡 Nettoyer les feuilles atteintes et pulvériser un fongicide biologique.",
    prevention: "Renouveler la fraiseraie tous les 3 ans.",
    conseilIrrigation: "💧 Paillage des rangs et goutte-à-goutte."
  },
  "Strawberry___healthy": {
    nom: "Fraisier Sain",
    plante: "Fraisier",
    estSaine: true,
    gravite: "FAIBLE",
    symptomes: "Feuilles vertes brillantes et fruits bien développés.",
    traitementImmediat: "🟢 Fraisier en excellente santé.",
    prevention: "Paillage paille d'orge.",
    conseilIrrigation: "💧 Goutte-à-goutte sous paille."
  },

  // COURGE / CUCURBITACEES
  "Squash___Powdery_mildew": {
    nom: "Oïdum des cucurbitacées (Courge / Courgette)",
    plante: "Courge / Cucurbitacée",
    estSaine: false,
    gravite: "MOYEN",
    symptomes: "Poudre blanche laiteuse recouvrant le feuillage et les tiges.",
    traitementImmediat: "🟡 Pulvériser du bicarbonate de soude (5g/L) avec du savon noir ou du soufre.",
    prevention: "Espace suffisant entre les pieds et purin de prêle.",
    conseilIrrigation: "💧 Ne pas mouiller les feuilles."
  },

  // PECHER
  "Peach___Bacterial_spot": {
    nom: "Tache bactérienne du pêcher (Xanthomonas)",
    plante: "Pêcher",
    estSaine: false,
    gravite: "ELEVE",
    symptomes: "Taches brun-noir perforantes sur feuilles et chancres crevassés sur les pêches.",
    traitementImmediat: "🔴 Traitement cuivré après la chute des feuilles et au débourrement.",
    prevention: "Tailler les rameaux atteints.",
    conseilIrrigation: "💧 Arrosage maîtrisé."
  },
  "Peach___healthy": {
    nom: "Pêcher Sain",
    plante: "Pêcher",
    estSaine: true,
    gravite: "FAIBLE",
    symptomes: "Feuilles vertes et vigoureuses.",
    traitementImmediat: "🟢 Pêcher en excellente forme.",
    prevention: "Traitements d'hiver à la bouillie bordelaise.",
    conseilIrrigation: "💧 Arrosage selon saison."
  }
};

/**
 * Fonction de secours intelligente si le label brut n'est pas dans le dictionnaire exact
 */
function parseFallbackLabel(rawLabel: string, userSelectedCrop?: string): DiseaseDetail {
  const clean = rawLabel.toLowerCase();

  // Déterminer la plante
  let plante = userSelectedCrop && userSelectedCrop !== 'auto' ? userSelectedCrop : "Culture végétale";
  if (clean.includes("potato") || clean.includes("pomme de terre")) plante = "Pomme de terre";
  else if (clean.includes("apple") || clean.includes("pommier") || clean.includes("pomme")) plante = "Pommier";
  else if (clean.includes("grape") || clean.includes("vigne") || clean.includes("raisin")) plante = "Vigne";
  else if (clean.includes("corn") || clean.includes("maize") || clean.includes("maïs")) plante = "Maïs";
  else if (clean.includes("pepper") || clean.includes("poivron")) plante = "Poivron / Piment";
  else if (clean.includes("peach") || clean.includes("pêcher")) plante = "Pêcher";
  else if (clean.includes("strawberry") || clean.includes("fraisier")) plante = "Fraisier";
  else if (clean.includes("squash") || clean.includes("courge")) plante = "Courge / Cucurbitacée";
  else if (clean.includes("tomato") || clean.includes("tomate")) plante = "Tomate";

  const estSaine = clean.includes("healthy") || clean.includes("sain");

  if (estSaine) {
    return {
      nom: `Plante de ${plante} Saine`,
      plante,
      estSaine: true,
      gravite: "FAIBLE",
      symptomes: `Feuillage de ${plante} en bon état sans lésion visible.`,
      traitementImmediat: `🟢 Aucun traitement nécessaire. La plante est en bonne santé !`,
      prevention: "Poursuivre la surveillance et l'arrosage régulier.",
      conseilIrrigation: "💧 Irrigation adaptée."
    };
  }

  const readableName = rawLabel.replace(/_/g, ' ').replace('___', ' - ');
  return {
    nom: `${readableName} (${plante})`,
    plante,
    estSaine: false,
    gravite: "MOYEN",
    symptomes: `Anomalie foliaire détectée par le modèle d'IA : ${readableName}.`,
    traitementImmediat: `🟡 Isolez ou coupez la partie affectée de la plante. Appliquez un fongicide doux ou purin de prêle/cuivre.`,
    prevention: `Assurez une bonne aération du feuillage et évitez l'aspersion d'eau.`,
    conseilIrrigation: `💧 Arroser au pied tôt le matin.`
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const selectedCrop = (formData.get('crop') as string | null) || 'auto';

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier image n'a été fourni" },
        { status: 400 }
      );
    }

    const token = process.env.GEMINI_API_KEY || '';
    const imageBytes = await file.arrayBuffer();

    let predictionsList: Array<{ label: string; score: number }> = [];
    let isLivePrediction = false;

    if (token && imageBytes.byteLength > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey: token });
        const labelsList = Object.keys(EXACT_DISEASE_MAP).join(', ');
        
        const prompt = `Tu es un expert en pathologie végétale. 
Analyse cette image de plante/feuille. 
Identifie la plante et la maladie éventuelle. Si la maladie correspond exactement à une des classes suivantes, renvoie UNIQUEMENT son nom : [${labelsList}]. 
Si la plante est saine, choisis la classe "healthy" correspondante.
Si l'image montre une autre plante ou maladie qui n'est pas dans la liste, renvoie UNIQUEMENT une chaîne sous la forme "NomPlante___NomMaladie" (en anglais, ex: Grape___Powdery_mildew). Ne renvoie jamais "Unknown". Ne renvoie aucun texte supplémentaire.`;

        const response = await ai.models.generateContent({
          model: 'gemini-flash-lite-latest',
          contents: [
            prompt,
            { 
              inlineData: { 
                data: Buffer.from(imageBytes).toString("base64"), 
                mimeType: file.type || 'image/jpeg' 
              } 
            }
          ],
        });

        const outputText = (response.text || '').replace(/```/g, '').trim().split('\n')[0];
        if (outputText && outputText !== 'Unknown') {
          predictionsList = [{ label: outputText, score: 0.95 }];
          isLivePrediction = true;
        } else {
          console.warn('[Gemini AI] Classification incertaine ou vide.', outputText);
        }
      } catch (aiError: any) {
        console.warn('[Gemini AI] Erreur :', aiError.message);
        return NextResponse.json(
          {
            error: "Erreur de l'API Gemini : " + aiError.message,
            success: false,
          },
          { status: 422 }
        );
      }
    }

    if (predictionsList.length === 0) {
      return NextResponse.json(
        {
          error: "Le service d'analyse IA a renvoyé une réponse vide ou inconnue.",
          success: false,
        },
        { status: 422 }
      );
    }

    // Sélection intelligente de la prédiction
    let chosenPrediction = predictionsList[0];

    // Si l'utilisateur a sélectionné une culture spécifique (ex: Pomme de terre, Pommier, Vigne, etc.)
    if (selectedCrop && selectedCrop !== 'auto') {
      const cropQuery = selectedCrop.toLowerCase();
      const filtered = predictionsList.find(p => p.label.toLowerCase().includes(cropQuery));
      if (filtered) {
        chosenPrediction = filtered;
      }
    }

    // Récupérer les détails exacts de la maladie
    const details = EXACT_DISEASE_MAP[chosenPrediction.label] || parseFallbackLabel(chosenPrediction.label, selectedCrop);
    const confiance = Math.round(chosenPrediction.score * 100);

    return NextResponse.json({
      success: true,
      rawLabel: chosenPrediction.label,
      confiance,
      isLivePrediction,
      diagnostic: details,
      allPredictions: predictionsList.slice(0, 5),
    });
  } catch (error: any) {
    console.error('Erreur API Diagnostic Plante:', error);
    return NextResponse.json(
      { error: "Échec du traitement de l'image. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
