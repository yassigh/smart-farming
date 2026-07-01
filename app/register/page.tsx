// app/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  User,
  UserRound,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  TriangleAlert,
  Check,
  LoaderCircle,
  KeyRound
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.EMPLOYE);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom,
          prenom,
          email,
          motDePasse: password,
          role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(data.error || "Une erreur est survenue lors de l'inscription.");
      }
    } catch (error) {
      setError("Erreur serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Rôles
  const roleOptions = [
    { value: Role.EMPLOYE, label: "Employé" },
    { value: Role.AGRICULTEUR, label: "Agriculteur" },
    { value: Role.VETERINAIRE, label: "Vétérinaire" },
    { value: Role.ADMIN, label: "Administrateur" },
  ];

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 relative"
      style={{
        backgroundImage: "url('/back.png')",
      }}
    >
      {/* Overlay plus clair */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#29453E]/60 via-[#29453E]/40 to-[#3C6C5F]/50 backdrop-blur-sm" />

      {/* Carte */}
      <div className="relative w-full max-w-[440px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
        
        {/* Logo et titre */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="SMART-FARM"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-[#29453E]">Créer un compte</h1>
          <p className="text-sm text-[#29453E]/60 mt-1">
            Rejoignez SMART-FARM et gérez votre exploitation
          </p>
        </div>

        {/* Message de succès */}
        {success && (
          <div className="mb-4 p-3 bg-[#DDF3E8] border border-[#9DAE7A] rounded-xl flex items-start gap-3 text-[#29453E] text-sm">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <span>Inscription réussie ! Redirection vers le tableau de bord...</span>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 text-sm">
            <TriangleAlert className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom & Prénom Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#29453E]">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#29453E]/40" />
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Jean"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F6F3] border border-[#E8E3DC] rounded-xl text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#29453E]">
                Nom
              </label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#29453E]/40" />
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Dupont"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F6F3] border border-[#E8E3DC] rounded-xl text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#29453E]">
              Adresse email
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#29453E]/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yassinegharbi158@gmail.com"
                className="w-full pl-11 pr-4 py-2.5 bg-[#F8F6F3] border border-[#E8E3DC] rounded-xl text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#29453E]">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#29453E]/40" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-2.5 bg-[#F8F6F3] border border-[#E8E3DC] rounded-xl text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#29453E]/40 hover:text-[#29453E] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 bg-[#E8E3DC] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      password.length >= 8 
                        ? 'bg-[#3C6C5F]' 
                        : password.length >= 6 
                        ? 'bg-[#9DAE7A]' 
                        : 'bg-[#FFC490]'
                    }`}
                    style={{ width: `${Math.min((password.length / 8) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {password.length >= 8 ? (
                    <span className="text-[#3C6C5F] flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Fort
                    </span>
                  ) : password.length >= 6 ? (
                    <span className="text-[#9DAE7A]">Moyen</span>
                  ) : (
                    <span className="text-[#FFC490]">Faible</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Rôle */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#29453E]">
              Rôle principal
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#29453E]/40" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#F8F6F3] border border-[#E8E3DC] rounded-xl text-[#29453E] focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#29453E]/40 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl hover:shadow-[#3C6C5F]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoaderCircle className="w-5 h-5 animate-spin" />
                Inscription en cours...
              </>
            ) : success ? (
              <>
                <Check className="w-5 h-5" />
                Inscription réussie !
              </>
            ) : (
              <>
                S'inscrire gratuitement
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8E3DC]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-[#29453E]/40 uppercase tracking-wider">
              ou
            </span>
          </div>
        </div>

        {/* Boutons sociaux */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center py-2.5 border border-[#E8E3DC] rounded-xl hover:bg-[#F8F6F3] transition-all hover:border-[#3C6C5F]/30 group">
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.51 15.01 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.86 3c.9-2.7 3.4-4.46 6.64-4.46z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.73-4.88 3.73-8.64z"/>
              <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.82 0 10.97 0 13.2s.54 4.38 1.5 6.3l3.86-3z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.24 0-5.74-1.76-6.64-4.46L1.5 16.9C3.39 20.75 7.35 23 12 23z"/>
            </svg>
          </button>
          <button className="flex items-center justify-center py-2.5 border border-[#E8E3DC] rounded-xl hover:bg-[#F8F6F3] transition-all hover:border-[#3C6C5F]/30 group">
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-sm text-[#29453E]/50">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-[#3C6C5F] font-semibold hover:text-[#29453E] transition-colors"
          >
            Se connecter
          </Link>
        </p>

        {/* Badge de sécurité */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#29453E]/30">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Connexion sécurisée</span>
          <span className="w-1 h-1 rounded-full bg-[#29453E]/20" />
          <span>SSL/TLS</span>
        </div>
      </div>
    </div>
  );
}