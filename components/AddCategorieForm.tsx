// components/AddCategorieForm.tsx
"use client";

import { useState } from "react";
import { addCategorieAction } from "@/actions/categorie";
import { TypeCategorie } from "@prisma/client";
import {
  Plus,
  PawPrint,
  Wheat,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Tags,
  Loader2
} from "lucide-react";

export default function AddCategorieForm() {
  const [nom, setNom] = useState("");
  const [type, setType] = useState<TypeCategorie>(TypeCategorie.ANIMAL);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await addCategorieAction({ nom, type });

    setLoading(false);

    if (response.success) {
      setMessage({ type: "success", text: "Catégorie ajoutée avec succès !" });
      setNom("");
      setType(TypeCategorie.ANIMAL);
    } else {
      setMessage({
        type: "error",
        text: response.error || "Une erreur est survenue.",
      });
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-lg border border-[#3C6C5F]/10 p-8 transition-all hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center shadow-lg shadow-[#3C6C5F]/20">
          <Tags className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#29453E] flex items-center gap-2">
            Nouvelle Catégorie
            <Sparkles className="w-4 h-4 text-[#FFC490]" />
          </h2>
          <p className="text-sm text-[#3C6C5F]/70">
            Ajoutez une catégorie d'animaux ou de cultures
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom */}
        <div>
          <label className="block text-sm font-semibold text-[#29453E] mb-2">
            Nom de la catégorie
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex: Bovins, Céréales..."
            className="
              w-full
              px-5
              py-3.5
              rounded-2xl
              border-2
              border-[#E8E3DC]
              bg-[#FAFAFA]
              text-[#29453E]
              placeholder:text-[#29453E]/40
              focus:outline-none
              focus:border-[#3C6C5F]
              focus:ring-4
              focus:ring-[#3C6C5F]/10
              focus:bg-white
              transition-all
              duration-200
              text-sm
            "
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-[#29453E] mb-3">
            Type
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType(TypeCategorie.ANIMAL)}
              className={`
                flex items-center justify-center gap-3
                py-4 rounded-2xl border-2 transition-all duration-300
                ${
                  type === TypeCategorie.ANIMAL
                    ? "border-[#3C6C5F] bg-[#DDF3E8] text-[#3C6C5F] shadow-md shadow-[#3C6C5F]/10"
                    : "border-[#E8E3DC] bg-white text-zinc-400 hover:border-[#9DAE7A] hover:bg-[#F8F6F3]"
                }
              `}
            >
              <PawPrint size={20} strokeWidth={1.5} />
              <span className="font-semibold">Animal</span>
            </button>

            <button
              type="button"
              onClick={() => setType(TypeCategorie.CULTURE)}
              className={`
                flex items-center justify-center gap-3
                py-4 rounded-2xl border-2 transition-all duration-300
                ${
                  type === TypeCategorie.CULTURE
                    ? "border-[#FFC490] bg-[#FFF3DA] text-[#B76E00] shadow-md shadow-[#FFC490]/10"
                    : "border-[#E8E3DC] bg-white text-zinc-400 hover:border-[#FFC490] hover:bg-[#F8F6F3]"
                }
              `}
            >
              <Wheat size={20} strokeWidth={1.5} />
              <span className="font-semibold">Culture</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            py-4
            rounded-2xl
            bg-gradient-to-r
            from-[#3C6C5F]
            to-[#29453E]
            hover:from-[#29453E]
            hover:to-[#1f332e]
            text-white
            font-semibold
            transition-all
            duration-300
            shadow-lg
            shadow-[#3C6C5F]/20
            hover:shadow-xl
            hover:shadow-[#3C6C5F]/30
            disabled:opacity-50
            disabled:cursor-not-allowed
            flex
            items-center
            justify-center
            gap-2
          "
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <Plus size={20} />
              Ajouter la catégorie
            </>
          )}
        </button>

        {/* Messages */}
        {message && (
          <div
            className={`
              flex items-center gap-3
              p-4 rounded-2xl border-2
              ${
                message.type === "success"
                  ? "bg-[#DDF3E8] border-[#9DAE7A] text-[#29453E]"
                  : "bg-red-50 border-red-200 text-red-700"
              }
              animate-in slide-in-from-top-2 duration-300
            `}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}