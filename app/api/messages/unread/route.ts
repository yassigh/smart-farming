// app/api/messages/unread/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MessageModel } from "@/models/message";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("session_user_id")?.value;
    if (!sessionUserId) {
      return NextResponse.json({ success: false, count: 0 }, { status: 401 });
    }

    const count = await MessageModel.getUnreadCount(parseInt(sessionUserId));
    return NextResponse.json({ success: true, count });
  } catch (error) {
    return NextResponse.json({ success: false, count: 0 }, { status: 500 });
  }
}
