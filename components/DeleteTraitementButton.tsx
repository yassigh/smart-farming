"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteTraitementAction } from "@/actions/animal";
import { Trash2 } from "lucide-react";

export default function DeleteTraitementButton({ id, animalId }: { id: number, animalId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Voulez-vous vraiment supprimer ce traitement ? Cette action est irréversible."
      )
    )
      return;

    setLoading(true);
    const res = await deleteTraitementAction(id, animalId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Erreur lors de la suppression.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
      title="Supprimer le traitement"
    >
      <Trash2 size={14} />
    </button>
  );
}
