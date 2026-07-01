import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel } from "@/models/utilisateur";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import Link from "next/link";
import AddFermeForm from "@/components/AddFermeForm";

export default async function AddFermePage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/login");
  }

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));

  if (!user) {
    redirect("/login");
  }

  // Authorize: Only ADMIN and AGRICULTEUR can add farms
  if (user.role !== Role.ADMIN && user.role !== Role.AGRICULTEUR) {
    redirect("/dashboard/fermes");
  }

  // Fetch list of all agriculteurs if current user is ADMIN
  let agriculteurs: any[] = [];
  if (user.role === Role.ADMIN) {
    agriculteurs = await db.utilisateur.findMany({
      where: { role: Role.AGRICULTEUR },
      select: {
        id: true,
        nom: true,
        prenom: true,
      },
      orderBy: { nom: "asc" },
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 md:p-12 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2A453E] dark:text-white">
              Créer une Nouvelle Ferme
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Configurez une nouvelle exploitation agricole dans le système.
            </p>
          </div>
          <Link
            href="/dashboard/fermes"
            className="self-start px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-semibold transition-all"
          >
            ← Retour aux fermes
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl rounded-3xl p-8 transition-all">
          <AddFermeForm
            agriculteurs={agriculteurs}
            currentUserId={user.id}
            currentUserRole={user.role}
          />
        </div>
      </div>
    </div>
  );
}
