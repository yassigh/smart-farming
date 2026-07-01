"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAnimalAction } from "@/actions/animal";
import { Trash2 } from "lucide-react";

export default function DeleteAnimalButton({ animalId }: { animalId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Voulez-vous vraiment supprimer cet animal ? Cette action est irréversible."
      )
    )
      return;

    setLoading(true);
    const res = await deleteAnimalAction(animalId);
    if (res.success) {
      router.push("/dashboard/animaux");
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
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
    >
      <Trash2 size={16} />
      {loading ? "Suppression..." : "Supprimer"}
    </button>
  );
}
