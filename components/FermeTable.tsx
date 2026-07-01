// components/FermeTable.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deleteFermeAction } from "@/actions/ferme";
import {
  Pencil,
  Trash2,
  Warehouse,
  Search,
  Plus,
  MapPin,
  Ruler,
  User,
  Sparkles,
} from "lucide-react";
import { Role } from "@prisma/client";

interface Ferme {
  id: number;
  nom: string;
  adresse: string;
  superficie: number;
  agriculteur: {
    id: number;
    nom: string;
    prenom: string;
  };
}

interface Props {
  initialFermes: Ferme[];
  user: {
    id: number;
    role: Role;
  };
}

export default function FermeTable({
  initialFermes,
  user,
}: Props) {
  const [fermes, setFermes] = useState(initialFermes || []);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const canManage = user?.role === Role.ADMIN || user?.role === Role.AGRICULTEUR;
  const canView = user?.role === Role.EMPLOYE || user?.role === Role.VETERINAIRE || canManage;

  const ITEMS_PER_PAGE = 5;

  async function handleDelete(id: number) {
    if (!confirm("Voulez-vous vraiment supprimer cette ferme ?")) return;
    setError(null);
    const result = await deleteFermeAction(id);
    if (result.success) {
      setFermes((old) => old.filter((f) => f.id !== id));
    } else {
      setError(result.error || "Erreur lors de la suppression.");
    }
  }

  const filteredFermes = useMemo(() => {
    return fermes.filter((ferme) =>
      (
        ferme.nom +
        " " +
        ferme.adresse +
        " " +
        ferme.agriculteur.nom +
        " " +
        ferme.agriculteur.prenom
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [fermes, search]);

  const totalPages = Math.ceil(filteredFermes.length / ITEMS_PER_PAGE);
  const paginatedFermes = filteredFermes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!canView) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <Warehouse size={44} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Accès restreint</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          Vous n'avez pas les autorisations nécessaires pour voir cette page.
        </p>
      </div>
    );
  }

  if (fermes.length === 0) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <Warehouse size={48} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Aucune ferme</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          {canManage 
            ? "Commencez par ajouter votre première ferme."
            : "Aucune ferme n'est actuellement enregistrée dans le système."}
        </p>
        {canManage && (
          <Link
            href="/dashboard/fermes/add"
            className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl"
          >
            <Plus size={18} />
            Ajouter une ferme
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
              <Warehouse size={22} className="text-[#3C6C5F]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
                Liste des Fermes
                <Sparkles size={16} className="text-[#FFC490]" />
              </h2>
              <p className="text-sm text-[#3C6C5F]/60">
                {filteredFermes.length} ferme(s) trouvée(s)
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
                href="/dashboard/fermes/add"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md shadow-[#3C6C5F]/20 hover:shadow-lg"
              >
                <Plus size={16} />
                Ajouter
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="m-5 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FFF3DA] text-[#29453E] text-xs uppercase tracking-wider">
              <th className="px-6 py-4 text-left font-semibold">Ferme</th>
              <th className="px-6 py-4 text-left font-semibold">Adresse</th>
              <th className="px-6 py-4 text-left font-semibold">Superficie</th>
              <th className="px-6 py-4 text-left font-semibold">Propriétaire</th>
              {canManage && (
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedFermes.map((ferme) => (
              <tr
                key={ferme.id}
                className="border-b border-[#FFC490]/10 hover:bg-[#FFF3DA]/30 transition-all duration-200 group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Warehouse size={18} className="text-[#3C6C5F]" />
                    </div>
                    <span className="font-semibold text-[#29453E]">
                      {ferme.nom}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-[#3C6C5F]/80">
                    <MapPin size={14} className="text-[#3C6C5F]/40" />
                    {ferme.adresse}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3DA] text-[#29453E] text-xs font-semibold border border-[#FFC490]/30">
                    <Ruler size={12} />
                    {ferme.superficie} ha
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-[#3C6C5F]/80">
                    <User size={14} className="text-[#3C6C5F]/40" />
                    {ferme.agriculteur.prenom} {ferme.agriculteur.nom}
                  </span>
                </td>

                {canManage && (
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/fermes/${ferme.id}/edit`}
                        className="p-2.5 rounded-xl bg-[#DDF3E8] text-[#3C6C5F] hover:bg-[#3C6C5F] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <Pencil size={16} />
                      </Link>

                      <button
                        onClick={() => handleDelete(ferme.id)}
                        className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <Trash2 size={16} />
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