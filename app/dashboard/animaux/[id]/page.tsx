import { AnimalModel } from "@/models/animal";
import { UtilisateurModel } from "@/models/utilisateur";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import Link from "next/link";
import {
  PawPrint,
  ArrowLeft,
  Pencil,
  Stethoscope,
  Syringe,
  Calendar,
  Weight,
  MapPin,
  Tag,
} from "lucide-react";
import DeleteAnimalButton from "@/components/DeleteAnimalButton";
import DeleteTraitementButton from "@/components/DeleteTraitementButton";
import DeleteVaccinationButton from "@/components/DeleteVaccinationButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const animal = await AnimalModel.getById(parseInt(id));
  return {
    title: animal
      ? `${animal.numero} — ${animal.type} | Smart Farming`
      : "Animal | Smart Farming",
  };
}

const ETAT_COLORS: Record<string, string> = {
  Sain: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Malade: "bg-red-100 text-red-700 border-red-200",
  "En traitement": "bg-amber-100 text-amber-800 border-amber-200",
  Blessé: "bg-orange-100 text-orange-700 border-orange-200",
  Décédé: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default async function AnimalDetailPage({
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

  const animal = await AnimalModel.getById(parseInt(id));
  if (!animal) notFound();

  const canEdit =
    user.role === Role.ADMIN ||
    user.role === Role.AGRICULTEUR ||
    user.role === Role.VETERINAIRE;
  const canDelete = user.role === Role.ADMIN;
  const canMedical =
    user.role === Role.VETERINAIRE || user.role === Role.ADMIN;

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link
          href="/dashboard/animaux"
          className="hover:text-[#3C6C60] transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Animaux
        </Link>
        <span>/</span>
        <span className="text-[#2A453E] font-semibold">{animal.numero}</span>
      </nav>

      {/* Hero card */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-md overflow-hidden">
        {/* Top banner */}
        <div className="h-3 bg-gradient-to-r from-[#2A453E] to-[#3C6C60]" />

        <div className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left: identity */}
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#3C6C60]/10 flex items-center justify-center shrink-0">
              <PawPrint size={32} className="text-[#3C6C60]" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-[#2A453E]">
                  {animal.numero}
                </h1>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                    ETAT_COLORS[animal.etatSante] || "bg-zinc-100 text-zinc-600 border-zinc-200"
                  }`}
                >
                  {animal.etatSante}
                </span>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    animal.sexe === "MALE"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {animal.sexe === "MALE" ? "♂ Mâle" : "♀ Femelle"}
                </span>
              </div>
              <p className="text-zinc-500 mt-1">
                {animal.type} · {animal.race} · {animal.categorie.nom}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {canMedical && (
              <>
                <Link
                  href={`/dashboard/animaux/${animal.id}/traitement`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-sm font-semibold transition-all"
                >
                  <Stethoscope size={16} />
                  Traitement
                </Link>
                <Link
                  href={`/dashboard/animaux/${animal.id}/vaccination`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-sm font-semibold transition-all"
                >
                  <Syringe size={16} />
                  Vaccination
                </Link>
              </>
            )}
            {canEdit && (
              <Link
                href={`/dashboard/animaux/${animal.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A453E] hover:bg-[#3C6C60] text-white text-sm font-semibold transition-all"
              >
                <Pencil size={16} />
                Modifier
              </Link>
            )}
            {canDelete && (
              <DeleteAnimalButton animalId={animal.id} />
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-zinc-100">
          {[
            {
              icon: <Weight size={16} className="text-zinc-400" />,
              label: "Poids",
              value: `${animal.poids} kg`,
            },
            {
              icon: <Calendar size={16} className="text-zinc-400" />,
              label: "Date de naissance",
              value: fmtDate(animal.dateNaissance),
            },
            {
              icon: <MapPin size={16} className="text-zinc-400" />,
              label: "Terrain",
              value: animal.terrain.nom,
            },
            {
              icon: <Tag size={16} className="text-zinc-400" />,
              label: "Ferme",
              value: animal.terrain.ferme.nom,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 border-r last:border-r-0 border-zinc-100 flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold uppercase">
                {item.icon}
                {item.label}
              </div>
              <p className="text-sm font-bold text-zinc-700">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Medical History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traitements */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <Stethoscope size={16} className="text-amber-600" />
              </div>
              <h2 className="font-bold text-[#2A453E]">Traitements</h2>
            </div>
            <span className="text-xs text-zinc-400 font-semibold bg-zinc-100 px-2.5 py-1 rounded-full">
              {animal.traitements.length}
            </span>
          </div>

          {animal.traitements.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              <Stethoscope size={32} className="mx-auto mb-2 text-zinc-200" />
              <p className="text-sm">Aucun traitement enregistré</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto">
              {animal.traitements.map((t) => (
                <div key={t.id} className="p-4 hover:bg-zinc-50 transition-colors relative group">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-zinc-800 text-sm">{t.medicament}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">{fmtDate(t.date)}</span>
                      {canMedical && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DeleteTraitementButton id={t.id} animalId={animal.id} />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{t.description}</p>
                  {t.dosage && (
                    <p className="text-xs text-amber-600 mt-1 font-semibold">💊 {t.dosage}</p>
                  )}
                  <p className="text-xs text-zinc-400 mt-1">
                    Dr. {t.veterinaire.prenom} {t.veterinaire.nom}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vaccinations */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <Syringe size={16} className="text-blue-600" />
              </div>
              <h2 className="font-bold text-[#2A453E]">Vaccinations</h2>
            </div>
            <span className="text-xs text-zinc-400 font-semibold bg-zinc-100 px-2.5 py-1 rounded-full">
              {animal.vaccinations.length}
            </span>
          </div>

          {animal.vaccinations.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              <Syringe size={32} className="mx-auto mb-2 text-zinc-200" />
              <p className="text-sm">Aucune vaccination enregistrée</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto">
              {animal.vaccinations.map((v) => (
                <div key={v.id} className="p-4 hover:bg-zinc-50 transition-colors relative group">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-zinc-800 text-sm">{v.nomVaccin}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          v.statut === "A_JOUR"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {v.statut === "A_JOUR" ? "À jour" : "En retard"}
                      </span>
                      {canMedical && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DeleteVaccinationButton id={v.id} animalId={animal.id} />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Administré le {fmtDate(v.dateAdministered)}
                  </p>
                  {v.dateRappel && (
                    <p className="text-xs text-blue-600 mt-1 font-semibold">
                      📅 Rappel : {fmtDate(v.dateRappel)}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 mt-1">
                    Dr. {v.veterinaire.prenom} {v.veterinaire.nom}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
