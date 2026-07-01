import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Users,
  PawPrint,
  Sprout,
  Stethoscope,
  DollarSign,
  BarChart3,
  Calendar,
  Clock,
  Star,
  Award,
  Trophy,
  Gem,
  Crown,
  Rocket,
  Zap,
  Target,
  Layers,
  Leaf,
  TreePine,
  Wheat,
  Droplets,
  Sun,
  Moon,
  Cloud,
  Thermometer,
  Wind,
  Compass,
  HeartPulse,
  Syringe,
  Pill,
  Dog,
  Beef,
  Milk,
  Egg,
  Tractor,
  Building2,
  MapPin,
  Globe,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Coins,
  PieChart,
  LineChart,
  Activity,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  MessageCircle,
  MessageSquare,
  Send,
  Inbox,
  Archive,
  BookOpen,
  FolderOpen,
  Save,
  Download,
  Printer,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Gift,
  Package,
  Box,
  Truck,
  ShoppingBag,
  ShoppingCart,
  Phone,
  Mail,
  Map,
  Navigation,
  User,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col font-sans select-none bg-white">
      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-[#FFC490]/30">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-45 h-10 rounded-xl bg-[#3C6C5F] flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="SmartFarming Logo"
              width={140}
              height={35}
              className="object-contain brightness-0 invert"
            />
          </div>
          
        </div>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-[#29453E]/70">
          <a href="#features" className="hover:text-[#3C6C5F] transition-colors">Fonctionnalités</a>
          <a href="#stats" className="hover:text-[#3C6C5F] transition-colors">Statistiques</a>
          <a href="#testimonials" className="hover:text-[#3C6C5F] transition-colors">Témoignages</a>
          <a href="#contact" className="hover:text-[#3C6C5F] transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/login"
            className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-sm font-semibold border border-[#FFC490] text-[#29453E] hover:bg-[#FFF3DA] transition-all"
          >
            Se Connecter
          </Link>
          <Link
            href="/register"
            className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-sm font-semibold bg-[#3C6C5F] text-white hover:bg-[#29453E] shadow-md transition-all flex items-center gap-2"
          >
            Commencer
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="flex-1 space-y-4 md:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF3DA] border border-[#FFC490] text-sm font-semibold text-[#29453E]">
              <Sparkles size={16} className="text-[#3C6C5F]" />
              Solution Agricole Intelligente
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-[#29453E]">
              Gérez votre ferme <br />
              <span className="text-[#3C6C5F]">avec précision & simplicité</span>
            </h1>

            <p className="text-sm md:text-base lg:text-lg text-[#29453E]/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Suivez vos troupeaux, planifiez les cultures, analysez vos rendements financiers et optimisez les traitements vétérinaires dans une interface unifiée.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link
                href="/dashboard"
                className="px-6 md:px-8 py-3 md:py-3.5 rounded-xl bg-[#3C6C5F] text-white font-semibold shadow-lg hover:shadow-xl hover:bg-[#29453E] transition-all flex items-center gap-2 text-sm md:text-base"
              >
                Accéder au Dashboard
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#features"
                className="px-6 md:px-8 py-3 md:py-3.5 rounded-xl border border-[#FFC490] text-[#29453E] font-semibold hover:bg-[#FFF3DA] transition-all text-sm md:text-base"
              >
                En savoir plus
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 md:gap-6 justify-center lg:justify-start pt-4">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
              </div>
              <span className="text-xs font-semibold text-[#29453E]">
                +500 agriculteurs satisfaits
              </span>
            </div>
          </div>

          {/* Right Hero Graphics */}
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-[#FFF3DA] to-[#FFC490]/20 border border-[#FFC490] p-6 md:p-8 flex flex-col justify-between shadow-xl">
              {/* Top Card */}
              <div className="flex justify-between items-center bg-white/95 rounded-2xl p-3 md:p-4 shadow-md border border-[#FFC490]/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#9DAE7A]/20 flex items-center justify-center">
                    <Milk size={18} className="text-[#3C6C5F]" />
                  </div>
                  <p className="text-sm md:text-lg font-black text-[#29453E]">85,125 L</p>
                </div>
                <span className="text-xs font-semibold text-[#3C6C5F] bg-[#9DAE7A]/20 px-2 py-1 rounded-lg">
                  +12.5%
                </span>
              </div>

              {/* Middle Card */}
              <div className="flex justify-between items-center bg-[#29453E] text-[#FFF3DA] rounded-2xl p-3 md:p-4 shadow-md self-end w-[85%]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#3C6C5F] flex items-center justify-center">
                    <HeartPulse size={18} className="text-white" />
                  </div>
                  <p className="text-sm md:text-lg font-bold">98.5% Santé</p>
                </div>
                <CheckCircle2 size={18} className="text-[#9DAE7A]" />
              </div>

              {/* Bottom Card */}
              <div className="flex justify-between items-center bg-white/95 rounded-2xl p-3 md:p-4 shadow-md border border-[#FFC490]/30 w-[90%]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFC490]/20 flex items-center justify-center">
                    <Wheat size={18} className="text-[#29453E]" />
                  </div>
                  <p className="text-sm md:text-lg font-bold text-[#29453E]">Blé, Maïs, Orge</p>
                </div>
                <TrendingUp size={18} className="text-[#3C6C5F]" />
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-2xl bg-[#FFC490] shadow-lg flex items-center justify-center animate-bounce">
                <Rocket size={24} className="text-[#29453E]" />
              </div>
              <div className="absolute -bottom-3 -left-3 w-10 h-10 rounded-xl bg-[#9DAE7A] shadow-lg flex items-center justify-center animate-pulse">
                <Target size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-16 lg:py-20">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF3DA] border border-[#FFC490] text-sm font-semibold text-[#29453E] mb-4">
              <Sparkles size={16} className="text-[#3C6C5F]" />
              Fonctionnalités
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#29453E]">
              Tout ce dont vous avez besoin pour <br />
              <span className="text-[#3C6C5F]">gérer votre exploitation</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Feature 1 */}
            <div className="bg-white border border-[#FFC490] rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#9DAE7A]/20 flex items-center justify-center mb-4 group-hover:bg-[#9DAE7A]/30 transition-all">
                <PawPrint size={24} className="text-[#3C6C5F]" />
              </div>
              <h3 className="font-bold text-[#29453E] text-sm md:text-base mb-2">Gestion du Cheptel</h3>
              <p className="text-xs md:text-sm text-[#29453E]/60 leading-relaxed">
                Suivez chaque animal, son état de santé, ses traitements et ses vaccinations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[#FFC490] rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#FFC490]/20 flex items-center justify-center mb-4 group-hover:bg-[#FFC490]/30 transition-all">
                <Sprout size={24} className="text-[#29453E]" />
              </div>
              <h3 className="font-bold text-[#29453E] text-sm md:text-base mb-2">Suivi des Cultures</h3>
              <p className="text-xs md:text-sm text-[#29453E]/60 leading-relaxed">
                Planifiez vos plantations, suivez les rendements et optimisez vos récoltes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[#FFC490] rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#FFF3DA] flex items-center justify-center mb-4 group-hover:bg-[#FFF3DA]/70 transition-all">
                <Stethoscope size={24} className="text-[#29453E]" />
              </div>
              <h3 className="font-bold text-[#29453E] text-sm md:text-base mb-2">Santé Animale</h3>
              <p className="text-xs md:text-sm text-[#29453E]/60 leading-relaxed">
                Enregistrez les traitements, suivez les vaccinations et surveillez la santé.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-[#FFC490] rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#3C6C5F]/10 flex items-center justify-center mb-4 group-hover:bg-[#3C6C5F]/20 transition-all">
                <BarChart3 size={24} className="text-[#3C6C5F]" />
              </div>
              <h3 className="font-bold text-[#29453E] text-sm md:text-base mb-2">Analyses Financières</h3>
              <p className="text-xs md:text-sm text-[#29453E]/60 leading-relaxed">
                Visualisez vos revenus, dépenses et bénéfices en temps réel.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-12 md:py-16 bg-[#FFF3DA] rounded-3xl px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#3C6C5F]">500+</p>
              <p className="text-xs md:text-sm text-[#29453E]/60 font-semibold mt-1">Agriculteurs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#3C6C5F]">1,200+</p>
              <p className="text-xs md:text-sm text-[#29453E]/60 font-semibold mt-1">Animaux suivis</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#3C6C5F]">98%</p>
              <p className="text-xs md:text-sm text-[#29453E]/60 font-semibold mt-1">Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#3C6C5F]">24/7</p>
              <p className="text-xs md:text-sm text-[#29453E]/60 font-semibold mt-1">Support disponible</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-12 md:py-16">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#29453E]">
              Ce que disent nos <span className="text-[#3C6C5F]">utilisateurs</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white border border-[#FFC490] rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
              </div>
              <p className="text-xs md:text-sm text-[#29453E]/70 leading-relaxed">
                "SmartFarming a révolutionné la gestion de ma ferme. Je peux suivre chaque animal et chaque culture en temps réel."
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-[#9DAE7A]/30 flex items-center justify-center">
                  <User size={16} className="text-[#3C6C5F]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#29453E]">Ahmed Benali</p>
                  <p className="text-[10px] text-[#29453E]/60">Agriculteur, Blida</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#FFC490] rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
              </div>
              <p className="text-xs md:text-sm text-[#29453E]/70 leading-relaxed">
                "Grâce à l'IA intégrée, je peux anticiper les maladies et optimiser mes traitements vétérinaires."
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-[#FFC490]/30 flex items-center justify-center">
                  <User size={16} className="text-[#29453E]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#29453E]">Dr. Fatima Zohra</p>
                  <p className="text-[10px] text-[#29453E]/60">Vétérinaire, Alger</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#FFC490] rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
                <Star size={16} className="text-[#FFC490] fill-[#FFC490]" />
              </div>
              <p className="text-xs md:text-sm text-[#29453E]/70 leading-relaxed">
                "Le suivi financier m'a permis de réduire mes coûts de 25% en un an. Un outil indispensable !"
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-[#3C6C5F]/20 flex items-center justify-center">
                  <User size={16} className="text-[#3C6C5F]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#29453E]">Karim Mansouri</p>
                  <p className="text-[10px] text-[#29453E]/60">Agriculteur, Sétif</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-[#29453E] to-[#3C6C5F] rounded-3xl px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Prêt à transformer votre exploitation ?
          </h2>
          <p className="text-white/80 text-sm md:text-base mb-6 max-w-2xl mx-auto">
            Rejoignez des milliers d'agriculteurs qui utilisent SmartFarming pour optimiser leur production.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-xl bg-[#FFC490] text-[#29453E] font-bold shadow-lg hover:shadow-xl hover:bg-[#FFB070] transition-all"
          >
            Commencer gratuitement
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#29453E] text-[#FFF3DA]/60 py-8 mt-8 border-t border-[#3C6C5F]/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3C6C5F] flex items-center justify-center">
              <Sprout size={18} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">
              Smart<span className="text-[#FFC490]">Farming</span>
            </span>
          </div>
          <p className="text-xs">
            © 2026 SmartFarming Suite. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-xs font-semibold">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}