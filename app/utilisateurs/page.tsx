import { UtilisateurModel } from "@/models/utilisateur";
import AddUtilisateurForm from "@/components/AddUtilisateurForm";
import DeleteButton from "@/components/DeleteButton";
import Link from "next/link";

export default async function UtilisateursPage() {
  // Fetch users directly from the Model (Server Component capability)
  const utilisateurs = await UtilisateurModel.getAll();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Gestion des Utilisateurs
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Consultez, ajoutez et supprimez les membres de votre exploitation agricole intelligente.
            </p>
          </div>
          <Link
            href="/"
            className="self-start px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-sm font-semibold transition-all"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Form (Controller triggering input) */}
          <div className="lg:col-span-1">
            <AddUtilisateurForm />
          </div>

          {/* Right Column: List View (Displaying Models) */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl rounded-2xl overflow-hidden transition-all">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Liste des Utilisateurs ({utilisateurs.length})
              </h2>
            </div>

            {utilisateurs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                  👥
                </div>
                <h3 className="text-lg font-medium text-zinc-950 dark:text-white">Aucun utilisateur</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mt-1">
                  Commencez par en ajouter un à l'aide du formulaire ci-contre.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/40 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase border-b border-zinc-200 dark:border-zinc-800">
                      <th className="px-6 py-4">Nom Complet</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Rôle</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {utilisateurs.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-zinc-900 dark:text-white">
                            {user.prenom} {user.nom}
                          </div>
                          {user.telephone && (
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              {user.telephone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              user.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400"
                                : user.role === "AGRICULTEUR"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : user.role === "VETERINAIRE"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                                : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <DeleteButton id={user.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
