// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MessageModel } from "@/models/message";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("session_user_id")?.value;
    if (!sessionUserId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = parseInt(searchParams.get("with") ?? "");
    if (!otherUserId) {
      return NextResponse.json({ success: false, error: "Paramètre 'with' manquant" }, { status: 400 });
    }

    const messages = await MessageModel.getConversation(parseInt(sessionUserId), otherUserId);
    // Marquer comme lus
    await MessageModel.markAsRead(parseInt(sessionUserId), otherUserId);

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("session_user_id")?.value;
    if (!sessionUserId) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { destinataireId, contenu } = body;

    if (!destinataireId || !contenu?.trim()) {
      return NextResponse.json({ success: false, error: "Données manquantes" }, { status: 400 });
    }

    const message = await MessageModel.send(parseInt(sessionUserId), destinataireId, contenu.trim());
    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
