// app/dashboard/layout.tsx
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NotificationIconWrapper from "@/components/NotificationIconWrapper";
import ReminderInitializer from "@/components/ReminderInitializer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) redirect("/login");

  const user = await db.utilisateur.findUnique({
    where: { id: Number(sessionUserId) },
    select: { id: true, nom: true, prenom: true, role: true, image: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-page)" }}>
      {/* Sidebar dark (contraste premium) */}
      <Sidebar connectedUser={user} />

      {/* Zone contenu principale */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Topbar claire */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 shrink-0"
          style={{
            background: "rgba(240,247,244,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <span
              className="hidden md:inline font-bold text-xs uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              Smart Farming
            </span>
            <span className="hidden md:inline" style={{ color: "var(--text-subtle)" }}>/</span>
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
              Dashboard
            </span>
          </div>

          {/* Actions topbar */}
          <div className="flex items-center gap-3">
            {/* Notification */}
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <NotificationIconWrapper userId={user.id} />
            </div>

         
            
          </div>
        </header>

        {/* Contenu scrollable */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6 sf-scroll"
          style={{ background: "var(--bg-page)" }}
        >
          <ReminderInitializer />
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}