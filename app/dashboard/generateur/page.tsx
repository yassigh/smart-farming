// app/dashboard/generateur/page.tsx
'use client';

import { useState } from 'react';
import { StabilityImageGenerator } from '@/components/StabilityImageGenerator';
import { PlantDiseaseScanner } from '@/components/PlantDiseaseScanner';
import { Sparkles, Scan, Image as ImageIcon } from 'lucide-react';

export default function GenerateurPage() {
  const [activeTab, setActiveTab] = useState<'vision' | 'generation'>('vision');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#FFF3DA]/40 dark:from-[#0d1a15] dark:to-[#1a2e28] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* En-tête principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#13231c] p-6 rounded-3xl border border-[#3C6C5F]/20 shadow-xl shadow-[#3C6C5F]/5">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-[#3C6C5F] to-[#29453E] rounded-2xl shadow-lg shadow-[#3C6C5F]/20 text-white shrink-0">
              <Sparkles className="w-8 h-8 text-[#FFC490]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#29453E] dark:text-white">
                Générateur & Vision IA
              </h1>
              <p className="text-sm text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70 mt-0.5">
                Diagnostic de maladies végétales par photo & création d'images agricoles par l'IA
              </p>
            </div>
          </div>

          {/* Navigation par Onglets */}
          <div className="flex items-center p-1.5 bg-[#FAF9F6] dark:bg-[#1a2d24] rounded-2xl border border-[#3C6C5F]/10">
            <button
              onClick={() => setActiveTab('vision')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 ${
                activeTab === 'vision'
                  ? 'bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white shadow-md'
                  : 'text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Scan className="w-4 h-4" />
              Diagnostic Maladies (Vision IA)
            </button>

            <button
              onClick={() => setActiveTab('generation')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 ${
                activeTab === 'generation'
                  ? 'bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white shadow-md'
                  : 'text-[#3C6C5F] dark:text-[#9DAE7A] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Générateur d'images
            </button>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'vision' ? (
          <PlantDiseaseScanner />
        ) : (
          <StabilityImageGenerator />
        )}
      </div>
    </div>
  );
}