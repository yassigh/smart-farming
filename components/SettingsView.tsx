// components/SettingsView.tsx - VERSION CORRIGÉE
"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
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
import { useTranslation } from "@/contexts/TranslationContext";

//  TEXTES DE LA PAGE - DÉPLACÉS HORS DU COMPOSANT
const PAGE_TEXTS = {
  // Header
  settings_title: "Paramètres",
  settings_subtitle: "Gérez les préférences de votre compte",
  
  // Profile
  profile: "Profil",
  profile_desc: "Gérez vos informations personnelles",
  profile_title: "Profil",
  profile_info: "Informations personnelles",
  profile_edit: "Modifier le profil",
  profile_cancel: "Annuler",
  profile_save: "Enregistrer",
  profile_saving: "Enregistrement...",
  profile_success: "Profil modifié avec succès !",
  profile_image_updated: "Image de profil mise à jour !",
  profile_image_removed: "Image de profil supprimée",
  profile_online: "En ligne",
  profile_uploading: "Téléchargement en cours...",
  profile_first_name: "Prénom",
  profile_last_name: "Nom",
  profile_email: "Email",
  profile_phone: "Téléphone",
  profile_new_password: "Nouveau mot de passe",
  profile_password_placeholder: "••••••••",
  profile_role: "Rôle",
  profile_status: "Statut",
  profile_active: "Actif",
  
  // Theme
  appearance: "Apparence",
  appearance_desc: "Choisissez votre thème préféré",
  appearance_light: "Mode Clair",
  appearance_light_desc: "Thème lumineux",
  appearance_dark: "Mode Sombre",
  appearance_dark_desc: "Thème nocturne",
  appearance_active: "Actif",
  
  // Language
  language_title: "Langue",
  language_desc: "Choisissez votre langue préférée",
  language_selected: "Sélectionné",
  language_fr: "Français",
  language_en: "English",
  language_ar: "العربية",
  
  // Notifications
  notifications: "Notifications",
  notifications_desc: "Gérez vos alertes",
  notifications_email: "Notifications par email",
  notifications_email_desc: "Recevez des notifications par email",
  notifications_push: "Notifications push",
  notifications_push_desc: "Recevez des notifications push",
  notifications_security: "Alertes de sécurité",
  notifications_security_desc: "Notifications de sécurité importantes",
  notifications_weekly: "Rapports hebdomadaires",
  notifications_weekly_desc: "Récapitulatif hebdomadaire",
  
  // Security
  security: "Sécurité",
  security_desc: "Paramètres de sécurité du compte",
  security_2fa: "Authentification à deux facteurs",
  security_2fa_desc: "Ajoutez une couche de sécurité supplémentaire",
  security_2fa_activate: "Activer",
  security_sessions: "Sessions actives",
  security_sessions_desc: "Gérez vos sessions",
  security_sessions_view: "Voir tout",
  security_password: "Changer le mot de passe",
  security_password_desc: "Modifiez votre mot de passe",
  security_password_change: "Modifier",
  
  // Cards
  card_profile: "Profil",
  card_theme: "Apparence",
  card_language: "Langue",
  card_notifications: "Notifications",
  card_security: "Sécurité",
  
  // Info cards
  info_email: "Email",
  info_phone: "Téléphone",
  info_role: "Rôle",
  info_status: "Statut",
  info_active: "Actif",
  
  // Errors
  error_upload: "Erreur lors du téléchargement",
  error_image_upload: "Erreur lors du téléchargement de l'image",
  
  // User role
  user_role: "Utilisateur",
};

export default function SettingsView({ user }: any) {
  //  AJOUT DE setLanguage DANS LA DESTRUCTURATION
  const { language, setLanguage, t, translateAllTexts, isTranslating } = useTranslation();
  const { theme, toggleTheme, setTheme } = useTheme();

  //  EFFET DE TRADUCTION - avec cleanup
  useEffect(() => {
    let isMounted = true;
    const doTranslation = async () => {
      if (isMounted) {
        await translateAllTexts(PAGE_TEXTS, language === "fr" ? "fr" : language);
      }
    };
    doTranslation();
    return () => { isMounted = false; };
  }, [language, translateAllTexts]);

  //  STATES
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

  //  Fonction t mémorisée
  const _t = useCallback((key: string) => t(key, PAGE_TEXTS), [t]);

  //  HANDLERS
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
      setSuccessMessage(_t('profile_success'));
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
        setSuccessMessage(_t('profile_image_updated'));
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        alert(result.error || _t('error_upload'));
        setImagePreview(user.image || null);
      }
    } catch (error) {
      alert(_t('error_image_upload'));
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
    setSuccessMessage(_t('profile_image_removed'));
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  //  SETTINGS CARDS
  const settingsCards = [
    {
      id: "profile",
      icon: User,
      title: _t('card_profile'),
      description: _t('profile_desc'),
      color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "theme",
      icon: Palette,
      title: _t('card_theme'),
      description: _t('appearance_desc'),
      color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
    {
      id: "language",
      icon: Globe,
      title: _t('card_language'),
      description: _t('language_desc'),
      color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      id: "notifications",
      icon: Bell,
      title: _t('card_notifications'),
      description: _t('notifications_desc'),
      color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
    {
      id: "security",
      icon: Shield,
      title: _t('card_security'),
      description: _t('security_desc'),
      color: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
  ];

  //  INFO CARDS
  const infoCards = [
    { 
      icon: Mail, 
      label: _t('info_email'), 
      value: user.email, 
      color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" 
    },
    { 
      icon: Phone, 
      label: _t('info_phone'), 
      value: user.telephone || "-", 
      color: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" 
    },
    { 
      icon: Shield, 
      label: _t('info_role'), 
      value: user.role, 
      color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" 
    },
    { 
      icon: Award, 
      label: _t('info_status'), 
      value: _t('info_active'), 
      color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" 
    },
  ];

  //  NOTIFICATIONS
  const notificationItems = [
    { 
      title: _t('notifications_email'), 
      description: _t('notifications_email_desc'), 
      enabled: true 
    },
    { 
      title: _t('notifications_push'), 
      description: _t('notifications_push_desc'), 
      enabled: false 
    },
    { 
      title: _t('notifications_security'), 
      description: _t('notifications_security_desc'), 
      enabled: true 
    },
    { 
      title: _t('notifications_weekly'), 
      description: _t('notifications_weekly_desc'), 
      enabled: false 
    },
  ];

  //  LANGUES DISPONIBLES
  const availableLanguages = [
    { code: "fr", label: _t('language_fr'), flag: "🇫🇷" },
    { code: "en", label: _t('language_en'), flag: "🇬🇧" },
    { code: "ar", label: _t('language_ar'), flag: "🇲🇦" },
  ];

  // Affichage du loader pendant la traduction
  if (isTranslating) {
    return (
      <div className="min-h-screen flex bg-[#0d1a15]">
        <Sidebar connectedUser={user} />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9DAE7A]"></div>
        </main>
      </div>
    );
  }

  //  RENDU PRINCIPAL
  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0d1a15]' : 'bg-[#F8F6F3]'}`}>
      <Sidebar connectedUser={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className={`text-4xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
              <Settings className={`w-8 h-8 ${theme === 'dark' ? 'text-emerald-400' : 'text-[#3C6C5F]'}`} />
              {_t('settings_title')}
            </h1>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
              {_t('settings_subtitle')}
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
                {user.role || _t('user_role')}
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
                          {_t('profile_online')}
                        </span>
                      </div>
                      {uploadingImage && (
                        <p className="text-xs text-white/80 mt-1">
                          {_t('profile_uploading')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                    {editMode ? _t('profile_cancel') : _t('profile_edit')}
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
                      {_t('profile_info')}
                    </h3>
                    <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-[#29453E]'}`}>
                            {_t('profile_first_name')}
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
                            {_t('profile_last_name')}
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
                            {_t('profile_email')}
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
                            {_t('profile_phone')}
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
                            {_t('profile_new_password')}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={motDePasse}
                              onChange={(e) => setMotDePasse(e.target.value)}
                              placeholder={_t('profile_password_placeholder')}
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
                          {loading ? _t('profile_saving') : _t('profile_save')}
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
                          {_t('profile_cancel')}
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
                    {_t('appearance')}
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}>
                    {_t('appearance_desc')}
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
                    {_t('appearance_light')}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                    {_t('appearance_light_desc')}
                  </p>
                  {theme === "light" && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-[#3C6C5F] text-white px-3 py-1 rounded-full text-xs">
                      <Check className="w-3 h-3" /> {_t('appearance_active')}
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
                    {_t('appearance_dark')}
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                    {_t('appearance_dark_desc')}
                  </p>
                  {theme === "dark" && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-[#3C6C5F] text-white px-3 py-1 rounded-full text-xs">
                      <Check className="w-3 h-3" /> {_t('appearance_active')}
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
                    {_t('language_title')}
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}>
                    {_t('language_desc')}
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {availableLanguages.map((lang) => (
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
                        <Check className="w-3 h-3" /> {_t('language_selected')}
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
                    {_t('notifications')}
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}>
                    {_t('notifications_desc')}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {notificationItems.map((item, index) => (
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
                    {_t('security')}
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}>
                    {_t('security_desc')}
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
                        {_t('security_2fa')}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-red-400/70' : 'text-red-600/70'}`}>
                        {_t('security_2fa_desc')}
                      </p>
                    </div>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
                      {_t('security_2fa_activate')}
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
                      {_t('security_sessions')}
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                      {_t('security_sessions_desc')}
                    </p>
                  </div>
                  <button className={`font-medium ${theme === 'dark' ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#3C6C5F] hover:text-[#29453E]'}`}>
                    {_t('security_sessions_view')}
                  </button>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  theme === 'dark' 
                    ? 'border-[#2a3f38] hover:border-[#3C6C5F]' 
                    : 'border-[#E8E3DC] hover:border-[#3C6C5F]'
                }`}>
                  <div>
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#29453E]'}`}>
                      {_t('security_password')}
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-[#3C6C5F]/60'}`}>
                      {_t('security_password_desc')}
                    </p>
                  </div>
                  <button className="bg-[#3C6C5F] text-white px-4 py-2 rounded-lg hover:bg-[#29453E] transition-all">
                    {_t('security_password_change')}
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