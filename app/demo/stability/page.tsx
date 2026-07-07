// app/demo/stability/page.tsx
import { StabilityImageGenerator } from "@/components/StabilityImageGenerator";

export const metadata = {
  title: "Générateur d'images IA - SMART-FARM",
  description: "Créez des images avec l'IA pour votre ferme",
};

export default function StabilityDemoPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d1a15] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#29453E] dark:text-white">
            🎨 Générateur d'images IA
          </h1>
          <p className="text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60 mt-1">
            Créez des images professionnelles pour votre ferme
          </p>
        </div>

        <StabilityImageGenerator />
      </div>
    </div>
  );
}