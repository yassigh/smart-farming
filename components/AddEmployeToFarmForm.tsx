"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addEmployeFermeAction } from "@/actions/employe";
import { UserPlus, Coins, Briefcase, Calendar, Loader2 } from "lucide-react";

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface Props {
  fermeId: number;
  availableEmployees: User[];
}

export default function AddEmployeToFarmForm({ fermeId, availableEmployees }: Props) {
  const router = useRouter();
  const [employeId, setEmployeId] = useState("");
  const [poste, setPoste] = useState("");
  const [salaire, setSalaire] = useState("");
  const [dateEmbauche, setDateEmbauche] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeId) {
      setError("Veuillez sélectionner un employé.");
      return;
    }
    setError(null);
    setLoading(true);
    setSuccess(false);

    const result = await addEmployeFermeAction({
      employeId: parseInt(employeId),
      fermeId,
      poste,
      salaire: parseFloat(salaire),
      dateEmbauche,
    });

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setPoste("");
      setSalaire("");
      setEmployeId("");
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Une erreur est survenue.");
    }
  };

  if (availableEmployees.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a2e28] border border-[#3C6C5F]/10 rounded-2xl p-6 text-sm text-[#3C6C5F]/60">
        Aucun employé disponible pour cette ferme. Tous les employés du système sont déjà affectés ou aucun n'a été créé.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a2e28] border border-[#3C6C5F]/10 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] flex items-center justify-center">
          <UserPlus className="text-[#3C6C5F]" size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-[#29453E] dark:text-white">Rattacher un Employé</h2>
          <p className="text-xs text-[#3C6C5F]/60">Associez un nouvel employé à cette exploitation.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#29453E] dark:text-[#9DAE7A] mb-1">
            Employé <span className="text-red-500">*</span>
          </label>
          <select
            value={employeId}
            onChange={(e) => setEmployeId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#3C6C5F]/20 bg-gray-50 dark:bg-zinc-800 text-sm text-[#29453E] dark:text-white focus:outline-none focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 transition-all cursor-pointer"
            required
          >
            <option value="">-- Choisir un employé --</option>
            {availableEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.prenom} {emp.nom} ({emp.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#29453E] dark:text-[#9DAE7A] mb-1">
              Poste / Rôle <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3C6C5F]/40" />
              <input
                type="text"
                placeholder="Ex: Berger, Tracteuriste"
                value={poste}
                onChange={(e) => setPoste(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#3C6C5F]/20 bg-gray-50 dark:bg-zinc-800 text-sm text-[#29453E] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#29453E] dark:text-[#9DAE7A] mb-1">
              Salaire Mensuel (€) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3C6C5F]/40" />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 1500"
                value={salaire}
                onChange={(e) => setSalaire(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#3C6C5F]/20 bg-gray-50 dark:bg-zinc-800 text-sm text-[#29453E] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#29453E] dark:text-[#9DAE7A] mb-1">
            Date d'embauche <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3C6C5F]/40" />
            <input
              type="date"
              value={dateEmbauche}
              onChange={(e) => setDateEmbauche(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#3C6C5F]/20 bg-gray-50 dark:bg-zinc-800 text-sm text-[#29453E] dark:text-white focus:outline-none focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/10 transition-all"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400 text-xs font-medium rounded-xl">
            ✓ Employé rattaché avec succès !
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white text-sm font-semibold hover:from-[#29453E] hover:to-[#1f332e] active:scale-98 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-[#3C6C5F]/10 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Rattachement en cours...
            </>
          ) : (
            "Rattacher cet employé"
          )}
        </button>
      </form>
    </div>
  );
}
