import { AnimalModel } from "@/models/animal";
import AddAnimalForm from "@/components/AddAnimalForm";
import { UtilisateurModel } from "@/models/utilisateur";
import { TerrainModel } from "@/models/terrain";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { PawPrint } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Ajouter un Animal | Smart Farming",
  description: "Enregistrer un nouvel animal dans le système.",
};

export default async function AddAnimalPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;
  if (!sessionUserId) redirect("/login");

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));
  if (!user) redirect("/login");

  // Only Admin and Agriculteur can add animals
  if (user.role !== Role.ADMIN && user.role !== Role.AGRICULTEUR) {
    redirect("/dashboard/animaux");
  }

  const [terrains, categories] = await Promise.all([
    TerrainModel.getAll(),
    AnimalModel.getCategories(),
  ]);

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/animaux" className="hover:text-[#3C6C60] transition-colors">
          Animaux
        </Link>
        <span>/</span>
        <span className="text-[#2A453E] font-semibold">Ajouter</span>
      </nav>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#3C6C60]/10 flex items-center justify-center">
          <PawPrint className="text-[#3C6C60]" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2A453E]">
            Ajouter un animal
          </h1>
          <p className="text-sm text-zinc-500">
            Enregistrez un nouvel animal dans votre ferme
          </p>
        </div>
      </div>

      <AddAnimalForm terrains={terrains} categories={categories} />
    </div>
  );
}
