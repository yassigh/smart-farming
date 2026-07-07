"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Warehouse } from "lucide-react";

interface Ferme {
  id: number;
  nom: string;
}

interface Props {
  fermes: Ferme[];
  selectedId: number;
}

export default function FermeSelector({ fermes, selectedId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("fermeId", value);
    } else {
      params.delete("fermeId");
    }
    router.push(`/dashboard/employes?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-[#1a2e28] border border-[#3C6C5F]/10 px-4 py-2.5 rounded-2xl shadow-sm">
      <Warehouse className="text-[#3C6C5F] w-5 h-5" />
      <span className="text-sm font-semibold text-[#29453E] dark:text-[#9DAE7A] whitespace-nowrap">
        Exploitation :
      </span>
      <select
        value={selectedId || ""}
        onChange={handleSelect}
        className="bg-transparent text-sm text-[#29453E] dark:text-white font-medium focus:outline-none cursor-pointer pr-4 border-none"
      >
        {fermes.map((f) => (
          <option key={f.id} value={f.id} className="bg-white dark:bg-[#1a2e28] text-[#29453E] dark:text-white">
            {f.nom}
          </option>
        ))}
      </select>
    </div>
  );
}
