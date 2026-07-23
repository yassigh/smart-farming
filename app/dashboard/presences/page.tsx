import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UtilisateurModel } from "@/models/utilisateur";
import { PresenceModel } from "@/models/presence";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import PresenceManager from "@/components/PresenceManager";
import PresenceSelfView from "@/components/PresenceSelfView";

export const metadata = {
  title: "Présences & Pointage | Smart Farming",
  description: "Suivi quotidien des présences, absences et justificatifs médicaux.",
};

export default async function PresencesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  const user = userId ? await UtilisateurModel.getById(Number(userId)) : null;

  if (!user) {
    redirect("/login");
  }

  const isManager = user.role === Role.ADMIN || user.role === Role.AGRICULTEUR;

  if (isManager) {
    // 1. Fetch staff members (Employees and Veterinarians)
    let staffUsersWhere: any = {
      role: {
        in: [Role.EMPLOYE, Role.VETERINAIRE],
      },
    };

    if (user.role === Role.AGRICULTEUR) {
      staffUsersWhere = {
        ...staffUsersWhere,
        OR: [
          { employeFermes: { some: { ferme: { agriculteurId: user.id } } } },
          { traitements: { some: { animal: { terrain: { ferme: { agriculteurId: user.id } } } } } },
          { vaccinations: { some: { animal: { terrain: { ferme: { agriculteurId: user.id } } } } } },
        ]
      };
    }

    const staffUsers = await db.utilisateur.findMany({
      where: staffUsersWhere,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: {
        nom: "asc",
      },
    });

    // 2. Fetch today's presences
    let initialPresences = await PresenceModel.getAllToday();

    if (user.role !== Role.ADMIN) {
      const staffIds = staffUsers.map((u) => u.id);
      initialPresences = initialPresences.filter((p) => staffIds.includes(p.utilisateurId));
    }

    // 3. Fetch count of worked days for each user for current month
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const workedDaysMap: Record<number, number> = {};
    for (const staff of staffUsers) {
      workedDaysMap[staff.id] = await PresenceModel.getWorkedDaysCountInMonth(
        staff.id,
        currentYear,
        currentMonth
      );
    }

    // Convert Date objects to ISO strings to make them fully serializable
    const serializablePresences = initialPresences.map(p => ({
      ...p,
      date: p.date.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return (
      <div className="min-h-screen bg-[#FAF7F0] p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <PresenceManager 
            users={staffUsers} 
            initialPresences={serializablePresences} 
            workedDaysMap={workedDaysMap} 
          />
        </div>
      </div>
    );
  } else {
    // Employee or Veterinarian view (Self History)
    const initialHistory = await PresenceModel.getByUtilisateur(user.id);
    
    // Convert Date objects to ISO strings to make them fully serializable
    const serializableHistory = initialHistory.map(p => ({
      ...p,
      date: p.date.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    const serializableUser = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      image: user.image,
    };

    return (
      <div className="min-h-screen bg-[#FAF7F0] p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <PresenceSelfView 
            initialHistory={serializableHistory} 
            connectedUser={serializableUser} 
          />
        </div>
      </div>
    );
  }
}
