import { NextRequest, NextResponse } from "next/server";
import { loginAction } from "@/actions/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await loginAction(
    body.email,
    body.motDePasse
  );

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}