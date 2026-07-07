// components/AssignEmployeForm.tsx
"use client";

import { useState } from "react";
import {
  MapPin,
  PawPrint,
  Wheat,
  Save,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Check,
  X,
  Loader2,
  User,
} from "lucide-react";
import {
  assignTerrainAction,
  assignAnimauxAction,
  assignCulturesAction,
  updateRoleDescriptionAction,
} from "@/actions/employe";

interface AssignEmployeFormProps {
  employeFerme: any;
  terrains: any[];
  animaux: any[];
  cultures: any[];
  onSuccess?: () => void;
}

export function AssignEmployeForm({
  employeFerme,
  terrains,
  animaux,
  cultures,
  onSuccess,
}: AssignEmployeFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTerrain, setSelectedTerrain] = useState<number | null>(
    employeFerme.terrainAssigneId ?? null
  );
  const [selectedAnimaux, setSelectedAnimaux] = useState<number[]>(
    employeFerme.animauxAssignes?.map((ea: any) => ea.animalId) ?? []
  );
  const [selectedCultures, setSelectedCultures] = useState<number[]>(
    employeFerme.culturesAssignees?.map((ec: any) => ec.cultureId) ?? []
  );
  const [roleDescription, setRoleDescription] = useState(
    employeFerme.roleDescription ?? employeFerme.poste ?? ""
  );

  const toggleAnimal = (id: number) => {
    setSelectedAnimaux((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleCulture = (id: number) => {
    setSelectedCultures((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        assignTerrainAction(employeFerme.id, selectedTerrain),
        assignAnimauxAction(employeFerme.id, selectedAnimaux),
        assignCulturesAction(employeFerme.id, selectedCultures),
        updateRoleDescriptionAction(employeFerme.id, roleDescription),
      ]);

      const failed = [r1, r2, r3, r4].find((r) => !r.success);
      if (failed) {
        setError(failed.error ?? "Erreur lors de la sauvegarde.");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onSuccess?.();
      }
    } catch (e) {
      setError("Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  };

  const employe = employeFerme.employe;
  const hasAssignations =
    selectedTerrain || selectedAnimaux.length > 0 || selectedCultures.length > 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a2e28] border border-[#3C6C5F]/10 shadow-md overflow-hidden">
      {/* Header cliquable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA] dark:hover:bg-[#0d1a15] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white flex items-center justify-center font-bold text-sm overflow-hidden">
            {employe?.image ? (
              <img src={employe.image} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              `${employe?.prenom?.[0]}${employe?.nom?.[0]}`
            )}
          </div>
          <div className="text-left">
            <p className="font-bold text-[#29453E] dark:text-white text-sm">
              {employe?.prenom} {employe?.nom}
            </p>
            <p className="text-xs text-[#3C6C5F]/60">{employeFerme.poste}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Badges de résumé */}
          <div className="hidden sm:flex items-center gap-2">
            {selectedTerrain && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg font-medium">
                <MapPin size={11} />
                1 terrain
              </span>
            )}
            {selectedAnimaux.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg font-medium">
                <PawPrint size={11} />
                {selectedAnimaux.length}
              </span>
            )}
            {selectedCultures.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs rounded-lg font-medium">
                <Wheat size={11} />
                {selectedCultures.length}
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp size={18} className="text-[#3C6C5F]" />
          ) : (
            <ChevronDown size={18} className="text-[#3C6C5F]" />
          )}
        </div>
      </button>

      {/* Contenu expandé */}
      {expanded && (
        <div className="border-t border-[#3C6C5F]/10 p-5 space-y-6">

          {/* Rôle de travail */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#29453E] dark:text-white mb-2">
              <Briefcase size={15} className="text-[#3C6C5F]" />
              Rôle / Description du travail
            </label>
            <input
              type="text"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Ex: Responsable des animaux du terrain nord..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#3C6C5F]/15 bg-[#FAFAFA] dark:bg-[#0d1a15] text-[#29453E] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]/30 placeholder:text-[#3C6C5F]/30"
            />
          </div>

          {/* Terrain */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#29453E] dark:text-white mb-2">
              <MapPin size={15} className="text-red-500" />
              Terrain assigné
              <span className="text-xs text-[#3C6C5F]/40 font-normal">(sera affiché en rouge)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedTerrain(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                  !selectedTerrain
                    ? "border-[#3C6C5F]/30 bg-[#3C6C5F]/5 text-[#3C6C5F] font-medium"
                    : "border-[#3C6C5F]/10 text-[#3C6C5F]/40 hover:border-[#3C6C5F]/20"
                }`}
              >
                <X size={14} />
                Aucun terrain
              </button>
              {terrains.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTerrain(t.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                    selectedTerrain === t.id
                      ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium"
                      : "border-[#3C6C5F]/10 text-[#29453E] dark:text-white hover:border-red-200"
                  }`}
                >
                  <span className="truncate">{t.nom}</span>
                  <span className="text-xs opacity-60 shrink-0">{t.superficie} ha</span>
                </button>
              ))}
            </div>
          </div>

          {/* Animaux */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#29453E] dark:text-white mb-2">
              <PawPrint size={15} className="text-emerald-600" />
              Animaux assignés
              <span className="text-xs text-[#3C6C5F]/40 font-normal">{selectedAnimaux.length} sélectionné(s)</span>
            </label>
            {animaux.length === 0 ? (
              <p className="text-sm text-[#3C6C5F]/40 italic">Aucun animal dans cette ferme.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {animaux.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => toggleAnimal(a.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all text-left ${
                      selectedAnimaux.includes(a.id)
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                        : "border-[#3C6C5F]/10 text-[#29453E] dark:text-white hover:border-emerald-200"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedAnimaux.includes(a.id)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-[#3C6C5F]/20"
                    }`}>
                      {selectedAnimaux.includes(a.id) && <Check size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-xs">{a.race} #{a.numero}</p>
                      <p className="truncate text-[10px] opacity-60">{a.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cultures */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#29453E] dark:text-white mb-2">
              <Wheat size={15} className="text-amber-600" />
              Cultures assignées
              <span className="text-xs text-[#3C6C5F]/40 font-normal">{selectedCultures.length} sélectionnée(s)</span>
            </label>
            {cultures.length === 0 ? (
              <p className="text-sm text-[#3C6C5F]/40 italic">Aucune culture dans cette ferme.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {cultures.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleCulture(c.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all text-left ${
                      selectedCultures.includes(c.id)
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                        : "border-[#3C6C5F]/10 text-[#29453E] dark:text-white hover:border-amber-200"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedCultures.includes(c.id)
                        ? "border-amber-500 bg-amber-500"
                        : "border-[#3C6C5F]/20"
                    }`}>
                      {selectedCultures.includes(c.id) && <Check size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-xs">{c.nom}</p>
                      <p className="truncate text-[10px] opacity-60">{c.etat}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Erreur / Succès */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              <X size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm">
              <Check size={16} /> Assignations sauvegardées avec succès !
            </div>
          )}

          {/* Bouton Sauvegarder */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Enregistrement..." : "Sauvegarder les assignations"}
          </button>
        </div>
      )}
    </div>
  );
}
