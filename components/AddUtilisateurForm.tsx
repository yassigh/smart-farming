"use client";

import { useState } from "react";
import { addUtilisateurAction } from "@/actions/utilisateur";
import { Role } from "@prisma/client";

export default function AddUtilisateurForm() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState<Role>(Role.EMPLOYE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await addUtilisateurAction({
      nom,
      prenom,
      email,
      motDePasse,
      telephone: telephone || undefined,
      role,
    });

    setLoading(false);

    if (response.success) {
      setMessage({ type: "success", text: "Utilisateur ajouté avec succès !" });
      // Reset form
      setNom("");
      setPrenom("");
      setEmail("");
      setMotDePasse("");
      setTelephone("");
      setRole(Role.EMPLOYE);
    } else {
      setMessage({ type: "error", text: response.error || "Une erreur est survenue." });
    }
  };

  return (
    <div className="w-full max-w-lg p-8 bg-white border border-zinc-200/80 rounded-2xl shadow-xl dark:bg-zinc-900 dark:border-zinc-800 transition-all">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
        Ajouter un Utilisateur
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Nom
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
              placeholder="Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Prénom
            </label>
            <input
              type="text"
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
              placeholder="Jean"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
            placeholder="jean.dupont@exemple.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Téléphone (Optionnel)
          </label>
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
            placeholder="+33 6 12 34 56 78"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Rôle
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-300 text-zinc-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
          >
            <option value={Role.EMPLOYE}>Employé</option>
            <option value={Role.AGRICULTEUR}>Agriculteur</option>
            <option value={Role.VETERINAIRE}>Vétérinaire</option>
            <option value={Role.ADMIN}>Administrateur</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 active:scale-98 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-emerald-600/10"
        >
          {loading ? "Création..." : "Ajouter l'utilisateur"}
        </button>

        {message && (
          <div
            className={`mt-4 p-3.5 rounded-lg text-sm font-medium border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
