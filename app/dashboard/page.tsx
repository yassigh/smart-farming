// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel } from "@/models/utilisateur";
import { AnimalModel } from "@/models/animal";
import { TraitementModel } from "@/models/traitement";
import { FermeModel } from "@/models/ferme";
import { TerrainModel } from "@/models/terrain";
import { CultureModel } from "@/models/culture";
import DashboardView from "@/components/DashboardView";
import { Role } from "@prisma/client";

export const metadata = {
  title: "Tableau de Bord | Smart Farming",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/login");
  }

  const users = await UtilisateurModel.getAll();
  const currentUserId = parseInt(sessionUserId);
  const user = users.find((u) => u.id === currentUserId);

  if (!user) {
    redirect("/login");
  }

  const connectedUserIndex = users.findIndex((u) => u.id === currentUserId);

  // Load veterinarian specific stats
  let vetStats = undefined;
  if (user.role === Role.VETERINAIRE || user.role === Role.ADMIN) {
    const allAnimals = await AnimalModel.getAll();
    
    const sickAnimalsList = allAnimals.filter(
      (a) => a.etatSante === "Malade" || a.etatSante === "En traitement" || a.etatSante === "Blessé"
    );

    const allTreatments = await TraitementModel.getAll();
    const myTreatments = allTreatments.filter((t) => t.veterinaireId === currentUserId);

    vetStats = {
      totalAnimals: allAnimals.length,
      sickAnimalsCount: sickAnimalsList.length,
      myTreatmentsCount: myTreatments.length,
      sickAnimalsList: sickAnimalsList.slice(0, 5),
      recentTreatmentsList: allTreatments.slice(0, 5),
    };
  }

  // Load agriculteur specific stats
  let agriStats = undefined;
  if (user.role === Role.AGRICULTEUR) {
    const [fermes, terrains, animaux, cultures] = await Promise.all([
      FermeModel.getByAgriculteur(user.id),
      TerrainModel.getByAgriculteur(user.id),
      AnimalModel.getByAgriculteur(user.id),
      CultureModel.getByAgriculteur(user.id),
    ]);

    agriStats = {
      totalFermes: fermes.length,
      totalTerrains: terrains.length,
      totalAnimaux: animaux.length,
      totalCultures: cultures.length,
    };
  }

  return (
    <DashboardView
      initialUsers={users}
      initialConnectedUserIndex={connectedUserIndex >= 0 ? connectedUserIndex : 0}
      vetStats={vetStats}
      agriStats={agriStats}
    />
  );
}