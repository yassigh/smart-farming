import { AnimalModel } from "@/models/animal";
import { UtilisateurModel } from "@/models/utilisateur";
import AddTraitementForm from "@/components/AddTraitementForm";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import Link from "next/link";
import { Stethoscope } from "lucide-react";

export const metadata = {
  title: "Ajouter un Traitement | Smart Farming",
};

export default async function AddTraitementPage({
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

  // Only Veterinaire and Admin can add treatments
  if (user.role !== Role.VETERINAIRE && user.role !== Role.ADMIN) {
    redirect(`/dashboard/animaux/${id}`);
  }

  const animal = await AnimalModel.getById(parseInt(id));
  if (!animal) notFound();

  // Fetch all vétérinaires for the selector
  const veterinaires = await db.utilisateur.findMany({
    where: { role: Role.VETERINAIRE },
    select: { id: true, nom: true, prenom: true },
    orderBy: { nom: "asc" },
  });

  // If no vets exist yet, still allow the current user if they're admin
  const vetList =
    veterinaires.length > 0
      ? veterinaires
      : [{ id: user.id, nom: user.nom, prenom: user.prenom }];

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
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
        <span className="text-[#2A453E] font-semibold">Traitement</span>
      </nav>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Stethoscope className="text-amber-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2A453E]">
            Ajouter un traitement
          </h1>
          <p className="text-sm text-zinc-500">
            Enregistrer un soin médical pour {animal.numero}
          </p>
        </div>
      </div>

      <AddTraitementForm
        animalId={animal.id}
        animalNumero={animal.numero}
        veterinaires={vetList}
        currentVeterinaireId={user.id}
      />
    </div>
  );
}
