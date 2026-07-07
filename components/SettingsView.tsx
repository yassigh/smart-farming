// components/SettingsView.tsx

"use client";

import { useState, useRef } from "react";
import {
  User,
  Moon,
  Languages,
  Mail,
  Phone,
  Shield,
  Lock,
  Pencil,
  Save,
  Settings,
  Palette,
  Globe,
  UserCircle,
  Check,
  Eye,
  EyeOff,
  Bell,
  Award,
  Camera,
  X,
  Sun,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { updateUtilisateurAction } from "@/actions/utilisateur";
import { uploadProfileImage } from "@/actions/upload";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsView({ user }: any) {
  const [language, setLanguage] = useState("fr");
  const [selected, setSelected] = useState("profile");
  const [prenom, setPrenom] = useState(user.prenom);
  const [nom, setNom] = useState(user.nom);
  const [email, setEmail] = useState(user.email);
  const [telephone, setTelephone] = useState(user.telephone || "");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [profileImage, setProfileImage] = useState(user.image || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { theme, toggleTheme, setTheme } = useTheme();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    const result = await updateUtilisateurAction(user.id, {
      nom,
      prenom,
      email,
      telephone,
      ...(motDePasse && { motDePasse }),
      ...(profileImage && { image: profileImage }),
    });

    setLoading(false);

    if (result.success) {
      setSuccessMessage("✅ Profil modifié avec succès !");
      setEditMode(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(result.error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const result = await uploadProfileImage(formData);
      if (result.success && result.url) {
        setProfileImage(result.url);
        setSuccessMessage("✅ Image de profil mise à jour !");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        alert(result.error || "Erreur lors du téléchargement");
        setImagePreview(user.image || null);
      }
    } catch (error) {
      alert("Erreur lors du téléchargement de l'image");
      setImagePreview(user.image || null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSuccessMessage("✅ Image de profil supprimée");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const settingsCards = [
    {
      id: "profile",
      icon: User,
      title: "Profil",
      description: "Gérez vos informations personnelles",
      color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "theme",
      icon: Palette,
      title: "Apparence",
      description: "Thème clair ou sombre",
      color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
    {
      id: "language",
      icon: Globe,
      title: "Langue",
      description: "Préférences linguistiques",
      color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      id: "notifications",
      icon: Bell,
      title: "Notifications",
      description: "Gérez vos alertes",
      color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
    {
      id: "security",
      icon: Shield,
      title: "Sécurité",
      description: "Paramètres de sécurité",
      color: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
  ];

  const infoCards = [
    { 
      icon: Mail, 
      label: "Email", 
      value: user.email, 
      color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" 
    },
    { 
      icon: Phone, 
      label: "Téléphone", 
      value: user.telephone || "-", 
      color: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" 
    },
    { 
      icon: Shield, 
      label: "Rôle", 
      value: user.role, 
      color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" 
    },
    { 
      icon: Award, 
      label: "Statut", 
      value: "Actif", 
      color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" 
    },
  ];

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0d1a15]' : 'bg-[#F8F6F3]'}`}>
      <Sidebar connectedUser={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className={`text-4xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
              <Settings className={`w-8 h-8 ${theme === 'dark' ? 'text-emerald-400' : 'text-[#3C6C5F]'}`} />
              Paramètres
            </h1>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
              Gérez les préférences de votre compte
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all ${theme === 'dark' ? 'bg-[#1a2e28] hover:bg-[#2a3f38]' : 'bg-[#FFF3DA] hover:bg-[#FFC490]/30'}`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-[#3C6C5F]" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>
            <div className={`px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-[#1a2e28] text-emerald-400' : 'bg-[#FFF3DA] text-[#3C6C5F]'}`}>
              <span className="text-sm font-medium">
                {user.role || "Utilisateur"}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {settingsCards.map((card) => {
            const Icon = card.icon;
            const isActive = selected === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setSelected(card.id)}
                className={`
                  relative group p-6 rounded-2xl transition-all duration-300 text-left border-2
                  ${isActive 
                    ? 'bg-[#3C6C5F] border-[#3C6C5F] shadow-xl shadow-[#3C6C5F]/20 scale-[1.02]' 
                    : theme === 'dark' 
                      ? 'bg-[#1a2e28] border-[#2a3f38] hover:border-[#3C6C5F] hover:shadow-lg hover:scale-[1.02]'
                      : 'bg-white border-[#E8E3DC] hover:border-[#3C6C5F] hover:shadow-lg hover:scale-[1.02]'
                  }
                `}
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all
                  ${isActive ? 'bg-white/20' : card.color}
                `}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} />
                </div>
                <h3 className={`font-bold text-sm ${isActive ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                  {card.title}
                </h3>
                <p className={`text-xs mt-1 ${isActive ? 'text-white/70' : theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                  {card.description}
                </p>
                {isActive && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Sections */}
        <div className="mt-8">
          {/* Profile Section */}
          {selected === "profile" && (
            <div className={`rounded-3xl shadow-xl shadow-[#3C6C5F]/5 border overflow-hidden ${
              theme === 'dark' ? 'bg-[#1a2e28] border-[#2a3f38]' : 'bg-white border-[#E8E3DC]'
            }`}>
              <div className="bg-gradient-to-r from-[#29453E] to-[#3C6C5F] p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-4 border-white/30 overflow-hidden">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.prenom?.[0]?.toUpperCase() || "U"
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                      >
                        <Camera className="w-4 h-4 text-[#3C6C5F]" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {imagePreview && (
                        <button
                          onClick={handleRemoveImage}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-white">
                      <h2 className="text-3xl font-bold">
                        {user.prenom} {user.nom}
                      </h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                          {user.role}
                        </span>
                        <span className="bg-emerald-400/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          En ligne
                        </span>
                      </div>
                      {uploadingImage && (
                        <p className="text-xs text-white/80 mt-1">
                          Téléchargement en cours...
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                    {editMode ? "Annuler" : "Modifier le profil"}
                  </button>
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {infoCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <div key={index} className={`${card.color} rounded-2xl p-5 transition-all hover:scale-[1.02] border`}>
                      <Icon className={`w-5 h-5 mb-2 ${theme === 'dark' ? 'text-white/80' : ''}`} />
                      <p className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                        {card.label}
                      </p>
                      <p className={`font-semibold mt-1 ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                        {card.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Edit Form */}
              {editMode && (
                <div className="px-8 pb-8">
                  <div className={`border-t pt-8 ${theme === 'dark' ? 'border-[#2a3f38]' : 'border-[#E8E3DC]'}`}>
                    <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                      Modifier mes informations
                    </h3>
                    <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-[#29453E]'}`}>
                            Prénom
                          </label>
                          <input
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                              theme === 'dark' 
                                ? 'border-[#2a3f38] bg-[#0d1a15] text-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/20' 
                                : 'border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/20'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-[#29453E]'}`}>
                            Nom
                          </label>
                          <input
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                              theme === 'dark' 
                                ? 'border-[#2a3f38] bg-[#0d1a15] text-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/20' 
                                : 'border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/20'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-[#29453E]'}`}>
                            Email
                          </label>
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                              theme === 'dark' 
                                ? 'border-[#2a3f38] bg-[#0d1a15] text-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/20' 
                                : 'border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/20'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-[#29453E]'}`}>
                            Téléphone
                          </label>
                          <input
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                              theme === 'dark' 
                                ? 'border-[#2a3f38] bg-[#0d1a15] text-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/20' 
                                : 'border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/20'
                            }`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-[#29453E]'}`}>
                            Nouveau mot de passe
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={motDePasse}
                              onChange={(e) => setMotDePasse(e.target.value)}
                              placeholder="••••••••"
                              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all pr-12 ${
                                theme === 'dark' 
                                  ? 'border-[#2a3f38] bg-[#0d1a15] text-white focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/20' 
                                  : 'border-[#E8E3DC] bg-[#FAFAFA] text-[#29453E] focus:border-[#3C6C5F] focus:ring-2 focus:ring-[#3C6C5F]/20'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-[#3C6C5F]/60 hover:text-[#3C6C5F]'
                              }`}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center gap-2 bg-[#3C6C5F] hover:bg-[#29453E] text-white px-8 py-3 rounded-xl transition-all shadow-lg shadow-[#3C6C5F]/20 disabled:opacity-50"
                        >
                          <Save className="w-5 h-5" />
                          {loading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className={`px-6 py-3 rounded-xl border-2 transition-all ${
                            theme === 'dark' 
                              ? 'border-[#2a3f38] text-gray-300 hover:border-[#3C6C5F] hover:text-white' 
                              : 'border-[#E8E3DC] text-[#29453E] hover:border-[#3C6C5F]'
                          }`}
                        >
                          Annuler
                        </button>
                      </div>
                      {successMessage && (
                        <div className={`px-4 py-3 rounded-xl border flex items-center gap-2 ${
                          theme === 'dark' 
                            ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' 
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          <Check className="w-5 h-5" />
                          {successMessage}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Section */}
          {selected === "theme" && (
            <div className={`rounded-3xl shadow-xl shadow-[#3C6C5F]/5 border p-8 ${
              theme === 'dark' ? 'bg-[#1a2e28] border-[#2a3f38]' : 'bg-white border-[#E8E3DC]'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                    Apparence
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}>
                    Choisissez votre thème préféré
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => setTheme("light")}
                  className={`
                    p-8 rounded-2xl border-2 transition-all text-center
                    ${theme === "light" 
                      ? 'border-[#3C6C5F] bg-[#FFF3DA] shadow-lg' 
                      : 'border-[#2a3f38] hover:border-[#3C6C5F]'
                    }
                  `}
                >
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto flex items-center justify-center text-3xl">
                    ☀️
                  </div>
                  <h3 className={`font-bold mt-4 ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                    Mode Clair
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                    Thème lumineux
                  </p>
                  {theme === "light" && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-[#3C6C5F] text-white px-3 py-1 rounded-full text-xs">
                      <Check className="w-3 h-3" /> Actif
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`
                    p-8 rounded-2xl border-2 transition-all text-center
                    ${theme === "dark" 
                      ? 'border-[#3C6C5F] bg-[#29453E] shadow-lg' 
                      : 'border-[#E8E3DC] hover:border-[#3C6C5F]'
                    }
                  `}
                >
                  <div className="w-16 h-16 rounded-full bg-purple-900/20 dark:bg-purple-500/20 mx-auto flex items-center justify-center text-3xl">
                    🌙
                  </div>
                  <h3 className={`font-bold mt-4 ${theme === "dark" ? 'text-white' : 'text-[#29453E]'}`}>
                    Mode Sombre
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                    Thème nocturne
                  </p>
                  {theme === "dark" && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-[#3C6C5F] text-white px-3 py-1 rounded-full text-xs">
                      <Check className="w-3 h-3" /> Actif
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Language Section */}
          {selected === "language" && (
            <div className={`rounded-3xl shadow-xl shadow-[#3C6C5F]/5 border p-8 ${
              theme === 'dark' ? 'bg-[#1a2e28] border-[#2a3f38]' : 'bg-white border-[#E8E3DC]'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                    Langue
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}>
                    Choisissez votre langue préférée
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { code: "fr", label: "Français", flag: "🇫🇷" },
                  { code: "en", label: "English", flag: "🇬🇧" },
                  { code: "ar", label: "العربية", flag: "🇲🇦" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`
                      p-6 rounded-2xl border-2 transition-all text-center
                      ${language === lang.code 
                        ? 'border-[#3C6C5F] bg-[#FFF3DA] dark:bg-[#2a3f38] shadow-lg' 
                        : theme === 'dark' 
                          ? 'border-[#2a3f38] hover:border-[#3C6C5F]' 
                          : 'border-[#E8E3DC] hover:border-[#3C6C5F]'
                      }
                    `}
                  >
                    <div className="text-4xl mb-3">{lang.flag}</div>
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                      {lang.label}
                    </h3>
                    {language === lang.code && (
                      <div className="mt-3 inline-flex items-center gap-1 bg-[#3C6C5F] text-white px-3 py-1 rounded-full text-xs">
                        <Check className="w-3 h-3" /> Sélectionné
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {selected === "notifications" && (
            <div className={`rounded-3xl shadow-xl shadow-[#3C6C5F]/5 border p-8 ${
              theme === 'dark' ? 'bg-[#1a2e28] border-[#2a3f38]' : 'bg-white border-[#E8E3DC]'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                    Notifications
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}>
                    Gérez vos alertes
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Notifications par email", description: "Recevez des notifications par email", enabled: true },
                  { title: "Notifications push", description: "Recevez des notifications push", enabled: false },
                  { title: "Alertes de sécurité", description: "Notifications de sécurité importantes", enabled: true },
                  { title: "Rapports hebdomadaires", description: "Récapitulatif hebdomadaire", enabled: false },
                ].map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'border-[#2a3f38] hover:border-[#3C6C5F]' 
                      : 'border-[#E8E3DC] hover:border-[#3C6C5F]'
                  }`}>
                    <div>
                      <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                        {item.description}
                      </p>
                    </div>
                    <div className={`
                      w-12 h-6 rounded-full p-1 cursor-pointer transition-all
                      ${item.enabled ? 'bg-[#3C6C5F]' : 'bg-gray-300 dark:bg-gray-600'}
                    `}>
                      <div className={`
                        w-4 h-4 rounded-full bg-white transition-all
                        ${item.enabled ? 'translate-x-6' : ''}
                      `} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Section */}
          {selected === "security" && (
            <div className={`rounded-3xl shadow-xl shadow-[#3C6C5F]/5 border p-8 ${
              theme === 'dark' ? 'bg-[#1a2e28] border-[#2a3f38]' : 'bg-white border-[#E8E3DC]'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                    Sécurité
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}>
                    Paramètres de sécurité du compte
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  theme === 'dark' 
                    ? 'bg-red-900/20 border-red-800' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                        Authentification à deux facteurs
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-red-400/70' : 'text-red-600/70'}`}>
                        Ajoutez une couche de sécurité supplémentaire
                      </p>
                    </div>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
                      Activer
                    </button>
                  </div>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  theme === 'dark' 
                    ? 'border-[#2a3f38] hover:border-[#3C6C5F]' 
                    : 'border-[#E8E3DC] hover:border-[#3C6C5F]'
                }`}>
                  <div>
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                      Sessions actives
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                      Gérez vos sessions
                    </p>
                  </div>
                  <button className={`font-medium ${theme === 'dark' ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#3C6C5F] hover:text-[#29453E]'}`}>
                    Voir tout
                  </button>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  theme === 'dark' 
                    ? 'border-[#2a3f38] hover:border-[#3C6C5F]' 
                    : 'border-[#E8E3DC] hover:border-[#3C6C5F]'
                }`}>
                  <div>
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                      Changer le mot de passe
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                      Modifiez votre mot de passe
                    </p>
                  </div>
                  <button className="bg-[#3C6C5F] text-white px-4 py-2 rounded-lg hover:bg-[#29453E] transition-all">
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}