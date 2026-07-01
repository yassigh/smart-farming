import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel } from "@/models/utilisateur";
import { TraitementModel } from "@/models/traitement";
import { Role } from "@prisma/client";
import TraitementTable from "@/components/TraitementTable";

export const metadata = {
  title: "Traitements Médicaux | Smart Farming",
  description: "Suivi médical et traitements administrés aux animaux.",
};

export default async function TraitementsPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) redirect("/login");

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));
  if (!user) redirect("/login");

  let traitements: any[] = [];

  switch (user.role) {
    case Role.ADMIN:
      traitements = await TraitementModel.getAll();
      break;
    case Role.VETERINAIRE:
      // A vet can view all treatments in the system to collaborate on medical logs
      traitements = await TraitementModel.getAll();
      break;
    case Role.AGRICULTEUR:
      traitements = await TraitementModel.getByAgriculteur(user.id);
      break;
    case Role.EMPLOYE:
      traitements = await TraitementModel.getByEmploye(user.id);
      break;
    default:
      traitements = [];
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 md:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        <TraitementTable initialTraitements={traitements} user={user} />
      </div>
    </div>
  );
}
