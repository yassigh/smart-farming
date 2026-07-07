// components/CategorieTable.tsx

"use client";

import { useState } from "react";
import {
  deleteCategorieAction,
  deleteCategorieWithReassignmentAction,
  getCategoriesForReassignment,
  updateCategorieAction,
} from "@/actions/categorie";
import { TypeCategorie } from "@prisma/client";
import {
  Edit2,
  Trash2,
  Save,
  X,
  PawPrint,
  Wheat,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

type CategorieWithCount = {
  id: number;
  nom: string;
  type: TypeCategorie;
  _count: {
    animaux: number;
    cultures: number;
  };
};

interface CategorieTableProps {
  categories: CategorieWithCount[];
}

type DialogState =
  | {
      kind: "confirm-delete";
      title: string;
      message: string;
      confirmLabel: string;
    }
  | {
      kind: "confirm-reassign";
      title: string;
      message: string;
      confirmLabel: string;
      categorie: CategorieWithCount;
    }
  | {
      kind: "info";
      title: string;
      message: string;
      details?: {
        animauxCount?: number;
        culturesCount?: number;
        animauxList?: any[];
        culturesList?: any[];
      };
    }
  | null;

export default function CategorieTable({
  categories,
}: CategorieTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editType, setEditType] = useState<TypeCategorie>(
    TypeCategorie.ANIMAL
  );
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [pendingDelete, setPendingDelete] = useState<CategorieWithCount | null>(null);
  const [reassignTargets, setReassignTargets] = useState<{
    animaux: { id: number; nom: string; selectedCategory: number }[];
    cultures: { id: number; nom: string; selectedCategory: number }[];
  }>({ animaux: [], cultures: [] });
  const [availableCategories, setAvailableCategories] = useState<{
    animaux: any[];
    cultures: any[];
  }>({ animaux: [], cultures: [] });
  const [isLoadingReassign, setIsLoadingReassign] = useState(false);

  const startEdit = (cat: CategorieWithCount) => {
    setEditingId(cat.id);
    setEditNom(cat.nom);
    setEditType(cat.type);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (id: number) => {
    setSavingId(id);

    const result = await updateCategorieAction(id, {
      nom: editNom,
      type: editType,
    });

    setSavingId(null);

    if (result.success) {
      setEditingId(null);
    } else {
      alert(result.error || "Erreur lors de la mise à jour.");
    }
  };

  const openDeleteDialog = async (cat: CategorieWithCount) => {
    const linkedAnimaux = cat._count.animaux;
    const linkedCultures = cat._count.cultures;

    if (linkedAnimaux > 0 || linkedCultures > 0) {
      // Vérifier s'il y a d'autres catégories disponibles pour la réaffectation
      await checkReassignmentOptions(cat);
      return;
    }

    setPendingDelete(cat);
    setDialog({
      kind: "confirm-delete",
      title: "Confirmer la suppression",
      message:
        "Cette action supprimera définitivement la catégorie. Vous pouvez continuer uniquement si elle n'est liée à aucun animal ni aucune culture.",
      confirmLabel: "Supprimer",
    });
  };

  const checkReassignmentOptions = async (cat: CategorieWithCount) => {
    setIsLoadingReassign(true);

     try {
    const linkedAnimaux = cat._count.animaux;
    const linkedCultures = cat._count.cultures;

    const [animauxResult, culturesResult] = await Promise.all([
      getCategoriesForReassignment(cat.id, TypeCategorie.ANIMAL),
      getCategoriesForReassignment(cat.id, TypeCategorie.CULTURE),
    ]);

    const hasReassignmentOptions =
      (animauxResult.success && animauxResult.data?.length > 0) ||
      (culturesResult.success && culturesResult.data?.length > 0);

      if (hasReassignmentOptions) {
        const linkedAnimaux = cat._count.animaux;
        const linkedCultures = cat._count.cultures;

        // Simuler la récupération des éléments liés (à remplacer par un appel API réel)
        // Dans un cas réel, vous récupéreriez ces données depuis votre API
        const animauxList = linkedAnimaux > 0 
          ? Array.from({ length: linkedAnimaux }, (_, i) => ({
              id: i + 1,
              nom: `Animal ${i + 1}`,
            }))
          : [];
        const culturesList = linkedCultures > 0
          ? Array.from({ length: linkedCultures }, (_, i) => ({
              id: i + 1,
              nom: `Culture ${i + 1}`,
            }))
          : [];

        setReassignTargets({
          animaux: animauxList.map((item: any) => ({
            ...item,
            selectedCategory: animauxResult.data?.[0]?.id || 0,
          })),
          cultures: culturesList.map((item: any) => ({
            ...item,
            selectedCategory: culturesResult.data?.[0]?.id || 0,
          })),
        });

        setAvailableCategories({
          animaux: animauxResult.data || [],
          cultures: culturesResult.data || [],
        });

        setPendingDelete(cat);
        setDialog({
          kind: "confirm-reassign",
          title: "Catégorie utilisée",
          message: `La catégorie « ${cat.nom} » est encore utilisée par ${linkedAnimaux > 0 ? `${linkedAnimaux} animal${linkedAnimaux > 1 ? "aux" : ""}` : ""}${linkedAnimaux > 0 && linkedCultures > 0 ? " et " : ""}${linkedCultures > 0 ? `${linkedCultures} culture${linkedCultures > 1 ? "s" : ""}` : ""}. Choisissez une nouvelle catégorie pour ces éléments.`,
          confirmLabel: "Réaffecter et supprimer",
          categorie: cat,
        });
      } else {
        // Pas d'options de réaffectation disponibles
        const parts = [
          linkedAnimaux > 0
            ? `${linkedAnimaux} animal${linkedAnimaux > 1 ? "aux" : ""}`
            : null,
          linkedCultures > 0
            ? `${linkedCultures} culture${linkedCultures > 1 ? "s" : ""}`
            : null,
        ].filter(Boolean);

        setDialog({
          kind: "info",
          title: "Suppression bloquée",
          message: `La catégorie « ${cat.nom} » est encore utilisée par ${parts.join(" et ")}. Aucune autre catégorie disponible pour la réaffectation. Supprimez d'abord ces éléments manuellement.`,
          details: {
            animauxCount: linkedAnimaux,
            culturesCount: linkedCultures,
          },
        });
      }
    } catch (error) {
      console.error("Error checking reassignment options:", error);
      setDialog({
        kind: "info",
        title: "Erreur",
        message: "Une erreur est survenue lors de la vérification des options de réaffectation.",
      });
    } finally {
      setIsLoadingReassign(false);
    }
  };

  const handleDeleteWithReassignment = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);

    // Préparer les données de réaffectation
    const reassignData = {
      animauxToReassign: reassignTargets.animaux
        .filter(a => a.selectedCategory > 0)
        .map(a => ({
          id: a.id,
          categorieId: a.selectedCategory,
        })),
      culturesToReassign: reassignTargets.cultures
        .filter(c => c.selectedCategory > 0)
        .map(c => ({
          id: c.id,
          categorieId: c.selectedCategory,
        })),
    };

    const result = await deleteCategorieWithReassignmentAction(
      pendingDelete.id,
      reassignData
    );

    setDeletingId(null);
    setDialog(null);
    setPendingDelete(null);

    if (!result.success) {
      setDialog({
        kind: "info",
        title: "Suppression impossible",
        message: result.error || "Erreur lors de la suppression.",
      });
    }
  };

  const handleDeleteSimple = async (id: number) => {
    if (!confirm("Supprimer cette catégorie ? Cette action est irréversible.")) return;

    setDeletingId(id);
    const result = await deleteCategorieAction(id);
    setDeletingId(null);

    if (!result.success) {
      alert(result.error || "Erreur lors de la suppression.");
    }
  };

  const handleReassignTargetChange = (
    type: 'animaux' | 'cultures',
    itemId: number,
    newCategoryId: number
  ) => {
    setReassignTargets(prev => ({
      ...prev,
      [type]: prev[type].map(item =>
        item.id === itemId
          ? { ...item, selectedCategory: newCategoryId }
          : item
      ),
    }));
  };

  // Filtrer les catégories
  const filteredCategories = categories.filter(cat =>
    cat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDialog = () => {
    if (!dialog) return null;

    const isReassignDialog = dialog.kind === "confirm-reassign";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#29453E]/55 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-[28px] border border-white/30 bg-white shadow-2xl shadow-[#29453E]/20 overflow-hidden">
          <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-[#FAFAFA] to-white border-b border-[#E8E3DC]">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  dialog.kind === "confirm-delete"
                    ? "bg-red-50 text-red-600"
                    : dialog.kind === "confirm-reassign"
                    ? "bg-[#FFF3DA] text-[#29453E]"
                    : "bg-[#FFF3DA] text-[#29453E]"
                }`}
              >
                {isReassignDialog ? (
                  <RefreshCw className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#29453E]">
                  {dialog.title}
                </h4>
                <p className="text-xs text-[#3C6C5F]/60">
                  Gestion des catégories
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm leading-6 text-[#29453E]/80">
              {dialog.message}
            </p>
            {isReassignDialog && (
              <div className="space-y-4 mt-4 max-h-60 overflow-y-auto">
                {reassignTargets.animaux.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-[#29453E] mb-2 flex items-center gap-2">
                      <PawPrint size={14} />
                      Animaux à réaffecter
                    </h5>
                    {reassignTargets.animaux.map((animal) => (
                      <div key={animal.id} className="flex items-center gap-2 mb-2 bg-[#F8F6F3] p-2 rounded-lg">
                        <span className="text-xs font-medium text-[#29453E] flex-1">{animal.nom}</span>
                        <ArrowRight size={12} className="text-[#3C6C5F]" />
                        <select
                          value={animal.selectedCategory}
                          onChange={(e) => handleReassignTargetChange('animaux', animal.id, Number(e.target.value))}
                          className="px-2 py-1 text-xs rounded-lg border border-[#E8E3DC] bg-white focus:outline-none focus:border-[#3C6C5F]"
                        >
                          {availableCategories.animaux.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {reassignTargets.cultures.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-[#29453E] mb-2 flex items-center gap-2">
                      <Wheat size={14} />
                      Cultures à réaffecter
                    </h5>
                    {reassignTargets.cultures.map((culture) => (
                      <div key={culture.id} className="flex items-center gap-2 mb-2 bg-[#F8F6F3] p-2 rounded-lg">
                        <span className="text-xs font-medium text-[#29453E] flex-1">{culture.nom}</span>
                        <ArrowRight size={12} className="text-[#3C6C5F]" />
                        <select
                          value={culture.selectedCategory}
                          onChange={(e) => handleReassignTargetChange('cultures', culture.id, Number(e.target.value))}
                          className="px-2 py-1 text-xs rounded-lg border border-[#E8E3DC] bg-white focus:outline-none focus:border-[#3C6C5F]"
                        >
                          {availableCategories.cultures.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-6 pb-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setDialog(null);
                setPendingDelete(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-[#E8E3DC] text-sm font-semibold text-[#29453E] hover:bg-[#FAFAFA] transition-all"
            >
              {dialog.kind === "confirm-delete" ? "Annuler" : "Fermer"}
            </button>

            {dialog.kind === "confirm-delete" && (
              <button
                onClick={async () => {
                  if (pendingDelete) {
                    await handleDeleteSimple(pendingDelete.id);
                    setDialog(null);
                    setPendingDelete(null);
                  }
                }}
                disabled={deletingId === pendingDelete?.id}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-600/20"
              >
                {deletingId === pendingDelete?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {dialog.confirmLabel}
              </button>
            )}

            {dialog.kind === "confirm-reassign" && (
              <button
                onClick={handleDeleteWithReassignment}
                disabled={deletingId === pendingDelete?.id || isLoadingReassign}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3C6C5F] text-white text-sm font-semibold hover:bg-[#29453E] disabled:opacity-50 transition-all shadow-lg shadow-[#3C6C5F]/20"
              >
                {deletingId === pendingDelete?.id || isLoadingReassign ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {dialog.confirmLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl shadow-lg border border-[#3C6C5F]/10 p-12">
        <div className="w-24 h-24 rounded-full bg-[#FFF3DA] flex items-center justify-center text-5xl mb-6 shadow-inner">
          🏷️
        </div>
        <h3 className="text-2xl font-bold text-[#29453E]">Aucune catégorie</h3>
        <p className="text-[#3C6C5F]/70 mt-2 max-w-sm">
          Commencez par créer une catégorie à l'aide du formulaire.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-[#3C6C5F]/10 overflow-hidden transition-all hover:shadow-xl">
      {/* Header avec recherche */}
      <div className="px-6 py-5 border-b border-[#E8E3DC] bg-gradient-to-r from-[#FAFAFA] to-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DDF3E8] flex items-center justify-center">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h3 className="font-bold text-[#29453E]">Liste des catégories</h3>
              <p className="text-xs text-[#3C6C5F]/60">
                {categories.length} catégorie(s) trouvée(s)
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3C6C5F]/40" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border-2 border-[#E8E3DC] bg-[#FAFAFA] text-sm text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:border-[#3C6C5F] focus:ring-4 focus:ring-[#3C6C5F]/10 transition-all w-48 focus:w-60"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F6F3] text-[#29453E] uppercase text-xs font-bold border-b border-[#E8E3DC]">
              <th className="px-6 py-4">Nom</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-center">Animaux</th>
              <th className="px-6 py-4 text-center">Cultures</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCategories.map((cat) => (
              <tr
                key={cat.id}
                className="border-b border-[#E8E3DC]/50 hover:bg-[#FAFAFA] transition-all duration-200"
              >
                {editingId === cat.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editNom}
                        onChange={(e) => setEditNom(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FFC490] bg-white text-[#29453E] focus:outline-none focus:ring-4 focus:ring-[#FFC490]/20 focus:border-[#FFC490] transition-all"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={editType}
                        onChange={(e) =>
                          setEditType(e.target.value as TypeCategorie)
                        }
                        className="px-4 py-2.5 rounded-xl border-2 border-[#FFC490] bg-white text-[#29453E] focus:outline-none focus:ring-4 focus:ring-[#FFC490]/20 focus:border-[#FFC490] transition-all"
                      >
                        <option value={TypeCategorie.ANIMAL}>
                          🐾 Animal
                        </option>
                        <option value={TypeCategorie.CULTURE}>
                          🌾 Culture
                        </option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1.5 rounded-full bg-[#FFF3DA] text-[#29453E] text-xs font-semibold">
                        {cat._count.animaux}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1.5 rounded-full bg-[#FFF3DA] text-[#29453E] text-xs font-semibold">
                        {cat._count.cultures}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSave(cat.id)}
                          disabled={savingId === cat.id}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3C6C5F] text-white text-xs font-bold hover:bg-[#29453E] disabled:opacity-50 transition-all shadow-md shadow-[#3C6C5F]/10 hover:shadow-lg"
                        >
                          {savingId === cat.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save size={14} />
                          )}
                          Sauvegarder
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF3DA] text-[#29453E] text-xs font-bold hover:bg-[#FFC490]/40 transition-all"
                        >
                          <X size={14} />
                          Annuler
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#29453E] text-sm">
                        {cat.nom}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {cat.type === TypeCategorie.ANIMAL ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#9DAE7A]/20 text-[#3C6C5F] text-xs font-bold border border-[#9DAE7A]/30">
                          <PawPrint size={12} />
                          Animal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFC490]/30 text-[#29453E] text-xs font-bold border border-[#FFC490]/30">
                          <Wheat size={12} />
                          Culture
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F6F3] text-[#29453E] text-xs font-semibold border border-[#E8E3DC]">
                        {cat._count.animaux}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F6F3] text-[#29453E] text-xs font-semibold border border-[#E8E3DC]">
                        {cat._count.cultures}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3C6C5F] text-white text-xs font-bold hover:bg-[#29453E] transition-all shadow-md shadow-[#3C6C5F]/10 hover:shadow-lg"
                        >
                          <Edit2 size={13} />
                          Modifier
                        </button>

                        <button
                          onClick={() => openDeleteDialog(cat)}
                          disabled={deletingId === cat.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 disabled:opacity-50 transition-all border border-red-200"
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderDialog()}

      {/* Footer avec pagination */}
      <div className="px-6 py-4 border-t border-[#E8E3DC] bg-[#FAFAFA] flex items-center justify-between">
        <p className="text-xs text-[#3C6C5F]/50">
          Affichage de {filteredCategories.length} sur {categories.length} catégories
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-[#E8E3DC] text-xs text-[#29453E]/50 hover:bg-[#F8F6F3] transition-all disabled:opacity-30">
            Précédent
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-[#3C6C5F] text-white text-xs font-bold">1</span>
          <button className="px-3 py-1.5 rounded-lg border border-[#E8E3DC] text-xs text-[#29453E]/50 hover:bg-[#F8F6F3] transition-all">
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}