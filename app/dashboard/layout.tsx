// app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NotificationIconWrapper from "@/components/NotificationIconWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Utiliser le système d'auth custom (cookies) — pas NextAuth
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/login");
  }

  // Récupérer l'utilisateur connecté depuis la base de données
  const user = await db.utilisateur.findUnique({
    where: { id: Number(sessionUserId) },
    select: { id: true, nom: true, prenom: true, role: true, image: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#121816]">
      {/* Sidebar */}
      <Sidebar connectedUser={user} />

      {/* Contenu principal */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto relative h-screen w-full">
        {/* Notification Icon - Wrapper client */}
        <div className="absolute top-6 right-6 z-40">
          <NotificationIconWrapper userId={user.id} />
        </div>

        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}