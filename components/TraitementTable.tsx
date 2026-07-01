// components/TraitementTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteTraitementAction } from "@/actions/animal";
import {
  Stethoscope,
  Plus,
  Search,
  Trash2,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  HeartPulse,
  Pill,
  Syringe,
  FileText,
  Sparkles,
  Loader2,
  Clock,
  Dog,
  Building2,
  UserCircle
} from "lucide-react";
import { Role } from "@prisma/client";

interface Traitement {
  id: number;
  date: Date;
  dateFin: Date | null;
  medicament: string;
  description: string;
  dosage: string | null;
  observation: string | null;
  animal: {
    id: number;
    numero: string;
    type: string;
    terrain: {
      ferme: {
        nom: string;
      };
    };
  };
  veterinaire: {
    id: number;
    nom: string;
    prenom: string;
  };
}

interface TraitementTableProps {
  user: {
    id: number;
    role: Role;
  };
  initialTraitements: Traitement[];
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TraitementTable({ user, initialTraitements }: TraitementTableProps) {
  const [traitements, setTraitements] = useState<Traitement[]>(initialTraitements || []);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const canManage = user?.role === Role.ADMIN || user?.role === Role.VETERINAIRE;
  const ITEMS_PER_PAGE = 8;

  const handleDelete = async (id: number, animalId: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce traitement ?")) return;
    setDeletingId(id);
    setError(null);

    const result = await deleteTraitementAction(id, animalId);
    setDeletingId(null);

    if (result.success) {
      setTraitements((old) => old.filter((t) => t.id !== id));
    } else {
      setError(result.error || "Erreur lors de la suppression.");
    }
  };

  const filteredTraitements = traitements.filter((traitement) =>
    (
      traitement.medicament + " " +
      traitement.animal.numero + " " +
      traitement.animal.type + " " +
      traitement.description + " " +
      traitement.veterinaire.prenom + " " +
      traitement.veterinaire.nom
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTraitements.length / ITEMS_PER_PAGE);
  const paginatedTraitements = filteredTraitements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (traitements.length === 0) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <Stethoscope size={44} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Aucun traitement médical</h2>
        <p className="text-[#3C6C5F]/70 mt-2 max-w-md mx-auto text-sm">
          Aucun traitement médical n'a été enregistré pour le moment.
        </p>
        {canManage && (
          <Link
            href="/dashboard/traitements/add"
            className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl"
          >
            <Plus size={18} />
            Enregistrer un traitement
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 overflow-hidden transition-all hover:shadow-xl">

      {/* HEADER */}
      <div className="p-6 border-b border-[#FFC490]/20 bg-gradient-to-r from-[#FFF3DA]/30 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DDF3E8] flex items-center justify-center shadow-sm">
              <Stethoscope size={22} className="text-[#3C6C5F]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
                Suivi des Traitements
                <Sparkles size={16} className="text-[#FFC490]" />
              </h2>
              <p className="text-sm text-[#3C6C5F]/60">
                {filteredTraitements.length} traitement(s) trouvé(s)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C6C5F]/40" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#FFC490]/30 bg-[#FAFAFA] text-sm text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all w-full sm:w-48 focus:w-60"
              />
            </div>

            {canManage && (
              <Link
                href="/dashboard/traitements/add"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md shadow-[#3C6C5F]/20 hover:shadow-lg"
              >
                <Plus size={16} />
                Enregistrer
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FFF3DA] text-[#29453E] text-xs uppercase tracking-wider">
              <th className="px-6 py-4 text-left font-semibold">Animal</th>
              <th className="px-6 py-4 text-left font-semibold">Médicament</th>
              <th className="px-6 py-4 text-left font-semibold">Dosage</th>
              <th className="px-6 py-4 text-left font-semibold">Période</th>
              <th className="px-6 py-4 text-left font-semibold">Vétérinaire</th>
              <th className="px-6 py-4 text-left font-semibold">Description</th>
              {canManage && (
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#FFC490]/10">
            {paginatedTraitements.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-[#FFF3DA]/30 transition-all duration-200 group"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <Link
                      href={`/dashboard/animaux/${t.animal.id}`}
                      className="font-bold text-[#3C6C5F] hover:underline text-sm flex items-center gap-1.5"
                    >
                      <Dog size={14} className="text-[#3C6C5F]" />
                      {t.animal.numero}
                    </Link>
                    <span className="text-xs text-[#3C6C5F]/60 flex items-center gap-1">
                      <Building2 size={10} />
                      {t.animal.type} — {t.animal.terrain.ferme.nom}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DDF3E8] text-[#3C6C5F] text-xs font-semibold border border-[#9DAE7A]/30">
                    <Pill size={12} />
                    {t.medicament}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-[#29453E]">
                  {t.dosage || <span className="text-[#29453E]/30 italic">Non spécifié</span>}
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#29453E]">
                      <Calendar size={12} className="text-[#3C6C5F]" />
                      {formatDate(t.date)}
                    </div>
                    {t.dateFin && (
                      <div className="flex items-center gap-1.5 text-[#29453E]/50">
                        <Clock size={12} className="text-[#3C6C5F]/40" />
                        → {formatDate(t.dateFin)}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-[#29453E]">
                    <UserCircle size={14} className="text-[#3C6C5F]/40" />
                    Dr. {t.veterinaire.prenom} {t.veterinaire.nom}
                  </span>
                </td>

                <td className="px-6 py-4 max-w-xs">
                  <div className="space-y-1">
                    <p className="text-sm text-[#29453E] line-clamp-2">{t.description}</p>
                    {t.observation && (
                      <div className="flex items-start gap-1 text-xs text-[#29453E]/60 bg-[#FFF3DA]/30 p-1.5 rounded-lg border border-[#FFC490]/20">
                        <FileText size={10} className="mt-0.5 flex-shrink-0 text-[#3C6C5F]/40" />
                        <span className="italic line-clamp-1">{t.observation}</span>
                      </div>
                    )}
                  </div>
                </td>

                {canManage && (
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(t.id, t.animal.id)}
                        disabled={deletingId === t.id}
                        className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
                      >
                        {deletingId === t.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-[#FFC490]/20 bg-[#FAFAFA]">
          <p className="text-xs text-[#3C6C5F]/50">
            Page {currentPage} sur {totalPages}
          </p>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                  currentPage === page
                    ? "bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white shadow-md shadow-[#3C6C5F]/20"
                    : "bg-[#FFF3DA] text-[#29453E] hover:bg-[#FFC490]/40"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}