// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  ArrowRight,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Send
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await requestPasswordReset(email);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message! });
      setEmail("");
    } else {
      setMessage({ type: 'error', text: result.error! });
    }
    
    setLoading(false);
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
          <h1 className="text-2xl font-bold text-[#29453E]">Mot de passe oublié</h1>
          <p className="text-sm text-[#29453E]/60 mt-1">
            Entrez votre email pour recevoir un lien de réinitialisation
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
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="yassinegharbi158@gmail.com"
                className="w-full pl-11 pr-4 py-3 bg-[#F8F6F3] border border-[#E8E3DC] rounded-xl text-[#29453E] placeholder:text-[#29453E]/40 focus:outline-none focus:ring-2 focus:ring-[#3C6C5F] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#1f332e] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#3C6C5F]/20 hover:shadow-xl hover:shadow-[#3C6C5F]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                Envoyer le lien de réinitialisation
                <Send className="w-5 h-5" />
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