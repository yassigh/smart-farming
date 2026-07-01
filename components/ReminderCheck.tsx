// components/ReminderCheck.tsx
"use client";

import { useEffect } from "react";

export default function ReminderCheck() {
  useEffect(() => {
    const checkReminders = async () => {
      try {
        const response = await fetch('/api/reminders', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error('Erreur lors de la vérification des rappels:', await response.text());
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des rappels:', error);
      }
    };
    
    // Vérifier au chargement
    checkReminders();
    
    // Vérifier toutes les 6 heures
    const interval = setInterval(checkReminders, 6 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return null;
}