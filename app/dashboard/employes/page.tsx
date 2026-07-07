import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { UtilisateurModel } from "@/models/utilisateur";
import { EmployeModel } from "@/models/employe";
import { FermeModel } from "@/models/ferme";
import { AssignEmployeForm } from "@/components/AssignEmployeForm";
import FermeSelector from "@/components/FermeSelector";
import AddEmployeToFarmForm from "@/components/AddEmployeToFarmForm";
import RemoveEmployeButton from "@/components/RemoveEmployeButton";

interface PageProps {
  searchParams: Promise<{ fermeId?: string }>;
}

export const metadata = {
  title: "Mes Employés | Smart Farming",
};

export default async function EmployesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedFermeIdStr = resolvedSearchParams.fermeId;

  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/login");
  }

  const currentUserId = parseInt(sessionUserId);
  const currentUser = await UtilisateurModel.getById(currentUserId);

  if (!currentUser || (currentUser.role !== Role.AGRICULTEUR && currentUser.role !== Role.ADMIN)) {
    redirect("/dashboard");
  }

  // Fetch farms depending on role
  let fermes: any[] = [];
  if (currentUser.role === Role.ADMIN) {
    fermes = await FermeModel.getAll();
  } else {
    fermes = await FermeModel.getByAgriculteur(currentUserId);
  }

  // Determine selected farm ID
  let selectedFermeId: number | null = null;
  if (fermes.length > 0) {
    if (selectedFermeIdStr) {
      const parsedId = parseInt(selectedFermeIdStr);
      if (!isNaN(parsedId)) {
        // If farmer, make sure they own it
        const exists = fermes.some((f) => f.id === parsedId);
        if (exists) {
          selectedFermeId = parsedId;
        } else {
          selectedFermeId = fermes[0].id;
        }
      } else {
        selectedFermeId = fermes[0].id;
      }
    } else {
      selectedFermeId = fermes[0].id;
    }
  }

  // Load data for the selected farm
  let employes: any[] = [];
  let terrains: any[] = [];
  let animaux: any[] = [];
  let cultures: any[] = [];
  let availableEmployees: any[] = [];

  if (selectedFermeId !== null) {
    const [empList, terrList, animList, cultList] = await Promise.all([
      EmployeModel.getByFerme(selectedFermeId),
      db.terrain.findMany({ where: { fermeId: selectedFermeId } }),
      db.animal.findMany({
        where: { terrain: { fermeId: selectedFermeId } },
        include: { terrain: { include: { ferme: true } }, categorie: true },
      }),
      db.culture.findMany({
        where: { terrain: { fermeId: selectedFermeId } },
        include: { terrain: { include: { ferme: true } }, categorie: true },
      }),
    ]);

    employes = empList;
    terrains = terrList;
    animaux = animList;
    cultures = cultList;

    if (currentUser.role === Role.ADMIN) {
      const allEmployees = await db.utilisateur.findMany({
        where: { role: Role.EMPLOYE },
        select: { id: true, nom: true, prenom: true, email: true },
        orderBy: { nom: "asc" },
      });

      const currentFermeEmployeeIds = employes.map((e) => e.employeId);
      availableEmployees = allEmployees.filter((e) => !currentFermeEmployeeIds.includes(e.id));
    }
  }

  const selectedFerme = fermes.find((f) => f.id === selectedFermeId);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d1a15] p-4 md:p-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#29453E] dark:text-white">
              {currentUser.role === Role.ADMIN ? "Gestion des Employés" : "Mes Employés"}
            </h1>
            <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-1">
              {currentUser.role === Role.ADMIN
                ? "Rattachez des employés aux exploitations et configurez leurs affectations."
                : "Assignez un terrain, des animaux et des cultures à chaque employé."}
            </p>
          </div>

          {fermes.length > 0 && (
            <FermeSelector fermes={fermes} selectedId={selectedFermeId || 0} />
          )}
        </div>

        {fermes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#3C6C5F]/15 bg-white dark:bg-[#1a2e28] p-8 text-center text-sm text-[#3C6C5F]/60 shadow-sm">
            Aucune exploitation agricole n'est encore configurée dans le système.
            {currentUser.role === Role.ADMIN && (
              <p className="mt-2 text-xs">Veuillez d'abord créer une ferme dans la gestion des fermes.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left/Main list of employees */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-[#29453E] dark:text-white">
                  Employés de la ferme {selectedFerme?.nom} ({employes.length})
                </h2>
              </div>

              {employes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#3C6C5F]/15 bg-white dark:bg-[#1a2e28] p-8 text-sm text-[#3C6C5F]/60 shadow-sm">
                  Aucun employé n'est encore rattaché à cette ferme.
                  {currentUser.role === Role.ADMIN && (
                    <span className="block mt-1 font-medium text-[#29453E] dark:text-white">
                      Utilisez le formulaire ci-contre pour en ajouter un.
                    </span>
                  )}
                </div>
              ) : (
                employes.map((employeFerme) => (
                  <div key={employeFerme.id} className="relative">
                    {currentUser.role === Role.ADMIN && (
                      <div className="absolute top-4 right-14 z-10">
                        <RemoveEmployeButton
                          employeFermeId={employeFerme.id}
                          employeName={`${employeFerme.employe.prenom} ${employeFerme.employe.nom}`}
                        />
                      </div>
                    )}
                    <AssignEmployeForm
                      employeFerme={employeFerme}
                      terrains={terrains}
                      animaux={animaux}
                      cultures={cultures}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Right details / forms */}
            <div className="space-y-6">
              {currentUser.role === Role.ADMIN && selectedFermeId !== null && (
                <AddEmployeToFarmForm
                  fermeId={selectedFermeId}
                  availableEmployees={availableEmployees}
                />
              )}

              {/* Farm Details Card */}
              {selectedFerme && (
                <div className="rounded-2xl border border-[#3C6C5F]/10 bg-white dark:bg-[#1a2e28] p-6 space-y-4 shadow-sm">
                  <h3 className="font-semibold text-sm text-[#29453E] dark:text-white uppercase tracking-wider">
                    Détails de l'exploitation
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <span className="text-[#3C6C5F]/60">Nom :</span>
                      <span className="font-semibold text-[#29453E] dark:text-white">{selectedFerme.nom}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <span className="text-[#3C6C5F]/60">Superficie :</span>
                      <span className="font-semibold text-[#29453E] dark:text-white">{selectedFerme.superficie} ha</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <span className="text-[#3C6C5F]/60">Adresse :</span>
                      <span className="font-semibold text-right text-[#29453E] dark:text-white max-w-[180px] truncate" title={selectedFerme.adresse}>{selectedFerme.adresse}</span>
                    </div>
                    {currentUser.role === Role.ADMIN && (
                      <div className="flex justify-between pb-1">
                        <span className="text-[#3C6C5F]/60">Propriétaire :</span>
                        <span className="font-semibold text-[#29453E] dark:text-white">
                          {selectedFerme.agriculteur.prenom} {selectedFerme.agriculteur.nom}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}