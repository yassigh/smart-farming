import { UtilisateurModel } from "@/models/utilisateur";
import { TerrainModel } from "@/models/terrain";
import { FermeModel } from "@/models/ferme";
import AddTerrainForm from "@/components/AddTerrainForm";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { MapPinned } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Modifier le Terrain | Smart Farming",
  description: "Modifier les détails d'un terrain existant.",
};

export default async function EditTerrainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;
  if (!sessionUserId) redirect("/login");

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));
  if (!user) redirect("/login");

  // Only Admin and Agriculteur can edit terrains
  if (user.role !== Role.ADMIN && user.role !== Role.AGRICULTEUR) {
    redirect("/dashboard/terrains");
  }

  const terrainId = parseInt(id);
  const terrain = await TerrainModel.getById(terrainId) as any;
  if (!terrain) notFound();

  // For Agriculteur, double check that they own the farm this terrain is in
  if (user.role === Role.AGRICULTEUR && terrain.ferme.agriculteurId !== user.id) {
    redirect("/dashboard/terrains");
  }

  let fermes: any[] = [];
  if (user.role === Role.ADMIN) {
    fermes = await FermeModel.getAll();
  } else if (user.role === Role.AGRICULTEUR) {
    fermes = await FermeModel.getByAgriculteur(user.id);
  }

  const terrainData = {
    id: terrain.id,
    nom: terrain.nom,
    superficie: terrain.superficie,
    typeSol: terrain.typeSol,
    localisation: terrain.localisation,
    latitude: terrain.latitude,
    longitude: terrain.longitude,
    fermeId: terrain.fermeId,
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/terrains" className="hover:text-[#3C6C60] transition-colors">
          Terrains
        </Link>
        <span>/</span>
        <span className="text-[#2A453E] font-semibold">{terrain.nom}</span>
        <span>/</span>
        <span className="text-zinc-400">Modifier</span>
      </nav>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#DDF3E8] flex items-center justify-center">
          <MapPinned className="text-[#3C6C5F]" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2A453E]">
            Modifier le terrain
          </h1>
          <p className="text-sm text-zinc-500">
            Mettez à jour les informations pour le terrain : {terrain.nom}
          </p>
        </div>
      </div>

      <AddTerrainForm
        fermes={fermes}
        initialData={terrainData}
        isEdit={true}
      />
    </div>
  );
}
