"use client";

import { useState } from "react";
import { deleteUtilisateurAction } from "@/actions/utilisateur";

interface DeleteButtonProps {
  id: number;
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    setDeleting(true);
    const result = await deleteUtilisateurAction(id);
    setDeleting(false);

    if (!result.success) {
      alert(result.error || "Une erreur est survenue lors de la suppression.");
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 active:scale-95 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition-all cursor-pointer"
    >
      {deleting ? "Suppression..." : "Supprimer"}
    </button>
  );
}
