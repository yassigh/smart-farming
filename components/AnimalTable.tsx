// components/AnimalTable.tsx - Version améliorée avec le design d'alerte

"use client";

import { useState } from "react";
import { Role } from "@prisma/client";
import Link from "next/link";
import {
  PawPrint,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Filter,
  X,
  Syringe,
  Stethoscope,
  Sparkles,
  Ruler,
  MapPin,
  Building2,
  HeartPulse,
  AlertCircle,
  CheckCircle2,
  Droplets
} from "lucide-react";
import { deleteAnimalAction } from "@/actions/animal";

interface Terrain {
  id: number;
  nom: string;
  ferme: { id: number; nom: string };
}

interface Animal {
  id: number;
  numero: string;
  type: string;
  race: string;
  sexe: "MALE" | "FEMELLE";
  poids: number;
  dateNaissance: string | Date;
  etatSante: string;
  terrain: Terrain;
  categorie: { id: number; nom: string };
  _count?: { traitements: number; vaccinations: number };
}

interface Props {
  initialAnimaux: Animal[];
  user: { role: Role; id: number };
}

const ETAT_COLORS: Record<string, string> = {
  Sain: "bg-[#DDF3E8] text-[#3C6C5F] border-[#9DAE7A]",
  Malade: "bg-red-50 text-red-700 border-red-200",
  "En traitement": "bg-[#FFF3DA] text-[#29453E] border-[#FFC490]",
  Blessé: "bg-orange-50 text-orange-700 border-orange-200",
  Décédé: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const SEXE_LABELS = { MALE: "Mâle", FEMELLE: "Femelle" };

// ✅ Composant AlertDialog personnalisé
interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isDeleting?: boolean;
}

const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Supprimer",
  cancelText = "Annuler",
  type = "danger",
  isDeleting = false,
}: AlertDialogProps) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-600",
          iconBg: "bg-red-50",
          border: "border-red-200",
          confirmBg: "bg-red-600 hover:bg-red-700",
          confirmHover: "hover:bg-red-700",
        };
      case "warning":
        return {
          icon: "text-amber-600",
          iconBg: "bg-amber-50",
          border: "border-amber-200",
          confirmBg: "bg-amber-600 hover:bg-amber-700",
          confirmHover: "hover:bg-amber-700",
        };
      case "info":
        return {
          icon: "text-blue-600",
          iconBg: "bg-blue-50",
          border: "border-blue-200",
          confirmBg: "bg-blue-600 hover:bg-blue-700",
          confirmHover: "hover:bg-blue-700",
        };
      default:
        return {
          icon: "text-red-600",
          iconBg: "bg-red-50",
          border: "border-red-200",
          confirmBg: "bg-red-600 hover:bg-red-700",
          confirmHover: "hover:bg-red-700",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-[#FFC490]/20 overflow-hidden animate-scaleIn">
        {/* Header avec dégradé */}
        <div className={`p-6 border-b ${styles.border} bg-gradient-to-r from-[#FFF3DA]/30 to-white`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <AlertCircle size={24} className={styles.icon} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#29453E]">{title}</h3>
              <p className="text-sm text-[#3C6C5F]/70 mt-1">{message}</p>
            </div>
          </div>
        </div>

        {/* Body avec avertissement */}
        <div className="p-6 bg-[#FAFAFA]">
          <div className="bg-amber-50 border-2 border-amber-200/50 rounded-2xl p-4 mb-2">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Cette action est irréversible
                </p>
                <p className="text-xs text-amber-700/80 mt-1">
                  Toutes les données associées à cet animal seront définitivement supprimées.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec boutons */}
        <div className="p-6 bg-white border-t border-[#FFC490]/20 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-2.5 rounded-xl border-2 border-[#E8E3DC] text-[#29453E] font-medium hover:bg-[#FFF3DA] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 ${styles.confirmBg}`}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Suppression...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AnimalTable({ initialAnimaux, user }: Props) {
  const [animaux, setAnimaux] = useState(initialAnimaux);
  const [search, setSearch] = useState("");
  const [filterEspece, setFilterEspece] = useState("");
  const [filterEtat, setFilterEtat] = useState("");
  const [filterFerme, setFilterFerme] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État pour le dialogue de confirmation
  const [alertOpen, setAlertOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  //  Définir les permissions
  const canAdd = user.role === Role.ADMIN || user.role === Role.AGRICULTEUR;
  const canEdit = user.role === Role.ADMIN || user.role === Role.AGRICULTEUR || user.role === Role.VETERINAIRE;
  const canDelete = user.role === Role.ADMIN;
  const canMedical = user.role === Role.VETERINAIRE || user.role === Role.ADMIN;
  const canView = user.role === Role.EMPLOYE || user.role === Role.VETERINAIRE || user.role === Role.ADMIN || user.role === Role.AGRICULTEUR;

  // Si l'utilisateur n'a pas le droit de voir
  if (!canView) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <PawPrint size={44} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Accès restreint</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          Vous n'avez pas les autorisations nécessaires pour voir cette page.
        </p>
      </div>
    );
  }

  // Unique filter options
  const especes = [...new Set(animaux.map((a) => a.type))];
  const etats = [...new Set(animaux.map((a) => a.etatSante))];
  const fermes = [
    ...new Map(
      animaux.map((a) => [a.terrain.ferme.id, a.terrain.ferme])
    ).values(),
  ];

  const filtered = animaux.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      a.numero.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.race.toLowerCase().includes(q);
    const matchEspece = !filterEspece || a.type === filterEspece;
    const matchEtat = !filterEtat || a.etatSante === filterEtat;
    const matchFerme =
      !filterFerme || a.terrain.ferme.id === parseInt(filterFerme);
    return matchSearch && matchEspece && matchEtat && matchFerme;
  });

  const handleDelete = async (id: number) => {
    setAnimalToDelete(id);
    setAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!animalToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const res = await deleteAnimalAction(animalToDelete);
      
      if (res.success) {
        setAnimaux((prev) => prev.filter((a) => a.id !== animalToDelete));
        setAlertOpen(false);
        setAnimalToDelete(null);
      } else {
        setError(res.error || "Erreur lors de la suppression.");
        // Garder l'alerte ouverte pour montrer l'erreur
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeAlert = () => {
    if (!isDeleting) {
      setAlertOpen(false);
      setAnimalToDelete(null);
    }
  };

  const clearFilters = () => {
    setFilterEspece("");
    setFilterEtat("");
    setFilterFerme("");
    setSearch("");
  };

  const hasActiveFilters = search || filterEspece || filterEtat || filterFerme;

  if (animaux.length === 0) {
    return (
      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center mx-auto mb-6 border border-[#FFC490]/30">
          <PawPrint size={44} className="text-[#3C6C5F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#29453E]">Aucun animal enregistré</h2>
        <p className="text-[#3C6C5F]/70 mt-2">
          Aucun animal n'est actuellement enregistré dans le système.
        </p>
        {canAdd && (
          <Link
            href="/dashboard/animaux/add"
            className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl"
          >
            <Plus size={18} />
            Ajouter un animal
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertOpen}
        onClose={closeAlert}
        onConfirm={confirmDelete}
        title="Supprimer l'animal"
        message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet animal ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        isDeleting={isDeleting}
      />

      <div className="bg-white border border-[#FFC490]/30 rounded-3xl shadow-lg shadow-[#FFC490]/5 overflow-hidden transition-all hover:shadow-xl">

        {/* HEADER */}
        <div className="p-6 border-b border-[#FFC490]/20 bg-gradient-to-r from-[#FFF3DA]/30 to-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#DDF3E8] flex items-center justify-center shadow-sm">
                <PawPrint size={22} className="text-[#3C6C5F]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
                  Liste des Animaux
                  <Sparkles size={16} className="text-[#FFC490]" />
                </h2>
                <p className="text-sm text-[#3C6C5F]/60">
                  {filtered.length} animal{filtered.length !== 1 ? "x" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
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
                  }}
                  className="pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#FFC490]/30 bg-[#FAFAFA] text-sm text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all w-full sm:w-48 focus:w-60"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  hasActiveFilters
                    ? "bg-[#3C6C5F] text-white border-[#3C6C5F]"
                    : "bg-white border-[#FFC490]/30 text-[#29453E] hover:bg-[#FFF3DA]"
                }`}
              >
                <Filter size={16} />
                Filtres
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-white/30 text-xs flex items-center justify-center font-bold">
                    !
                  </span>
                )}
              </button>

              {canAdd && (
                <Link
                  href="/dashboard/animaux/add"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md shadow-[#3C6C5F]/20 hover:shadow-lg"
                >
                  <Plus size={16} />
                  Ajouter
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div className="px-6 py-5 bg-[#FFF3DA]/30 border-b border-[#FFC490]/20 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-[#29453E] uppercase tracking-wider mb-1.5">
                Espèce
              </label>
              <select
                value={filterEspece}
                onChange={(e) => setFilterEspece(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-2 border-[#FFC490]/30 bg-white text-sm text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all"
              >
                <option value="">Toutes</option>
                {especes.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#29453E] uppercase tracking-wider mb-1.5">
                État de santé
              </label>
              <select
                value={filterEtat}
                onChange={(e) => setFilterEtat(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-2 border-[#FFC490]/30 bg-white text-sm text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all"
              >
                <option value="">Tous</option>
                {etats.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#29453E] uppercase tracking-wider mb-1.5">
                Ferme
              </label>
              <select
                value={filterFerme}
                onChange={(e) => setFilterFerme(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-2 border-[#FFC490]/30 bg-white text-sm text-[#29453E] focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all"
              >
                <option value="">Toutes</option>
                {fermes.map((f) => (
                  <option key={f.id} value={f.id.toString()}>{f.nom}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-semibold px-4 py-2.5 rounded-xl hover:bg-red-50 transition-all"
              >
                <X size={14} />
                Effacer
              </button>
            )}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm flex items-center gap-2 animate-slideDown">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto p-4">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFF3DA] text-[#29453E] text-xs uppercase tracking-wider rounded-xl">
                <th className="px-6 py-4 text-left font-semibold">Animal</th>
                <th className="px-6 py-4 text-left font-semibold">Espèce / Race</th>
                <th className="px-6 py-4 text-left font-semibold">Sexe</th>
                <th className="px-6 py-4 text-left font-semibold">Poids</th>
                <th className="px-6 py-4 text-left font-semibold">État de santé</th>
                <th className="px-6 py-4 text-left font-semibold">Terrain / Ferme</th>
                {(canEdit || canDelete || canMedical) && (
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#FFC490]/10">
              {filtered.map((animal) => (
                <tr
                  key={animal.id}
                  className="hover:bg-[#FFF3DA]/30 transition-all duration-200 group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PawPrint size={18} className="text-[#3C6C5F]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#29453E] text-sm">{animal.numero}</p>
                        <p className="text-xs text-[#29453E]/40">#{animal.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#29453E] text-sm">{animal.type}</p>
                    <p className="text-xs text-[#3C6C5F]/60">{animal.race}</p>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      animal.sexe === "MALE"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-pink-50 text-pink-700 border-pink-200"
                    }`}>
                      {SEXE_LABELS[animal.sexe]}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3DA] text-[#29453E] text-xs font-semibold border border-[#FFC490]/30">
                      <Ruler size={12} />
                      {animal.poids} kg
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      ETAT_COLORS[animal.etatSante] || "bg-zinc-100 text-zinc-600 border-zinc-200"
                    }`}>
                      <HeartPulse size={12} />
                      {animal.etatSante}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1.5 text-sm text-[#29453E]">
                        <MapPin size={14} className="text-[#3C6C5F]/40" />
                        {animal.terrain.nom}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#3C6C5F]/60">
                        <Building2 size={12} className="text-[#3C6C5F]/30" />
                        {animal.terrain.ferme.nom}
                      </span>
                    </div>
                  </td>

                  {(canEdit || canDelete || canMedical) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/animaux/${animal.id}`}
                          title="Voir détail"
                          className="p-2.5 rounded-xl hover:bg-[#FFF3DA] text-[#29453E]/50 hover:text-[#3C6C5F] transition-all"
                        >
                          <Eye size={16} />
                        </Link>

                        {canMedical && (
                          <>
                            <Link
                              href={`/dashboard/animaux/${animal.id}/traitement`}
                              title="Ajouter traitement"
                              className="p-2.5 rounded-xl hover:bg-[#FFF3DA] text-[#29453E]/50 hover:text-[#3C6C5F] transition-all"
                            >
                              <Stethoscope size={16} />
                            </Link>
                            <Link
                              href={`/dashboard/animaux/${animal.id}/vaccination`}
                              title="Ajouter vaccination"
                              className="p-2.5 rounded-xl hover:bg-[#FFF3DA] text-[#29453E]/50 hover:text-[#3C6C5F] transition-all"
                            >
                              <Syringe size={16} />
                            </Link>
                          </>
                        )}

                        {canEdit && (
                          <Link
                            href={`/dashboard/animaux/${animal.id}/edit`}
                            title="Modifier"
                            className="p-2.5 rounded-xl hover:bg-[#FFF3DA] text-[#29453E]/50 hover:text-[#3C6C5F] transition-all"
                          >
                            <Pencil size={16} />
                          </Link>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleDelete(animal.id)}
                            title="Supprimer"
                            className="p-2.5 rounded-xl hover:bg-red-50 text-[#29453E]/50 hover:text-red-600 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-[#FFC490]/20 bg-[#FAFAFA] flex items-center justify-between">
            <p className="text-xs text-[#3C6C5F]/50">
              Affichage de {filtered.length} sur {animaux.length} animaux
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-[#E8E3DC] text-xs text-[#29453E]/50 hover:bg-[#F8F6F3] transition-all">
                Précédent
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-[#3C6C5F] text-white text-xs font-bold">1</span>
              <button className="px-3 py-1.5 rounded-lg border border-[#E8E3DC] text-xs text-[#29453E]/50 hover:bg-[#F8F6F3] transition-all">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
}