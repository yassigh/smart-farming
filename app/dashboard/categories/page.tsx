// app/dashboard/categories/page.tsx
import { CategorieModel } from "@/models/categorie";
import AddCategorieForm from "@/components/AddCategorieForm";
import CategorieTable from "@/components/CategorieTable";
import { cookies } from "next/headers";
import { UtilisateurModel } from "@/models/utilisateur";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Tag, PawPrint, Wheat } from "lucide-react";

export const metadata = {
  title: "Gestion des Catégories | Smart Farming",
  description: "Gérez les catégories d'animaux et de cultures de votre exploitation.",
};

export default async function CategoriesPage() {
  // Auth guard — admin only
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  const user = userId ? await UtilisateurModel.getById(Number(userId)) : null;

  if (!user || user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const categories = await CategorieModel.getAll();

  return (
    <div className="min-h-screen bg-primary p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-theme pb-6">

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[#DDF3E8] dark:bg-secondary/20 flex items-center justify-center">
                <Tag size={24} className="text-secondary" />
              </div>

              <div>
                <h1 className="text-4xl font-bold text-primary">
                  Gestion des Catégories
                </h1>

                <p className="text-muted mt-1">
                  Créez, modifiez et supprimez les catégories
                  d'animaux et de cultures.
                </p>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="flex items-center gap-3 flex-wrap">

            <div className={`
              flex items-center gap-2
              px-5 py-3
              rounded-full
              bg-[#DDF3E8] dark:bg-secondary/20
              border border-[#9DAE7A]/30 dark:border-secondary/30
              text-secondary
              font-semibold
            `}>
              <PawPrint size={18} />
              {categories.filter(
                (c) => c.type === "ANIMAL"
              ).length}
              <span>Animaux</span>
            </div>

            <div className={`
              flex items-center gap-2
              px-5 py-3
              rounded-full
              bg-[#FFF3DA] dark:bg-[#FFC490]/20
              border border-[#FFC490] dark:border-[#FFC490]/30
              text-[#B7741D] dark:text-[#FFC490]
              font-semibold
            `}>
              <Wheat size={18} />
              {categories.filter(
                (c) => c.type === "CULTURE"
              ).length}
              <span>Cultures</span>
            </div>

          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* FORM */}
          <div className="lg:col-span-1">
            <AddCategorieForm />
          </div>

          {/* TABLE */}
          <div className={`
            lg:col-span-2
            bg-card
            rounded-3xl
            border border-theme
            shadow-lg shadow-theme
            overflow-hidden
          `}>
            <div className={`
              px-6
              py-5
              border-b
              border-theme
              flex
              items-center
              justify-between
            `}>
              <div className="flex items-center gap-3">

                <div className={`
                  w-10
                  h-10
                  rounded-xl
                  bg-[#FFF3DA] dark:bg-secondary/20
                  flex
                  items-center
                  justify-center
                `}>
                  <Tag
                    size={18}
                    className="text-secondary"
                  />
                </div>

                <h2 className="text-xl font-bold text-primary">
                  Liste des Catégories

                  <span className={`
                    ml-2
                    text-sm
                    font-normal
                    text-muted
                  `}>
                    ({categories.length})
                  </span>
                </h2>
              </div>
            </div>

            <CategorieTable categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}