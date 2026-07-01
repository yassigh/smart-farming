import { UtilisateurModel } from "@/models/utilisateur";
import { TerrainModel } from "@/models/terrain";
import AddCultureForm from "@/components/AddCultureForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Sprout } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = {
  title: "Ajouter une Culture | Smart Farming",
  description: "Enregistrer une nouvelle culture sur un terrain.",
};

export default async function AddCulturePage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;
  if (!sessionUserId) redirect("/login");

  const user = await UtilisateurModel.getById(parseInt(sessionUserId));
  if (!user) redirect("/login");

  // Only Admin and Agriculteur can add cultures
  if (user.role !== Role.ADMIN && user.role !== Role.AGRICULTEUR) {
    redirect("/dashboard/cultures");
  }

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

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/cultures" className="hover:text-[#3C6C60] transition-colors">
          Cultures
        </Link>
        <span>/</span>
        <span className="text-[#2A453E] font-semibold">Ajouter</span>
      </nav>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#DDF3E8] flex items-center justify-center">
          <Sprout className="text-[#3C6C5F]" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2A453E]">
            Ajouter une culture
          </h1>
          <p className="text-sm text-zinc-500">
            Enregistrez une nouvelle plantation sur l'un de vos terrains
          </p>
        </div>
      </div>

      <AddCultureForm user={user} terrains={terrains} categories={categories} />
    </div>
  );
}
