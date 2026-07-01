// components/TerrainTable.tsx
"use client";

import { deleteTerrainAction } from "@/actions/terrain";
import {
  Pencil,
  Trash2,
  MapPinned,
  Search,
  Plus,
  Building2,
  Ruler,
  TreePine,
  MapPin,
  Sparkles,
  Compass,
  Droplets,
  Mountain,
  Wind
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Role } from "@prisma/client";
import dynamic from "next/dynamic";

const TerrainsMapView = dynamic(() => import("./TerrainsMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-3xl bg-zinc-50 border-2 border-dashed border-[#FFC490]/20 flex items-center justify-center text-[#3C6C5F]/50 text-sm font-medium animate-pulse mb-6">
      Chargement de la carte des terrains...
    </div>
  ),
});

interface Terrain {
  id: number;
  nom: string;
  superficie: number;
  typeSol: string;
  localisation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ferme: {
    id: number;
    nom: string;
  };
}

interface Props {
  initialTerrains: Terrain[];
  user: {
    role: Role;
  };
}

const typeSolIcons: Record<string, any> = {
  Argileux: Droplets,
  Sableux: Mountain,
  Limoneux: TreePine,
  Humifère: Sparkles,
  Calcaire: Compass,
};

export default function TerrainTable({
  initialTerrains,
  user,
}: Props) {
  const [terrains, setTerrains] = useState(initialTerrains || []);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [centerTerrainId, setCenterTerrainId] = useState<number | null>(null);
  
  // States for modern alerts & dialogs
  const [terrainToDelete, setTerrainToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{type: 'error' | 'success', message: string} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const ITEMS_PER_PAGE = 5;

  async function confirmDelete() {
    if (!terrainToDelete) return;
    setIsDeleting(true);
    setNotification(null);
    
    const result = await deleteTerrainAction(terrainToDelete);

    if (result.success) {
      setTerrains((old) => old.filter((t) => t.id !== terrainToDelete));
      setNotification({ type: 'success', message: "Terrain supprimé avec succès." });
    } else {
      setNotification({ type: 'error', message: result.error || "Erreur lors de la suppression." });
    }
    
    setIsDeleting(false);
    setTerrainToDelete(null);
  }

  const filteredTerrains = useMemo(() => {
    if (!terrains || terrains.length === 0) return [];
    
    return terrains.filter((terrain) =>
      (terrain.nom + " " + terrain.typeSol + " " + terrain.ferme.nom)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [terrains, search]);

  const totalPages = Math.ceil(filteredTerrains.length / ITEMS_PER_PAGE);
  const paginatedTerrains = filteredTerrains.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const canManage = user?.role === Role.ADMIN || user?.role === Role.AGRICULTEUR;
  const canView = user?.role === Role.EMPLOYE || user?.role === Role.VETERINAIRE || canManage;

  // Si l'utilisateur n'a pas le droit de voir les terrains
  if (!canView) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <MapPinned size={44} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Accès restreint</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          Vous n'avez pas les autorisations nécessaires pour voir cette page.
        </p>
      </div>
    );
  }

  // ⚠️ Vérifier si terrains est un tableau et s'il est vide
  if (!terrains || terrains.length === 0) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <MapPinned size={44} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Aucun terrain</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          Aucun terrain n'est actuellement enregistré dans le système.
        </p>
        {canManage && (
          <Link
            href="/dashboard/terrains/add"
            className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl"
          >
            <Plus size={18} />
            Ajouter un terrain
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 overflow-hidden transition-all hover:shadow-xl">
      {/* HEADER - Même style que FermeTable */}
      <div className="p-6 border-b border-[#FFC490]/20 bg-gradient-to-r from-[#FFF3DA]/30 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DDF3E8] flex items-center justify-center shadow-sm">
              <MapPinned size={22} className="text-[#3C6C5F]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
                Liste des Terrains
                <Sparkles size={16} className="text-[#FFC490]" />
              </h2>
              <p className="text-sm text-[#3C6C5F]/60">
                {filteredTerrains.length} terrain(s) trouvé(s)
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
                href="/dashboard/terrains/add"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md shadow-[#3C6C5F]/20 hover:shadow-lg"
              >
                <Plus size={16} />
                Ajouter
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* MAP VIEW OF ALL TERRAINS */}
      <div className="px-6 pt-6">
        <TerrainsMapView
          terrains={terrains}
          centerOnTerrainId={centerTerrainId}
          onClearCenter={() => setCenterTerrainId(null)}
        />
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`m-6 p-4 rounded-2xl border-2 flex items-center justify-between shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'error' 
            ? "bg-red-50 border-red-200 text-red-700" 
            : "bg-[#DDF3E8] border-[#9DAE7A]/40 text-[#29453E]"
        }`}>
          <div className="flex items-center gap-3 font-medium">
            <span className="text-xl">{notification.type === 'error' ? '⚠️' : '✅'}</span>
            {notification.message}
          </div>
          <button 
            onClick={() => setNotification(null)}
            className={`p-1.5 rounded-lg transition-colors ${
              notification.type === 'error' ? "hover:bg-red-100" : "hover:bg-[#3C6C5F]/10"
            }`}
          >
            ✕
          </button>
        </div>
      )}

      {/* TABLE - Même style que FermeTable (sans padding supplémentaire) */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FFF3DA] text-[#29453E] text-xs uppercase tracking-wider">
              <th className="px-6 py-4 text-left font-semibold">Terrain</th>
              <th className="px-6 py-4 text-left font-semibold">Superficie</th>
              <th className="px-6 py-4 text-left font-semibold">Type de sol</th>
              <th className="px-6 py-4 text-left font-semibold">Ferme</th>
              <th className="px-6 py-4 text-left font-semibold">Localisation</th>
              {canManage && (
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedTerrains.map((terrain) => {
              const TypeIcon = typeSolIcons[terrain.typeSol] || TreePine;
              return (
                <tr
                  key={terrain.id}
                  className="border-b border-[#FFC490]/10 hover:bg-[#FFF3DA]/30 transition-all duration-200 group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPinned size={18} className="text-[#3C6C5F]" />
                      </div>
                      <span className="font-semibold text-[#29453E]">{terrain.nom}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3DA] text-[#29453E] text-xs font-semibold border border-[#FFC490]/30">
                      <Ruler size={12} />
                      {terrain.superficie} ha
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DDF3E8] text-[#3C6C5F] text-xs font-semibold border border-[#9DAE7A]/30">
                      <TypeIcon size={12} />
                      {terrain.typeSol}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-[#3C6C5F]/80">
                      <Building2 size={14} className="text-[#3C6C5F]/40" />
                      {terrain.ferme.nom}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {terrain.localisation ? (
                        <span className="flex items-center gap-1.5 text-sm text-[#3C6C5F]/80 font-medium">
                          <MapPin size={14} className="text-[#3C6C5F]/40" />
                          {terrain.localisation}
                        </span>
                      ) : (
                        <span className="text-xs text-[#3C6C5F]/40 italic">Localisation non spécifiée</span>
                      )}
                      
                      {typeof terrain.latitude === "number" && typeof terrain.longitude === "number" ? (
                        <button
                          onClick={() => setCenterTerrainId(terrain.id)}
                          className="flex items-center gap-1.5 text-[11px] text-[#3C6C5F] hover:text-[#29453E] hover:underline transition-colors mt-0.5 text-left w-fit"
                          title="Centrer la carte sur ce terrain"
                        >
                          <Compass size={12} className="text-[#FFC490]" />
                          <span>GPS: {terrain.latitude.toFixed(5)}, {terrain.longitude.toFixed(5)}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-400 italic">Pas de coordonnées GPS</span>
                      )}
                    </div>
                  </td>

                  {canManage && (
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/terrains/${terrain.id}/edit`}
                          className="p-2.5 rounded-xl bg-[#DDF3E8] text-[#3C6C5F] hover:bg-[#3C6C5F] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          onClick={() => setTerrainToDelete(terrain.id)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
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
      {/* DELETE CONFIRMATION MODAL */}
      {terrainToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29453E]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-[#FFC490]/30 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-[#29453E] mb-2">Confirmer la suppression</h3>
            <p className="text-center text-[#3C6C5F]/70 mb-6">
              Êtes-vous sûr de vouloir supprimer ce terrain ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTerrainToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-[#FAFAFA] text-[#29453E] border border-[#FFC490]/20 hover:bg-[#FFF3DA] transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isDeleting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}