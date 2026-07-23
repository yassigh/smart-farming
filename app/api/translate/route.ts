// app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, sourceLang, targetLang, useLibreTranslate } = body;

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Si la langue source est la même que la cible, retourner le texte original
    if (sourceLang === targetLang) {
      return NextResponse.json({ translatedText: text });
    }

    let translatedText = text;

    // Essayer d'abord avec LibreTranslate si demandé
    if (useLibreTranslate !== false) {
      try {
        const response = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang || 'fr',
            target: targetLang,
            format: 'text',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.translatedText) {
            return NextResponse.json({ 
              translatedText: data.translatedText,
              source: 'libretranslate'
            });
          }
        }
      } catch (libreError) {
        console.error('LibreTranslate error, falling back to MyMemory:', libreError);
      }
    }

    // Fallback vers MyMemory
    try {
      const fallbackResponse = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=${sourceLang || 'fr'}|${targetLang}`
      );

      const fallbackData = await fallbackResponse.json();
      translatedText = fallbackData.responseData.translatedText || text;

      return NextResponse.json({ 
        translatedText,
        source: 'mymemory'
      });
    } catch (fallbackError) {
      console.error('Fallback translation error:', fallbackError);
      return NextResponse.json({ 
        translatedText: text,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}