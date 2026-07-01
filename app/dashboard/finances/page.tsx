import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel } from "@/models/utilisateur";
import { FermeModel } from "@/models/ferme";
import { DepenseModel } from "@/models/depense";
import { RevenuModel } from "@/models/revenu";
import { Role } from "@prisma/client";
import FinancesView from "@/components/FinancesView";

export const metadata = {
  title: "Finances | Smart Farming",
  description: "Gérez les dépenses et revenus de votre exploitation agricole.",
};

export default async function FinancesPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) redirect("/login");

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));
  if (!user) redirect("/login");

  // Seuls ADMIN et AGRICULTEUR ont accès
  if (user.role !== Role.ADMIN && user.role !== Role.AGRICULTEUR) {
    redirect("/dashboard");
  }

  // Fermes accessibles selon le rôle
  const fermes =
    user.role === Role.ADMIN
      ? await FermeModel.getAll()
      : await FermeModel.getByAgriculteur(user.id);

  // Données financières
  const depenses =
    user.role === Role.ADMIN
      ? await DepenseModel.getAll()
      : await DepenseModel.getByUser(user.id);

  const revenus =
    user.role === Role.ADMIN
      ? await RevenuModel.getAll()
      : await RevenuModel.getByUser(user.id);

  const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
  const totalRevenus = revenus.reduce((sum, r) => sum + r.montant, 0);
  const solde = totalRevenus - totalDepenses;

  return (
    <FinancesView
      user={user}
      fermes={fermes}
      depenses={depenses}
      revenus={revenus}
      totalDepenses={totalDepenses}
      totalRevenus={totalRevenus}
      solde={solde}
    />
  );
}
