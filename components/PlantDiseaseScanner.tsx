// components/PlantDiseaseScanner.tsx
'use client';

import { useState, useRef } from 'react';
import {
  UploadCloud,
  Scan,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Droplets,
  ShieldCheck,
  RefreshCw,
  Printer,
  FileSearch,
  Leaf,
  Info,
  Filter,
} from 'lucide-react';

interface DiseaseDetail {
  nom: string;
  plante: string;
  estSaine: boolean;
  gravite: 'FAIBLE' | 'MOYEN' | 'ELEVE';
  symptomes: string;
  traitementImmediat: string;
  prevention: string;
  conseilIrrigation: string;
}

interface PredictionItem {
  label: string;
  score: number;
}

export function PlantDiseaseScanner() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('auto');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiseaseDetail | null>(null);
  const [confiance, setConfiance] = useState<number | null>(null);
  const [isLivePrediction, setIsLivePrediction] = useState<boolean>(false);
  const [allPredictions, setAllPredictions] = useState<PredictionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const CROP_OPTIONS = [
    { value: 'auto', label: '🔍 Détection automatique (Toutes les cultures)' },
    { value: 'potato', label: '🥔 Pomme de terre' },
    { value: 'tomato', label: '🍅 Tomate' },
    { value: 'apple', label: '🍎 Pommier' },
    { value: 'grape', label: '🍇 Vigne' },
    { value: 'corn', label: '🌽 Maïs' },
    { value: 'pepper', label: '🫑 Poivron / Piment' },
    { value: 'peach', label: '🍑 Pêcher' },
    { value: 'strawberry', label: '🍓 Fraisier' },
    { value: 'squash', label: '🥒 Courge / Cucurbitacée' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image valide (JPEG, PNG, WebP).');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnostic(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnostic(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    setDiagnostic(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('crop', selectedCrop);

      const response = await fetch('/api/ai/diagnose-plant', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'analyse par l'IA.");
      }

      setDiagnostic(data.diagnostic);
      setConfiance(data.confiance);
      setIsLivePrediction(data.isLivePrediction);
      setAllPredictions(data.allPredictions || []);
    } catch (err: any) {
      console.error('Erreur analyse:', err);
      setError(err.message || 'Impossible de contacter le serveur d\'analyse IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setDiagnostic(null);
    setConfiance(null);
    setAllPredictions([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Carte principale d'importation et d'analyse */}
      <div className="bg-white dark:bg-[#13231c] rounded-3xl p-6 md:p-8 border border-[#3C6C5F]/20 shadow-xl shadow-[#3C6C5F]/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#29453E] dark:text-white flex items-center gap-3">
              <span className="p-2.5 bg-[#FFF3DA] dark:bg-[#29453E] text-[#3C6C5F] dark:text-[#9DAE7A] rounded-xl inline-flex">
                <Scan className="w-6 h-6" />
              </span>
              Diagnostic de Maladies Végétales (Vision IA)
            </h2>
            <p className="text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70 text-sm mt-1">
              Importez la photo d'une feuille ou plante atteinte pour obtenir un diagnostic instantané et un traitement adapté.
            </p>
          </div>

          {selectedImage && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors self-start md:self-auto px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <RefreshCw className="w-4 h-4" /> Recommencer
            </button>
          )}
        </div>

        {/* Sélecteur optionnel de culture pour affiner la prédiction */}
        <div className="mb-6 bg-[#FAF9F6] dark:bg-[#1a2d24] p-4 rounded-2xl border border-[#3C6C5F]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#29453E] dark:text-[#9DAE7A]">
            <Filter className="w-4 h-4 text-[#3C6C5F]" />
            <span>Spécifier la culture (Optionnel) :</span>
          </div>

          <select
            value={selectedCrop}
            onChange={(e) => {
              setSelectedCrop(e.target.value);
              if (selectedImage && diagnostic) {
                // Ré-analyser si une image est déjà chargée
                setTimeout(() => handleAnalyze(), 100);
              }
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-[#13231c] border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#29453E] dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]"
          >
            {CROP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Zone d'Upload / Preview (Col 1 to 6) */}
          <div className="lg:col-span-6 space-y-4">
            {!previewUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-[#3C6C5F]/30 hover:border-[#3C6C5F] dark:border-gray-700 dark:hover:border-[#9DAE7A] rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all bg-[#FAF9F6] hover:bg-[#FFF3DA]/30 dark:bg-[#1a2d24] dark:hover:bg-[#243d31] flex flex-col items-center justify-center min-h-[300px]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="p-4 bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white rounded-2xl shadow-lg shadow-[#3C6C5F]/20 group-hover:scale-110 transition-transform duration-300 mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#29453E] dark:text-white mb-1">
                  Glissez-déposez la photo d'une feuille ici
                </h3>
                <p className="text-sm text-[#3C6C5F]/60 dark:text-gray-400 max-w-xs mb-4">
                  ou cliquez pour parcourir vos fichiers (JPG, PNG, WEBP)
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FFF3DA] dark:bg-[#29453E] text-[#3C6C5F] dark:text-[#9DAE7A]">
                  <Sparkles className="w-3.5 h-3.5" /> Analyse 38 classes par GEMINI Vision IA
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-[#3C6C5F]/20 shadow-md bg-black/5 dark:bg-black/20 group">
                <img
                  src={previewUrl}
                  alt="Feuille à analyser"
                  className="w-full h-[320px] object-cover rounded-2xl"
                />

                {/* Laser scan animation when analyzing */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 shadow-[0_0_15px_#10B981] animate-pulse" style={{ animationDuration: '1.5s' }} />
                    <div className="bg-[#29453E]/90 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md">
                      <Scan className="w-6 h-6 animate-spin text-[#9DAE7A]" />
                      <span className="font-semibold text-sm">Analyse des structures foliaires...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bouton d'action principal */}
            {previewUrl && !diagnostic && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1a2d24] text-white font-bold text-lg shadow-xl shadow-[#3C6C5F]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#FFC490]" />
                    Lancer le diagnostic IA par photo
                  </>
                )}
              </button>
            )}
          </div>

          {/* Zone d'affichage des résultats ou instructions (Col 7 to 12) */}
          <div className="lg:col-span-6 space-y-4">
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 flex items-start gap-3 text-sm">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">Analyse incomplète</h4>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!diagnostic && !isAnalyzing && (
              <div className="h-full min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#FAF9F6]/50 dark:bg-[#13231c]/50">
                <FileSearch className="w-12 h-12 text-[#3C6C5F]/40 dark:text-[#9DAE7A]/40 mb-3" />
                <h4 className="text-base font-bold text-[#29453E] dark:text-gray-200 mb-1">
                  Aucun diagnostic en cours
                </h4>
                <p className="text-xs text-[#3C6C5F]/60 dark:text-gray-400 max-w-sm">
                  Sélectionnez la photo d'une feuille affectée et lancez l'analyse pour recevoir un rapport d'expertise.
                </p>
                <div className="mt-6 text-left w-full space-y-2 bg-white dark:bg-[#1a2d24] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="text-xs font-semibold text-[#29453E] dark:text-gray-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#3C6C5F]" /> Diagnostic direct disponible pour :
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {['Pommes de terre', 'Tomates', 'Maïs', 'Pommier', 'Vigne', 'Poivron', 'Fraisier', 'Courge', 'Pêcher'].map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-md bg-[#FFF3DA] dark:bg-[#29453E] text-[#29453E] dark:text-[#9DAE7A]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Fiche de Diagnostic générée par l'IA */}
            {diagnostic && (
              <div className="bg-gradient-to-br from-white to-[#FFF3DA]/20 dark:from-[#1a2d24] dark:to-[#13231c] rounded-2xl p-6 border border-[#3C6C5F]/30 shadow-lg space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
                {/* En-tête du diagnostic */}
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#3C6C5F]/15 text-[#3C6C5F] dark:bg-[#9DAE7A]/25 dark:text-[#9DAE7A]">
                        Plante : {diagnostic.plante}
                      </span>
                      {isLivePrediction && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Mode Direct IA
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-extrabold text-[#29453E] dark:text-white mt-1">
                      {diagnostic.nom}
                    </h3>
                  </div>

                  {/* Badge gravité */}
                  <div className="shrink-0 text-right">
                    {diagnostic.estSaine ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4" /> Saine
                      </span>
                    ) : diagnostic.gravite === 'ELEVE' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300">
                        <AlertTriangle className="w-4 h-4" /> Risque Élevé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                        <AlertTriangle className="w-4 h-4" /> Risque Modéré
                      </span>
                    )}

                    {confiance !== null && (
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Confiance: <span className="font-bold text-[#29453E] dark:text-[#9DAE7A]">{confiance}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conseil si confiance basse */}
                {confiance !== null && confiance < 50 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>
                      Confiance modérée ({confiance}%). Pour maximiser la précision, vous pouvez sélectionner votre culture spécifique ("{diagnostic.plante}") dans le sélecteur ci-dessus.
                    </span>
                  </div>
                )}

                {/* Symptômes observés */}
                <div className="space-y-1.5">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#3C6C5F] dark:text-[#9DAE7A] flex items-center gap-1.5">
                    <Leaf className="w-4 h-4" /> Symptômes observés :
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-gray-800/80 leading-relaxed">
                    {diagnostic.symptomes}
                  </p>
                </div>

                {/* Traitement Immédiat Curatif */}
                <div className="space-y-1.5">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#29453E] dark:text-[#9DAE7A] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Traitement Immédiat Recommandé :
                  </h4>
                  <p className="text-xs text-[#29453E] dark:text-gray-100 bg-[#FFF3DA] dark:bg-[#29453E]/60 p-3 rounded-xl font-medium border border-[#FFC490]/50 dark:border-[#3C6C5F] leading-relaxed">
                    {diagnostic.traitementImmediat}
                  </p>
                </div>

                {/* Prévention & Irrigation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white/80 dark:bg-black/30 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                    <span className="font-bold text-[#29453E] dark:text-[#9DAE7A] block mb-1">🛡️ Mesures Préventives :</span>
                    <span className="text-gray-600 dark:text-gray-300">{diagnostic.prevention}</span>
                  </div>

                  <div className="p-3 bg-white/80 dark:bg-black/30 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                    <span className="font-bold text-[#29453E] dark:text-[#9DAE7A] block mb-1 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" /> Conseil d'irrigation :
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{diagnostic.conseilIrrigation}</span>
                  </div>
                </div>

                {/* Actions d'impression / réanalyse */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={handleReset}
                    className="text-xs font-semibold text-[#3C6C5F] dark:text-[#9DAE7A] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Analyser une autre photo
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg bg-[#29453E] text-white hover:bg-[#3C6C5F] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" /> Imprimer la fiche
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
