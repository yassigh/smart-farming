// app/api/commodity-prices/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    
    // Symboles par défaut (sans Bovins et Lait)
    const defaultSymbols = "ZW=F,ZC=F,ZS=F,KC=F";
    const symbols = symbolsParam || defaultSymbols;
    
    // Encoder les symboles pour l'URL
    const encodedSymbols = symbols.split(',').map(s => encodeURIComponent(s)).join('%2C');
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodedSymbols}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur API Yahoo: ${response.status}`);
    }

    const data = await response.json();
    const quotes = data.quoteResponse?.result || [];

    if (quotes.length === 0) {
      throw new Error("Aucune donnée reçue de Yahoo Finance");
    }

    const prices = quotes.map((quote: any) => ({
      symbol: quote.symbol || '',
      name: getCommodityName(quote.symbol) || quote.symbol || '',
      price: quote.regularMarketPrice ?? quote.price ?? 0,
      change: quote.regularMarketChange ?? quote.change ?? 0,
      changePercent: quote.regularMarketChangePercent ?? quote.changePercent ?? 0,
    }));

    return NextResponse.json({
      success: true,
      prices,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Erreur API commodity-prices:", error);
    
    //  DONNÉES SIMULÉES AVEC DES PRIX RÉALISTES EN TND
    const mockPrices = [
      { symbol: "ZW=F", name: "Blé", price: 850.00, change: 12.50, changePercent: 1.49 },
      { symbol: "ZC=F", name: "Maïs", price: 750.00, change: -8.75, changePercent: -1.15 },
      { symbol: "ZS=F", name: "Soja", price: 1300.00, change: 18.90, changePercent: 1.48 },
      { symbol: "KC=F", name: "Café", price: 25.00, change: 0.65, changePercent: 2.67 },
    ];

    return NextResponse.json({
      success: true,
      prices: mockPrices,
      timestamp: new Date().toISOString(),
      note: "Données simulées (API non disponible)",
    });
  }
}

function getCommodityName(symbol: string): string {
  const names: Record<string, string> = {
    "ZW=F": "Blé",
    "ZC=F": "Maïs",
    "ZS=F": "Soja",
    "KC=F": "Café",
  };
  return names[symbol] || symbol;
}