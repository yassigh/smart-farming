// components/CategorieTable.tsx
"use client";

import { useState } from "react";
import {
  deleteCategorieAction,
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
  Search
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

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Supprimer cette catégorie ? Cette action est irréversible."
      )
    )
      return;

    setDeletingId(id);

    const result = await deleteCategorieAction(id);

    setDeletingId(null);

    if (!result.success) {
      alert(result.error || "Erreur lors de la suppression.");
    }
  };

  // Filtrer les catégories
  const filteredCategories = categories.filter(cat =>
    cat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                          onClick={() => handleDelete(cat.id)}
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