import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel } from "@/models/utilisateur";
import { CultureModel } from "@/models/culture";
import { Role } from "@prisma/client";
import CultureTable from "@/components/CultureTable";

export const metadata = {
  title: "Gestion des Cultures | Smart Farming",
  description: "Suivez et gérez les cultures de vos terrains.",
};

export default async function CulturesPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) redirect("/login");

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));
  if (!user) redirect("/login");

  let cultures: any[] = [];

  switch (user.role) {
    case Role.ADMIN:
    case Role.VETERINAIRE:
      cultures = await CultureModel.getAll();
      break;
    case Role.AGRICULTEUR:
      cultures = await CultureModel.getByAgriculteur(user.id);
      break;
    case Role.EMPLOYE:
      cultures = await CultureModel.getByEmploye(user.id);
      break;
    default:
      cultures = [];
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 md:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        <CultureTable initialCultures={cultures} user={user} />
      </div>
    </div>
  );
}