import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel } from "@/models/utilisateur";
import { FermeModel } from "@/models/ferme";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import Link from "next/link";
import AddFermeForm from "@/components/AddFermeForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFermePage({ params }: PageProps) {
  const resolvedParams = await params;
  const fermeId = parseInt(resolvedParams.id);

  if (isNaN(fermeId)) {
    redirect("/dashboard/fermes");
  }

  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/login");
  }

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));

  if (!user) {
    redirect("/login");
  }

  const ferme = await FermeModel.getById(fermeId);

  if (!ferme) {
    redirect("/dashboard/fermes");
  }

  // Authorize: ADMIN can edit any farm, AGRICULTEUR can only edit their own
  if (
    user.role !== Role.ADMIN &&
    (user.role !== Role.AGRICULTEUR || ferme.agriculteurId !== user.id)
  ) {
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
              Modifier la Ferme
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Modifiez les détails de l'exploitation "{ferme.nom}".
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
            initialData={{
              id: ferme.id,
              nom: ferme.nom,
              adresse: ferme.adresse,
              superficie: ferme.superficie,
              agriculteurId: ferme.agriculteurId,
            }}
            agriculteurs={agriculteurs}
            currentUserId={user.id}
            currentUserRole={user.role}
          />
        </div>
      </div>
    </div>
  );
}
