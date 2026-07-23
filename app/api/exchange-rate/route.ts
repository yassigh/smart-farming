// app/api/exchange-rate/route.ts - Version avec API réelle
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Utiliser ExchangeRate-API (gratuit, sans clé)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache 1 heure
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur API taux: ${response.status}`);
    }

    const data = await response.json();
    const rate = data.rates?.TND || 3.10;

    return NextResponse.json({
      success: true,
      rate: rate,
      lastUpdate: new Date().toISOString(),
      base: "USD",
      target: "TND",
    });

  } catch (error) {
    console.error("Erreur taux de change:", error);
    
    // Taux approximatif en cas d'erreur
    return NextResponse.json({
      success: true,
      rate: 3.10,
      lastUpdate: new Date().toISOString(),
      base: "USD",
      target: "TND",
      note: "Taux approximatif (API indisponible)",
    });
  }
}