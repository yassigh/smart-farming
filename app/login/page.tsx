// app/login/page.tsx
"use client";

import { useState } from "react";
import { loginWithTwoFactor } from "@/actions/auth";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Fingerprint,
  ArrowRight,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Globe
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let normalizedEmail = email.trim();
    if (!normalizedEmail.includes('@')) {
      normalizedEmail = `${normalizedEmail}@gmail.com`;
    }

    const result = await loginWithTwoFactor(
      normalizedEmail,
      password,
      requiresTwoFactor ? twoFactorCode : undefined
    );

    setLoading(false);

    if (result.success) {
      window.location.href = "/dashboard";
    } else if (result.requiresTwoFactor) {
      setRequiresTwoFactor(true);
    } else {
      setError(result.error || "Email ou mot de passe incorrect");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 relative"
      style={{
        backgroundImage: "url('/back.png')",
      }}
    >
      {/* Overlay plus clair */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#29453E]/60 via-[#29453E]/40 to-[#3C6C5F]/50 backdrop-blur-sm" />

      {/* Carte de connexion */}
      <div className="relative w-full max-w-[440px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
        
        {/* Logo et titre */}
        <div className="text-center mb-8">
          {/* Logo PNG */}
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="SMART-FARM"
              width={120}
              height={100}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-[#29453E]">Bienvenue</h1>
          <p className="text-sm text-[#29453E]/60 mt-1">
            {requiresTwoFactor ? "Vérification à deux facteurs" : "Connectez-vous à votre compte"}
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!requiresTwoFactor ? (
            <>
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#29453E]">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#29453E]/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#F8F6F3] border border-[#E8E3DC] rounded-xl text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#29453E]">
                    Mot de passe
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-[#3C6C5F] hover:text-[#29453E] font-medium transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#29453E]/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 bg-[#F8F6F3] border border-[#E8E3DC] rounded-xl text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#29453E]/40 hover:text-[#29453E] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl hover:shadow-[#3C6C5F]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          ) : (
            // Formulaire 2FA
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-[#3C6C5F]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-8 h-8 text-[#3C6C5F]" />
                </div>
                <h3 className="font-semibold text-[#29453E]">Code de vérification</h3>
                <p className="text-sm text-[#29453E]/60">Entrez le code à 6 chiffres de votre application d'authentification</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#29453E] mb-1.5">
                  Code 2FA
                </label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#29453E]/40" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3 bg-[#F8F6F3] border border-[#E8E3DC] rounded-xl text-[#29453E] text-center text-2xl tracking-[8px] font-mono focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-[#29453E]/40 mt-2 text-center">
                  Ouvrez Google Authenticator ou Authy
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#3C6C5F]/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    Vérifier
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequiresTwoFactor(false);
                  setTwoFactorCode("");
                }}
                className="w-full text-sm text-[#29453E]/50 hover:text-[#29453E] transition-colors"
              >
                ← Retour à la connexion
              </button>
            </div>
          )}
        </form>

        {/* Séparateur */}
        {!requiresTwoFactor && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E3DC]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-[#29453E]/40 uppercase tracking-wider">
                  ou continuez avec
                </span>
              </div>
            </div>

            {/* Boutons sociaux */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google */}
              <button className="flex items-center justify-center py-2.5 border border-[#E8E3DC] rounded-xl hover:bg-[#F8F6F3] transition-all hover:border-[#3C6C5F]/30 group">
                <Globe className="w-5 h-5 text-[#4285F4] group-hover:scale-110 transition-transform" />
              </button>
              
              {/* Facebook - SVG personnalisé */}
              <button className="flex items-center justify-center py-2.5 border border-[#E8E3DC] rounded-xl hover:bg-[#F8F6F3] transition-all hover:border-[#3C6C5F]/30 group">
                <svg className="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        {!requiresTwoFactor && (
          <p className="mt-6 text-center text-sm text-[#29453E]/50">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="text-[#3C6C5F] font-semibold hover:text-[#29453E] transition-colors"
            >
              S'inscrire gratuitement
            </Link>
          </p>
        )}

        {/* Badge de sécurité */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#29453E]/30">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Connexion sécurisée</span>
          <span className="w-1 h-1 rounded-full bg-[#29453E]/20" />
          <span>SSL/TLS</span>
        </div>
      </div>
    </div>
  );
}