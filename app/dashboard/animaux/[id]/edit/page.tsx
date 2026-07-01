import { AnimalModel } from "@/models/animal";
import { UtilisateurModel } from "@/models/utilisateur";
import { TerrainModel } from "@/models/terrain";
import AddAnimalForm from "@/components/AddAnimalForm";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { PawPrint } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Modifier un Animal | Smart Farming",
};

export default async function EditAnimalPage({
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

  // Only Admin, Agriculteur, and Vétérinaire can edit
  if (
    user.role !== Role.ADMIN &&
    user.role !== Role.AGRICULTEUR &&
    user.role !== Role.VETERINAIRE
  ) {
    redirect("/dashboard/animaux");
  }

  const [animal, terrains, categories] = await Promise.all([
    AnimalModel.getById(parseInt(id)),
    TerrainModel.getAll(),
    AnimalModel.getCategories(),
  ]);

  if (!animal) notFound();

  const initialData = {
    id: animal.id,
    numero: animal.numero,
    type: animal.type,
    race: animal.race,
    sexe: animal.sexe,
    poids: animal.poids,
    dateNaissance: animal.dateNaissance,
    etatSante: animal.etatSante,
    terrainId: animal.terrainId,
    categorieId: animal.categorieId,
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/animaux" className="hover:text-[#3C6C60] transition-colors">
          Animaux
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/animaux/${animal.id}`}
          className="hover:text-[#3C6C60] transition-colors"
        >
          {animal.numero}
        </Link>
        <span>/</span>
        <span className="text-[#2A453E] font-semibold">Modifier</span>
      </nav>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#3C6C60]/10 flex items-center justify-center">
          <PawPrint className="text-[#3C6C60]" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2A453E]">
            Modifier l'animal
          </h1>
          <p className="text-sm text-zinc-500">
            N° {animal.numero} — {animal.type} {animal.race}
          </p>
        </div>
      </div>

      <AddAnimalForm
        terrains={terrains}
        categories={categories}
        initialData={initialData}
        isEdit={true}
      />
    </div>
  );
}
