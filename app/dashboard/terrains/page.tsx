import { TerrainModel } from "@/models/terrain";
import TerrainTable from "@/components/TerrainTable";
import { UtilisateurModel } from "@/models/utilisateur";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export default async function TerrainsPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/login");
  }

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));

  if (!user) {
    redirect("/login");
  }

  let terrains: any[] = [];

  switch (user.role) {
    case Role.ADMIN:
      terrains = await TerrainModel.getAll();
      break;

    case Role.AGRICULTEUR:
      terrains = await TerrainModel.getByAgriculteur(user.id);
      break;

    case Role.EMPLOYE: {
      const terrainsEmploye = await TerrainModel.getByEmploye(user.id);
      terrains = terrainsEmploye.length > 0 ? terrainsEmploye : await TerrainModel.getAll();
      break;
    }

    case Role.VETERINAIRE:
      terrains = await TerrainModel.getByVeterinaire();
      break;

    default:
      terrains = [];
  }

  return <TerrainTable initialTerrains={terrains} user={user} />;
}