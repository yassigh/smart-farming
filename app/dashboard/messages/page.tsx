import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { UtilisateurModel } from "@/models/utilisateur";
import { EmployeModel } from "@/models/employe";
import MessagesCenter from "@/components/MessagesCenter";

export const metadata = {
  title: "Messagerie | Smart Farming",
};

export default async function MessagesPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/login");
  }

  const currentUserId = parseInt(sessionUserId);
  const currentUser = await UtilisateurModel.getById(currentUserId);

  if (!currentUser || (currentUser.role !== Role.AGRICULTEUR && currentUser.role !== Role.EMPLOYE)) {
    redirect("/dashboard");
  }

  const contacts = [] as Array<{
    id: number;
    nom: string;
    prenom: string;
    image?: string | null;
    role: string;
    email?: string;
  }>;

  if (currentUser.role === Role.EMPLOYE) {
    const employeInfo = await EmployeModel.getEmployeInfo(currentUserId);
    const agriculteur = employeInfo?.ferme?.agriculteur;
    if (agriculteur) {
      contacts.push({
        id: agriculteur.id,
        nom: agriculteur.nom,
        prenom: agriculteur.prenom,
        image: agriculteur.image,
        role: agriculteur.role,
        email: agriculteur.email,
      });
    }
  } else {
    const employes = await EmployeModel.getByAgriculteur(currentUserId);
    for (const employeFerme of employes) {
      contacts.push({
        id: employeFerme.employe.id,
        nom: employeFerme.employe.nom,
        prenom: employeFerme.employe.prenom,
        image: employeFerme.employe.image,
        role: employeFerme.employe.role,
        email: employeFerme.employe.email,
      });
    }
  }

  return <MessagesCenter currentUser={currentUser} contacts={contacts} />;
}