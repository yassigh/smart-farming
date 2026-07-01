import { UtilisateurModel } from "@/models/utilisateur";
import { TerrainModel } from "@/models/terrain";
import { CultureModel } from "@/models/culture";
import AddCultureForm from "@/components/AddCultureForm";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { Sprout } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = {
  title: "Modifier la Culture | Smart Farming",
  description: "Modifier les détails d'une culture existante.",
};

export default async function EditCulturePage({
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

  // Only Admin and Agriculteur can edit cultures
  if (user.role !== Role.ADMIN && user.role !== Role.AGRICULTEUR) {
    redirect("/dashboard/cultures");
  }

  const cultureId = parseInt(id);
  const culture = await CultureModel.getById(cultureId);
  if (!culture) notFound();

  let terrains: any[] = [];
  if (user.role === Role.ADMIN) {
    terrains = await TerrainModel.getAll();
  } else if (user.role === Role.AGRICULTEUR) {
    terrains = await TerrainModel.getByAgriculteur(user.id);
  }

  // Fetch culture categories
  const categories = await db.categorie.findMany({
    where: { type: "CULTURE" },
    select: { id: true, nom: true },
    orderBy: { nom: "asc" },
  });

  // Map database format to initial data format expected by AddCultureForm
  const cultureData = {
    id: culture.id,
    nom: culture.nom,
    datePlantation: culture.datePlantation,
    quantitePrevue: culture.quantitePrevue,
    etat: culture.etat,
    terrainId: culture.terrainId,
    categorieId: culture.categorieId,
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/cultures" className="hover:text-[#3C6C60] transition-colors">
          Cultures
        </Link>
        <span>/</span>
        <span className="text-[#2A453E] font-semibold">{culture.nom}</span>
        <span>/</span>
        <span className="text-zinc-400">Modifier</span>
      </nav>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#DDF3E8] flex items-center justify-center">
          <Sprout className="text-[#3C6C5F]" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2A453E]">
            Modifier la culture
          </h1>
          <p className="text-sm text-zinc-500">
            Mettez à jour les informations pour la culture : {culture.nom}
          </p>
        </div>
      </div>

      <AddCultureForm
        user={user}
        terrains={terrains}
        categories={categories}
        initialData={cultureData}
        isEdit={true}
      />
    </div>
  );
}
