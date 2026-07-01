import { NextRequest, NextResponse } from "next/server";
import { registerAction } from "@/actions/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await registerAction(body);

  return NextResponse.json(result, {
    status: result.success ? 201 : 400,
  });
}