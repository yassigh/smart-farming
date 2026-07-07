"use client";

import { useState } from "react";
import { removeEmployeFermeAction } from "@/actions/employe";
import { UserMinus } from "lucide-react";

interface RemoveEmployeButtonProps {
  employeFermeId: number;
  employeName: string;
}

export default function RemoveEmployeButton({ employeFermeId, employeName }: RemoveEmployeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!confirm(`Voulez-vous vraiment retirer ${employeName} de cette ferme ? Ses tâches et assignations associées à cette ferme seront supprimées.`)) {
      return;
    }

    setLoading(true);
    const result = await removeEmployeFermeAction(employeFermeId);
    setLoading(false);

    if (!result.success) {
      alert(result.error || "Une erreur est survenue.");
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 active:scale-95 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition-all cursor-pointer border border-red-200/20"
      title="Retirer cet employé de la ferme"
    >
      <UserMinus size={14} />
      {loading ? "Retrait..." : "Retirer"}
    </button>
  );
}
