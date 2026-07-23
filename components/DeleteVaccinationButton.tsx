"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteVaccinationAction } from "@/actions/animal";
import { Trash2 } from "lucide-react";

export default function DeleteVaccinationButton({ id, animalId }: { id: number, animalId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Voulez-vous vraiment supprimer cette vaccination ? Cette action est irréversible."
      )
    )
      return;

    setLoading(true);
    const res = await deleteVaccinationAction(id, animalId);
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
      title="Supprimer la vaccination"
    >
      <Trash2 size={14} />
    </button>
  );
}
