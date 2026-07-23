// contexts/TranslationContext.tsx - Version corrigée
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";

// Cache de traduction
const translationCache = new Map<string, string>();

// ✅ Utiliser le service LibreTranslate local via l'API route
async function translateText(text: string, targetLang: string, sourceLang: string = "fr"): Promise<string> {
  const supportedLanguages = ["en", "fr", "ar", "es", "de", "it", "pt", "ru", "zh", "ja", "ko"];

  if (!supportedLanguages.includes(sourceLang)) {
    sourceLang = "fr";
  }

  if (!supportedLanguages.includes(targetLang)) {
    return text;
  }

  if (sourceLang === targetLang) {
    return text;
  }

  // Vérifier le cache
  const cacheKey = `${text}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    // ✅ Appel à l'API route Next.js qui utilise LibreTranslate
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
        useLibreTranslate: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data?.translatedText && data.translatedText !== text) {
      translationCache.set(cacheKey, data.translatedText);
      return data.translatedText;
    }

    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, texts: Record<string, string>) => string;
  translateAllTexts: (texts: Record<string, string>, targetLang: string) => Promise<Record<string, string>>;
  isTranslating: boolean;
  availableLanguages: Array<{code: string, name: string}>;
  translationStats: {
    total: number;
    cached: number;
    failed: number;
  };
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Langues disponibles
const AVAILABLE_LANGUAGES = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
];

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("fr");
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isTranslatingRef = useRef(false);
  const pendingTranslations = useRef<Map<string, Promise<Record<string, string>>>>(new Map());
  const [translationStats, setTranslationStats] = useState({
    total: 0,
    cached: 0,
    failed: 0,
  });
  // ✅ Ref pour suivre si les traductions sont déjà chargées
  const translationsLoaded = useRef<Set<string>>(new Set());

  // Charger la langue depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("app-language");
      if (savedLang && AVAILABLE_LANGUAGES.some(l => l.code === savedLang)) {
        setLanguage(savedLang);
      }
    } catch (error) {
      console.error("Error loading language from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Sauvegarder la langue dans localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("app-language", language);
      } catch (error) {
        console.error("Error saving language to localStorage:", error);
      }
    }
  }, [language, isInitialized]);

  const translateAllTexts = useCallback(async (texts: Record<string, string>, targetLang: string) => {
    // ✅ Si la langue cible est le français, retourner directement sans setState
    if (targetLang === 'fr') {
      // Ne pas appeler setTranslations pour éviter les boucles
      return {};
    }

    // ✅ Vérifier si déjà traduit pour éviter les re-traductions
    const cacheKey = targetLang;
    if (translationsLoaded.current.has(cacheKey)) {
      const existingTranslations = translations[targetLang];
      if (existingTranslations && Object.keys(existingTranslations).length > 0) {
        return existingTranslations;
      }
    }

    // Éviter les appels simultanés pour la même langue
    if (pendingTranslations.current.has(cacheKey)) {
      return pendingTranslations.current.get(cacheKey)!;
    }

    // Vérifier si déjà traduit
    if (translations[targetLang] && Object.keys(translations[targetLang]).length > 0) {
      const existingKeys = Object.keys(translations[targetLang]);
      const allKeys = Object.keys(texts);
      if (existingKeys.length >= allKeys.length) {
        translationsLoaded.current.add(cacheKey);
        return translations[targetLang];
      }
    }

    setIsTranslating(true);
    isTranslatingRef.current = true;

    // Créer une promesse pour cette traduction
    const translationPromise = (async () => {
      const translated: Record<string, string> = {};
      let failedCount = 0;
      let cachedCount = 0;
      
      // Traduire en parallèle avec limite de concurrence
      const entries = Object.entries(texts);
      const batchSize = 5;
      
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async ([key, value]) => {
            const cacheKey = `${value}_${targetLang}`;
            if (translationCache.has(cacheKey)) {
              cachedCount++;
              return [key, translationCache.get(cacheKey)!];
            }
            
            const result = await translateText(value, targetLang, 'fr');
            if (result === value) {
              failedCount++;
            }
            return [key, result];
          })
        );
        
        results.forEach(([key, value]) => {
          translated[key] = value;
        });
      }
      
      setTranslationStats(prev => ({
        total: prev.total + entries.length,
        cached: prev.cached + cachedCount,
        failed: prev.failed + failedCount,
      }));
      
      // ✅ Mettre à jour les traductions seulement si elles ont changé
      setTranslations(prev => {
        const current = prev[targetLang] || {};
        // Vérifier si les traductions ont réellement changé
        const hasChanged = Object.keys(translated).some(key => current[key] !== translated[key]);
        if (!hasChanged && Object.keys(current).length > 0) {
          return prev;
        }
        return { ...prev, [targetLang]: translated };
      });
      
      // ✅ Marquer comme chargé
      translationsLoaded.current.add(cacheKey);
      
      setIsTranslating(false);
      isTranslatingRef.current = false;
      pendingTranslations.current.delete(cacheKey);
      return translated;
    })();

    pendingTranslations.current.set(cacheKey, translationPromise);
    return translationPromise;
  }, [translations]);

  const t = useCallback((key: string, texts: Record<string, string>): string => {
    if (language === 'fr') return texts[key] || key;
    const langTranslations = translations[language] || {};
    return langTranslations[key] || texts[key] || key;
  }, [language, translations]);

  return (
    <TranslationContext.Provider value={{
      language,
      setLanguage,
      t,
      translateAllTexts,
      isTranslating,
      availableLanguages: AVAILABLE_LANGUAGES,
      translationStats,
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}