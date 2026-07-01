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
    { icon: Mail, label: "Email", value: user.email, color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    { icon: Phone, label: "Téléphone", value: user.telephone || "-", color: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
    { icon: Shield, label: "Rôle", value: user.role, color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
    { icon: Award, label: "Statut", value: "Actif", color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="min-h-screen flex bg-primary">
      <Sidebar connectedUser={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-primary flex items-center gap-3">
              <Settings className="w-8 h-8 text-secondary" />
              Paramètres
            </h1>
            <p className="text-muted mt-1">
              Gérez les préférences de votre compte
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="bg-secondary/10 p-3 rounded-full hover:bg-secondary/20 transition-all"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-secondary" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>
            <div className="bg-secondary/10 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-secondary">
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
                  relative group p-6 rounded-2xl transition-all duration-300 text-left
                  ${isActive 
                    ? 'bg-secondary text-white shadow-xl shadow-secondary/20 scale-[1.02]' 
                    : 'bg-card hover:shadow-lg hover:scale-[1.02] border-2 border-transparent hover:border-secondary/20'
                  }
                `}
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all
                  ${isActive ? 'bg-white/20' : card.color}
                `}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : card.color.split(' ')[1]}`} />
                </div>
                <h3 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-primary'}`}>
                  {card.title}
                </h3>
                <p className={`text-xs mt-1 ${isActive ? 'text-white/70' : 'text-muted'}`}>
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
            <div className="bg-card rounded-3xl shadow-xl shadow-secondary/5 border border-theme overflow-hidden">
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
                        <Camera className="w-4 h-4 text-secondary" />
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
                      <div className="flex items-center gap-2 mt-1">
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
                    <div key={index} className={`${card.color} rounded-2xl p-5 transition-all hover:scale-[1.02]`}>
                      <Icon className="w-5 h-5 text-secondary mb-2" />
                      <p className="text-xs text-muted uppercase tracking-wider">{card.label}</p>
                      <p className="font-semibold text-primary mt-1">{card.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Edit Form */}
              {editMode && (
                <div className="px-8 pb-8">
                  <div className="border-t border-theme pt-8">
                    <h3 className="text-xl font-bold text-primary mb-6">
                      Modifier mes informations
                    </h3>
                    <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Prénom
                          </label>
                          <input
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-theme bg-input focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Nom
                          </label>
                          <input
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-theme bg-input focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Email
                          </label>
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-theme bg-input focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Téléphone
                          </label>
                          <input
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-theme bg-input focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-primary"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-primary mb-2">
                            Nouveau mot de passe
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={motDePasse}
                              onChange={(e) => setMotDePasse(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-4 py-3 rounded-xl border-2 border-theme bg-input focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-primary pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
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
                          className="flex items-center gap-2 bg-secondary hover:bg-[#29453E] text-white px-8 py-3 rounded-xl transition-all shadow-lg shadow-secondary/20 disabled:opacity-50"
                        >
                          <Save className="w-5 h-5" />
                          {loading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="px-6 py-3 rounded-xl border-2 border-theme hover:border-secondary transition-all text-primary"
                        >
                          Annuler
                        </button>
                      </div>
                      {successMessage && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
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
            <div className="bg-card rounded-3xl shadow-xl shadow-secondary/5 border border-theme p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">Apparence</h2>
                  <p className="text-muted">Choisissez votre thème préféré</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => setTheme("light")}
                  className={`
                    p-8 rounded-2xl border-2 transition-all text-center
                    ${theme === "light" 
                      ? 'border-secondary bg-[#FFF3DA] dark:bg-[#2d3748] shadow-lg' 
                      : 'border-theme hover:border-secondary'
                    }
                  `}
                >
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto flex items-center justify-center text-3xl">
                    ☀️
                  </div>
                  <h3 className="font-bold mt-4 text-primary">Mode Clair</h3>
                  <p className="text-sm text-muted">Thème lumineux</p>
                  {theme === "light" && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-secondary text-white px-3 py-1 rounded-full text-xs">
                      <Check className="w-3 h-3" /> Actif
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`
                    p-8 rounded-2xl border-2 transition-all text-center
                    ${theme === "dark" 
                      ? 'border-secondary bg-[#29453E] shadow-lg' 
                      : 'border-theme hover:border-secondary'
                    }
                  `}
                >
                  <div className="w-16 h-16 rounded-full bg-purple-900/20 dark:bg-purple-500/20 mx-auto flex items-center justify-center text-3xl">
                    🌙
                  </div>
                  <h3 className={`font-bold mt-4 ${theme === "dark" ? 'text-white' : 'text-primary'}`}>
                    Mode Sombre
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? 'text-white/60' : 'text-muted'}`}>
                    Thème nocturne
                  </p>
                  {theme === "dark" && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-secondary text-white px-3 py-1 rounded-full text-xs">
                      <Check className="w-3 h-3" /> Actif
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Language Section */}
          {selected === "language" && (
            <div className="bg-card rounded-3xl shadow-xl shadow-secondary/5 border border-theme p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">Langue</h2>
                  <p className="text-muted">Choisissez votre langue préférée</p>
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
                        ? 'border-secondary bg-[#FFF3DA] dark:bg-[#2d3748] shadow-lg' 
                        : 'border-theme hover:border-secondary'
                      }
                    `}
                  >
                    <div className="text-4xl mb-3">{lang.flag}</div>
                    <h3 className="font-bold text-primary">{lang.label}</h3>
                    {language === lang.code && (
                      <div className="mt-3 inline-flex items-center gap-1 bg-secondary text-white px-3 py-1 rounded-full text-xs">
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
            <div className="bg-card rounded-3xl shadow-xl shadow-secondary/5 border border-theme p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">Notifications</h2>
                  <p className="text-muted">Gérez vos alertes</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Notifications par email", description: "Recevez des notifications par email", enabled: true },
                  { title: "Notifications push", description: "Recevez des notifications push", enabled: false },
                  { title: "Alertes de sécurité", description: "Notifications de sécurité importantes", enabled: true },
                  { title: "Rapports hebdomadaires", description: "Récapitulatif hebdomadaire", enabled: false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-theme hover:border-secondary transition-all">
                    <div>
                      <h4 className="font-semibold text-primary">{item.title}</h4>
                      <p className="text-sm text-muted">{item.description}</p>
                    </div>
                    <div className={`
                      w-12 h-6 rounded-full p-1 cursor-pointer transition-all
                      ${item.enabled ? 'bg-secondary' : 'bg-gray-300 dark:bg-gray-600'}
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
            <div className="bg-card rounded-3xl shadow-xl shadow-secondary/5 border border-theme p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">Sécurité</h2>
                  <p className="text-muted">Paramètres de sécurité du compte</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-red-700 dark:text-red-400">Authentification à deux facteurs</h4>
                      <p className="text-sm text-red-600/70 dark:text-red-400/70">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
                      Activer
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-theme hover:border-secondary transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-primary">Sessions actives</h4>
                      <p className="text-sm text-muted">Gérez vos sessions</p>
                    </div>
                    <button className="text-secondary hover:text-primary font-medium">
                      Voir tout
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-theme hover:border-secondary transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-primary">Changer le mot de passe</h4>
                      <p className="text-sm text-muted">Modifiez votre mot de passe</p>
                    </div>
                    <button className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-[#29453E] transition-all">
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}