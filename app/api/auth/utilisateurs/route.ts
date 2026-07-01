import { NextRequest, NextResponse } from "next/server";
import { addUtilisateurAction } from "@/actions/utilisateur";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await addUtilisateurAction(body);

  return NextResponse.json(result, {
    status: result.success ? 201 : 400,
  });
}