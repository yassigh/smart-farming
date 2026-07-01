import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel } from "@/models/utilisateur";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import Link from "next/link";
import AddTerrainForm from "@/components/AddTerrainForm";

export default async function AddTerrainPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/login");
  }

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));

  if (!user) {
    redirect("/login");
  }

  // Authorize: Only ADMIN and AGRICULTEUR can add terrains
  if (user.role !== Role.ADMIN && user.role !== Role.AGRICULTEUR) {
    redirect("/dashboard/terrains");
  }

  // Fetch farms depending on user's role
  const fermes = await db.ferme.findMany({
    where: user.role === Role.AGRICULTEUR ? { agriculteurId: user.id } : {},
    orderBy: { nom: "asc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 md:p-12 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2A453E] dark:text-white">
              Ajouter un Nouveau Terrain
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Configurez une nouvelle parcelle de culture ou d'élevage dans l'une de vos fermes.
            </p>
          </div>
          <Link
            href="/dashboard/terrains"
            className="self-start px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-semibold transition-all"
          >
            ← Retour aux terrains
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl rounded-3xl p-8 transition-all">
          <AddTerrainForm fermes={fermes} />
        </div>
      </div>
    </div>
  );
}
