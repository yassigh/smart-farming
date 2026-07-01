import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel } from "@/models/utilisateur";
import { FermeModel } from "@/models/ferme";
import { Role } from "@prisma/client";
import FermeTable from "@/components/FermeTable";

export default async function FermesPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/login");
  }

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));

  if (!user) {
    redirect("/login");
  }

  let fermes: any[] = [];

  switch (user.role) {
    case Role.ADMIN:
    case Role.VETERINAIRE:
      fermes = await FermeModel.getAll();
      break;

    case Role.AGRICULTEUR:
      fermes = await FermeModel.getByAgriculteur(user.id);
      break;

    case Role.EMPLOYE:
      fermes = await FermeModel.getByEmploye(user.id);
      break;

    default:
      fermes = [];
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 md:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        <FermeTable initialFermes={fermes} user={user} />
      </div>
    </div>
  );
}
