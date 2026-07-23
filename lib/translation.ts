// lib/translation.ts
export async function translate(
  text: string,
  targetLang: string,
  sourceLang: string = "fr"
): Promise<string> {
  const supportedLanguages = [
    "en", "fr", "es", "de", "it", "ar", "zh", "ja", "ko", "pt", "ru"
  ];

  if (!supportedLanguages.includes(sourceLang)) {
    sourceLang = "fr";
  }

  if (!supportedLanguages.includes(targetLang)) {
    throw new Error(`Langue non supportée: ${targetLang}`);
  }

  if (sourceLang === targetLang) {
    return text;
  }

  try {
    // ✅ Utilisation du service LibreTranslate local
    const response = await fetch('http://localhost:5000/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback vers MyMemory si LibreTranslate échoue
    try {
      const fallbackResponse = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=${sourceLang}|${targetLang}`
      );
      const fallbackData = await fallbackResponse.json();
      return fallbackData.responseData.translatedText || text;
    } catch (fallbackError) {
      console.error('Fallback translation error:', fallbackError);
      return text;
    }
  }
}