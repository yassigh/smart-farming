// app/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/auth";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  TriangleAlert,
  Check,
  LoaderCircle,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setMessage({ type: 'error', text: 'Token invalide ou manquant.' });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await resetPassword(token!, password);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message! });
      setPassword("");
      setConfirmPassword("");
    } else {
      setMessage({ type: 'error', text: result.error! });
    }
    
    setLoading(false);
  };

  // Si token invalide
  if (!isValidToken) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 relative"
        style={{
          backgroundImage: "url('/back.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#29453E]/60 via-[#29453E]/40 to-[#3C6C5F]/50 backdrop-blur-sm" />
        
        <div className="relative w-full max-w-[440px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TriangleAlert className="w-10 h-10 text-red-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#29453E]">Token invalide</h1>
          <p className="text-sm text-[#29453E]/60 mt-2">
            Le lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link 
            href="/forgot-password" 
            className="mt-4 inline-block text-[#3C6C5F] font-semibold hover:text-[#29453E] transition-colors"
          >
            Demander un nouveau lien →
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="text-center mb-8">
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
          <h1 className="text-2xl font-bold text-[#29453E]">Nouveau mot de passe</h1>
          <p className="text-sm text-[#29453E]/60 mt-1">
            Choisissez un mot de passe sécurisé
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl flex items-start gap-3 text-sm ${
            message.type === 'success' 
              ? 'bg-[#DDF3E8] border border-[#9DAE7A] text-[#29453E]'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
            ) : (
              <TriangleAlert className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nouveau mot de passe */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#29453E]">
              Nouveau mot de passe
            </label>
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

          {/* Confirmer le mot de passe */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#29453E]">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#29453E]/40" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-[#F8F6F3] border border-[#E8E3DC] rounded-xl text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#29453E]/40 hover:text-[#29453E] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Indicateur de force */}
          {password && (
            <div className="flex items-center gap-2">
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
                  <span className="text-[#3C6C5F] flex items-center gap-1">
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

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl hover:shadow-[#3C6C5F]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoaderCircle className="w-5 h-5 animate-spin" />
                Réinitialisation en cours...
              </>
            ) : (
              <>
                Réinitialiser le mot de passe
                <KeyRound className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Lien retour */}
        <div className="mt-6 text-center">
          <Link 
            href="/login" 
            className="text-sm text-[#3C6C5F] hover:text-[#29453E] font-medium transition-colors inline-flex items-center gap-1"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Retour à la connexion
          </Link>
        </div>

        {/* Badge de sécurité */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#29453E]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Connexion sécurisée</span>
          <span className="w-1 h-1 rounded-full bg-[#29453E]/20" />
          <span>SSL/TLS</span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#29453E]/60 to-[#3C6C5F]/50 backdrop-blur-sm">
        <div className="text-white animate-pulse">Chargement...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}