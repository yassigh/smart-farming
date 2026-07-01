import { AnimalModel } from "@/models/animal";
import AnimalTable from "@/components/AnimalTable";
import { UtilisateurModel } from "@/models/utilisateur";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export const metadata = {
  title: "Gestion des Animaux | Smart Farming",
  description: "Consultez et gérez tous les animaux de vos fermes.",
};

export default async function AnimauxPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) redirect("/login");

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));
  if (!user) redirect("/login");

  let animaux: any[] = [];

  switch (user.role) {
    case Role.ADMIN:
      animaux = await AnimalModel.getAll();
      break;
    case Role.AGRICULTEUR:
      animaux = await AnimalModel.getByAgriculteur(user.id);
      break;
    case Role.EMPLOYE:
      animaux = await AnimalModel.getByEmploye(user.id);
      break;
    case Role.VETERINAIRE:
      animaux = await AnimalModel.getAll();
      break;
    default:
      animaux = [];
  }

  return <AnimalTable initialAnimaux={animaux} user={user} />;
}
