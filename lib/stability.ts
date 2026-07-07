// lib/stability.ts

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  model?: 'ultra' | 'core' | 'sd3.5';
  style?: 'photographic' | 'digital-art' | 'cinematic' | 'anime' | '3d-model' | 'pixel-art';
}

// Dictionnaire de traduction FR → EN pour termes agricoles courants
const FR_TO_EN_DICT: [RegExp, string][] = [
  [/\bferme\b/gi, 'farm'],
  [/\bmoderne\b/gi, 'modern'],
  [/\bchamps?\b/gi, 'fields'],
  [/\bblé\b/gi, 'wheat'],
  [/\bmaïs\b/gi, 'corn'],
  [/\btournesols?\b/gi, 'sunflowers'],
  [/\brizière\b/gi, 'rice paddy'],
  [/\bvignes?\b/gi, 'vineyard'],
  [/\bverger\b/gi, 'orchard'],
  [/\bprairie\b/gi, 'meadow'],
  [/\bvaches?\b/gi, 'cows'],
  [/\bmoutons?\b/gi, 'sheep'],
  [/\bpoulets?\b/gi, 'chickens'],
  [/\bchevaux?\b/gi, 'horses'],
  [/\bpaysage\b/gi, 'landscape'],
  [/\bcampagne\b/gi, 'countryside'],
  [/\bcoucher de soleil\b/gi, 'sunset'],
  [/\bsoleil\b/gi, 'sunlight'],
  [/\bautre\b/gi, 'other'],
  [/\bverde?\b/gi, 'green'],
  [/\bvert(e)?\b/gi, 'green'],
  [/\bprofessionnel(le)?\b/gi, 'professional'],
  [/\bhaut(e)? qualité\b/gi, 'high quality'],
  [/\bdoré(e)?s?\b/gi, 'golden'],
  [/\brivière\b/gi, 'river'],
  [/\bforêt\b/gi, 'forest'],
  [/\bcollines?\b/gi, 'hills'],
  [/\bmontagne\b/gi, 'mountains'],
  [/\bsilo\b/gi, 'silo'],
  [/\bgrange\b/gi, 'barn'],
  [/\btracteur\b/gi, 'tractor'],
  [/\birrigatio?n\b/gi, 'irrigation'],
  [/\brécolte\b/gi, 'harvest'],
  [/\bsemence\b/gi, 'seeds'],
  [/\bsol\b/gi, 'soil'],
  [/\bherbe\b/gi, 'grass'],
  [/\bfleurs?\b/gi, 'flowers'],
  [/\bpluie\b/gi, 'rain'],
  [/\bnuages?\b/gi, 'clouds'],
  [/\bciel\b/gi, 'sky'],
  [/\bavec\b/gi, 'with'],
  [/\bdes\b/gi, ''],
  [/\bde\b/gi, ''],
  [/\bla\b/gi, ''],
  [/\ble\b/gi, ''],
  [/\bune\b/gi, 'a'],
  [/\bun\b/gi, 'a'],
  [/\bet\b/gi, 'and'],
  [/\bau\b/gi, 'at'],
  [/\bdu\b/gi, 'of the'],
  [/\bdans\b/gi, 'in'],
  [/\bsur\b/gi, 'on'],
  [/\bpour\b/gi, 'for'],
  [/\bnaturel(le)?\b/gi, 'natural'],
  [/\bréaliste\b/gi, 'realistic'],
  [/\bbeaux?\b/gi, 'beautiful'],
  [/\bbelle?\b/gi, 'beautiful'],
  [/\bgrand(e)?s?\b/gi, 'large'],
  [/\bpetit(e)?s?\b/gi, 'small'],
];

/**
 * Sanitise et traduit un prompt (FR ou EN) pour maximiser les chances de
 * passer la modération de contenu de Stability AI.
 */
function sanitizePrompt(rawPrompt: string): string {
  let p = rawPrompt.trim();

  // Appliquer les remplacements FR→EN
  for (const [pattern, replacement] of FR_TO_EN_DICT) {
    p = p.replace(pattern, replacement);
  }

  // Nettoyer les espaces multiples
  p = p.replace(/\s{2,}/g, ' ').trim();

  // Ajouter systématiquement des qualificatifs agricoles professionnels
  const farmQualifiers =
    'professional agricultural photography, farm setting, daylight, peaceful rural environment, 4k, high quality, photorealistic';

  // Éviter de dupliquer si déjà présent
  if (!p.toLowerCase().includes('agricultural') && !p.toLowerCase().includes('farm')) {
    p = `${p}, farm`;
  }
  if (!p.toLowerCase().includes('professional')) {
    p = `${p}, ${farmQualifiers}`;
  }

  return p;
}

type StabilityImageResponse = {
  image?: string;
  base64?: string;
  artifacts?: Array<{
    base64?: string;
    base64Data?: string;
    image?: string;
  }>;
  seed?: number;
  finishReason?: string;
};

export type GenerateImageResult =
  | {
      success: true;
      image?: string;
      seed?: number;
      finishReason?: string;
    }
  | {
      success: false;
      error: string;
      statusCode: number;
    };

function resolveAspectRatio(width?: number, height?: number) {
  if (!width || !height || width <= 0 || height <= 0) {
    return '1:1';
  }

  const ratio = width / height;
  const supportedRatios = [
    { value: '16:9', target: 16 / 9 },
    { value: '1:1', target: 1 },
    { value: '21:9', target: 21 / 9 },
    { value: '2:3', target: 2 / 3 },
    { value: '3:2', target: 3 / 2 },
    { value: '4:5', target: 4 / 5 },
    { value: '5:4', target: 5 / 4 },
    { value: '9:16', target: 9 / 16 },
    { value: '9:21', target: 9 / 21 },
  ];

  let bestMatch = supportedRatios[0];
  let smallestDistance = Number.POSITIVE_INFINITY;

  for (const entry of supportedRatios) {
    const distance = Math.abs(entry.target - ratio);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      bestMatch = entry;
    }
  }

  return bestMatch.value;
}

async function parseStabilityError(response: Response) {
  const text = await response.text();

  try {
    const parsed = JSON.parse(text) as { message?: string; errors?: string[]; name?: string };
    const details = parsed.errors?.length
      ? parsed.errors.join('; ')
      : parsed.message || parsed.name || text;
    return details;
  } catch {
    return text || 'Erreur API';
  }
}

async function callStabilityAPI(
  apiKey: string,
  prompt: string,
  negativePrompt: string,
  width: number,
  height: number,
  seed: number,
  model: NonNullable<GenerateImageOptions['model']>,
  style?: GenerateImageOptions['style'],
) {
  const modelEndpointMap: Record<NonNullable<GenerateImageOptions['model']>, string> = {
    ultra: 'ultra',
    core: 'core',
    'sd3.5': 'sd3',
  };

  const endpointModel = modelEndpointMap[model];
  const formData = new FormData();

  formData.append('prompt', prompt);
  formData.append('output_format', 'png');
  formData.append('aspect_ratio', resolveAspectRatio(width, height));

  if (negativePrompt) {
    formData.append('negative_prompt', negativePrompt);
  }

  if (seed !== undefined && seed !== 0) {
    formData.append('seed', String(seed));
  }

  // style_preset n'est pas supporté par le modèle ultra
  if (style && model !== 'ultra') {
    formData.append('style_preset', style);
  }

  return fetch(`https://api.stability.ai/v2beta/stable-image/generate/${endpointModel}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      accept: 'application/json',
    },
    body: formData,
  });
}

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "STABILITY_API_KEY n'est pas définie dans les variables d'environnement.",
      statusCode: 500,
    };
  }

  const {
    negativePrompt = 'blurry, low quality, deformed, ugly, bad anatomy, nsfw, violence, gore, disturbing',
    width = 1024,
    height = 1024,
    steps = 30,
    seed = Math.floor(Math.random() * 1000000),
    model = 'ultra',
    style = 'photographic',
  } = options;

  // Sanitiser et traduire le prompt (FR → EN) pour éviter les erreurs de modération
  const safePrompt = sanitizePrompt(options.prompt);

  console.log('[Stability] Prompt original :', options.prompt);
  console.log('[Stability] Prompt sanitisé :', safePrompt);

  try {
    let response = await callStabilityAPI(apiKey, safePrompt, negativePrompt, width, height, seed, model, style);

    // Si erreur 403 (modération), réessayer avec un prompt de secours générique
    if (response.status === 403) {
      console.warn('[Stability] Prompt bloqué (403), tentative avec prompt de secours...');
      const fallbackPrompt =
        'Professional photograph of a beautiful modern farm with green fields, golden wheat, blue sky, peaceful rural landscape, 4k, high quality, photorealistic';
      response = await callStabilityAPI(apiKey, fallbackPrompt, negativePrompt, width, height, seed, model, style);

      if (!response.ok) {
        const errorDetails = await parseStabilityError(response);
        return {
          success: false,
          error:
            response.status === 403
              ? 'Votre description a été refusée par le système de modération. Essayez une description plus simple et descriptive (ex: "a modern farm with wheat fields and blue sky").'
              : `Erreur Stability AI: ${response.status} – ${errorDetails}`,
          statusCode: response.status,
        };
      }
    } else if (!response.ok) {
      const errorDetails = await parseStabilityError(response);
      return {
        success: false,
        error: `Erreur Stability AI: ${response.status} – ${errorDetails}`,
        statusCode: response.status,
      };
    }

    const data = (await response.json()) as StabilityImageResponse;
    const image =
      data.image ||
      data.base64 ||
      data.artifacts?.[0]?.base64 ||
      data.artifacts?.[0]?.base64Data ||
      data.artifacts?.[0]?.image;

    return {
      success: true,
      image,
      seed: data.seed || seed,
      finishReason: data.finishReason,
    };
  } catch (error) {
    console.error('Erreur Stability AI:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur de génération',
      statusCode: 500,
    };
  }
}

// Fonctions spécifiques pour SMART-FARM
export async function generateFarmImage(ferme: any) {
  const prompt = `Professional photograph of ${ferme.nom} modern farm, beautiful agricultural landscape, ${ferme.superficie} hectares, ${ferme.terrains?.length || 0} fields, healthy crops, professional farming, high quality, 4k, realistic`;
  
  return generateImage({
    prompt: prompt,
    model: 'ultra',
    width: 1024,
    height: 1024,
    style: 'photographic',
  });
}

export async function generateCultureImage(culture: any) {
  const prompt = `High quality close-up photograph of ${culture.nom} crops, healthy plants, vibrant colors, professional agricultural photography, detailed, 4k, natural lighting`;
  
  return generateImage({
    prompt: prompt,
    model: 'ultra',
    width: 1024,
    height: 1024,
  });
}

export async function generateAnimalImage(animal: any) {
  const prompt = `Professional photograph of a healthy ${animal.race} ${animal.type} on a farm, well-groomed, natural pose, agricultural setting, high quality, realistic, 4k`;
  
  return generateImage({
    prompt: prompt,
    model: 'ultra',
    width: 1024,
    height: 1024,
  });
}