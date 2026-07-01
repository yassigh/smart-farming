// app/api/reminders/route.ts
import { NextResponse } from "next/server";
import { ReminderService } from "@/services/reminder.service";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await ReminderService.checkAndSendReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des rappels' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await ReminderService.checkAndSendReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des rappels' },
      { status: 500 }
    );
  }
}