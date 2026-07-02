// app/api/assistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { askAssistant } from '@/actions/predictionIA';

export async function POST(request: NextRequest) {
  try {
    const { question, fermeId } = await request.json();

    if (!question || !fermeId) {
      return NextResponse.json(
        { error: "Question et fermeId requis" },
        { status: 400 }
      );
    }

    const result = await askAssistant(fermeId, question);
    
    if (result.success) {
      return NextResponse.json({ reponse: result.data });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur API assistant:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement" },
      { status: 500 }
    );
  }
}