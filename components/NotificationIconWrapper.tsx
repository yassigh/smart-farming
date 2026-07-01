// components/NotificationIconWrapper.tsx
"use client";

import dynamic from 'next/dynamic';

// Importer dynamiquement NotificationIcon avec désactivation du SSR
const NotificationIcon = dynamic(
  () => import('@/components/NotificationIcon'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed top-20 right-6 z-50">
        <div className="p-3 bg-card rounded-full shadow-lg border border-theme">
          <div className="w-6 h-6 animate-pulse bg-muted rounded-full"></div>
        </div>
      </div>
    )
  }
);

export default function NotificationIconWrapper({ userId }: { userId: number }) {
  return <NotificationIcon userId={userId} />;
}