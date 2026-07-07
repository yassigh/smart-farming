import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/stability";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, negativePrompt, width, height, steps, seed, model, style } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt requis" },
        { status: 400 }
      );
    }

    const result = await generateImage({
      prompt,
      negativePrompt,
      width,
      height,
      steps,
      seed,
      model,
      style,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Erreur de génération" },
        { status: result.statusCode || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: result.image,
      seed: result.seed,
      finishReason: result.finishReason,
    });
  } catch (error) {
    console.error("Erreur API generate-image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
}