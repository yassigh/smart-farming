// app/settings/page.tsx - CORRIGÉ
import { getConnectedUser } from "@/actions/auth";
import SettingsView from "@/components/SettingsView";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getConnectedUser();

  if (!user) {
    redirect("/login");
  }

  // ✅ Supprimer ThemeProvider d'ici car il est déjà dans le layout
  return <SettingsView user={user} />;
}