// components/StabilityImageGenerator.tsx
"use client";

import { useState } from "react";
import { Loader2, Sparkles, Download, X } from "lucide-react";

export function StabilityImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<"ultra" | "core" | "sd3.5">("ultra");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Veuillez entrer une description d'image");
      return;
    }

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model,
          width: 1024,
          height: 1024,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          text.includes("<!DOCTYPE")
            ? "La route /api/generate-image n'existe pas ou renvoie une page HTML."
            : text || "Réponse invalide du serveur."
        );
      }

      if (!response.ok) {
        throw new Error(data?.error || "Erreur de génération");
      }

      if (data?.success && data?.image) {
        setImage(data.image);
      } else {
        throw new Error(data?.error || "Aucune image générée");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${image}`;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setImage(null);
    setPrompt("");
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 shadow-xl border border-[#FFC490]/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-[#3C6C5F] to-[#29453E] rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#29453E] dark:text-white">
            Générateur d'images IA
          </h2>
          <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">
            Créez des images avec Stability AI
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#29453E] dark:text-white mb-2">
            Description de l'image
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Une ferme moderne avec des champs de blé dorés au coucher du soleil..."
            className="w-full px-4 py-3 rounded-xl border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] min-h-[100px] resize-y"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-[#3C6C5F]/50 dark:text-[#9DAE7A]/50">
            💬 Vous pouvez écrire en français — la description sera automatiquement traduite en anglais.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#29453E] dark:text-white mb-2">
            Modèle
          </label>
          <select
            value={model}
            onChange={(e) =>
              setModel(e.target.value as "ultra" | "core" | "sd3.5")
            }
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#FFC490]/20 dark:border-[#FFC490]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] text-[#29453E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]"
            disabled={loading}
          >
            <option value="ultra">Ultra (6 crédits) - Meilleure qualité</option>
            <option value="core">Core (3 crédits) - Bon compromis</option>
            <option value="sd3.5">SD3.5 (1 crédit) - Rapide</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Générer l'image
              </>
            )}
          </button>

          {image && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
            {error.includes('modération') && (
              <p className="text-xs text-red-500/80 dark:text-red-400/70 pl-7">
                💡 Astuce : utilisez une description simple en anglais, ex: <em>"modern farm with wheat fields and blue sky"</em>.
              </p>
            )}
          </div>
        )}

        {image && (
          <div className="relative rounded-xl overflow-hidden border-2 border-[#FFC490]/20 group">
            <img
              src={`data:image/png;base64,${image}`}
              alt="Image générée par IA"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={handleDownload}
                className="p-3 bg-white rounded-xl shadow-xl hover:scale-105 transition-transform"
              >
                <Download className="w-6 h-6 text-[#29453E]" />
              </button>
            </div>
            <div className="absolute bottom-2 left-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs">
              Généré avec {model.toUpperCase()}
            </div>
          </div>
        )}
      </form>

      <div className="mt-4 p-4 bg-[#FFF3DA] dark:bg-[#2a3f38] rounded-xl text-xs text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">
        <p>💡 Astuces pour de meilleurs résultats :</p>
        <ul className="list-disc list-inside mt-1 space-y-0.5">
          <li>Soyez précis dans votre description</li>
          <li>Ajoutez "professionnel", "haute qualité" pour de meilleurs résultats</li>
          <li>Utilisez le modèle Ultra pour les images finales</li>
        </ul>
      </div>
    </div>
  );
}