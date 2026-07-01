// components/ReminderInitializer.tsx
"use client";

import { useEffect } from "react";

export default function ReminderInitializer() {
  useEffect(() => {
    const checkReminders = async () => {
      try {
        await fetch('/api/reminders', { method: 'POST' });
      } catch (error) {
        console.error('Erreur lors de la vérification des rappels:', error);
      }
    };
    checkReminders();
  }, []);

  return null;
}