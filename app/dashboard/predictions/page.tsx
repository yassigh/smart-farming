import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel } from "@/models/utilisateur";
import { FermeModel } from "@/models/ferme";
import { PredictionModel } from "@/models/prediction";
import { Role } from "@prisma/client";
import PredictionsView from "@/components/PredictionsView";

export const metadata = {
  title: "Prédictions IA | Smart Farming",
  description: "Analysez et générez des prédictions agricoles basées sur vos données.",
};

export default async function PredictionsPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) redirect("/login");

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));
  if (!user) redirect("/login");

  // EMPLOYE et VETERINAIRE n'ont pas accès aux prédictions
  if (user.role === Role.EMPLOYE || user.role === Role.VETERINAIRE) {
    redirect("/dashboard");
  }

  const fermes =
    user.role === Role.ADMIN
      ? await FermeModel.getAll()
      : await FermeModel.getByAgriculteur(user.id);

  const predictions =
    user.role === Role.ADMIN
      ? await PredictionModel.getAll()
      : await PredictionModel.getByUser(user.id);

  return (
    <PredictionsView
      user={user}
      fermes={fermes}
      predictions={predictions}
    />
  );
}
