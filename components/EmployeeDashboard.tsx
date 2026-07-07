// components/EmployeeDashboard.tsx
"use client";

import { useState } from "react";
import {
  MapPin, PawPrint, Wheat, Building2, Phone, Mail,
  MessageCircle, User, Briefcase, AlertTriangle, Clock, Sprout,
} from "lucide-react";
import { MessagerieModal } from "./MessagerieModal";

interface EmployeDashboardProps {
  employeInfo: any;
  currentUser: any;
}

export default function EmployeeDashboard({ employeInfo, currentUser }: EmployeDashboardProps) {
  const [showMessaging, setShowMessaging] = useState(false);

  if (!employeInfo) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "50vh", gap: 16, textAlign: "center", padding: 24
      }}>
        <div style={{
          padding: 24, borderRadius: 20,
          background: "#fffbeb", border: "1px solid #fde68a"
        }}>
          <AlertTriangle style={{ width: 48, height: 48, color: "#d97706", margin: "0 auto 12px" }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
            Aucune ferme assignée
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Votre compte n'est pas encore rattaché à une ferme.<br />
            Contactez votre administrateur.
          </p>
        </div>
      </div>
    );
  }

  const agriculteur = employeInfo.ferme?.agriculteur;
  const terrain = employeInfo.terrainAssigne;
  const animaux = employeInfo.animauxAssignes ?? [];
  const cultures = employeInfo.culturesAssignees ?? [];

  const getEtatStyle = (etat: string) => {
    const lower = etat?.toLowerCase() ?? "";
    if (lower.includes("bon") || lower.includes("sain"))
      return { background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" };
    if (lower.includes("mal") || lower.includes("bless"))
      return { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" };
    if (lower.includes("trait"))
      return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" };
    return { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" };
  };

  const getCultureEtatStyle = (etat: string) => {
    const lower = etat?.toLowerCase() ?? "";
    if (lower.includes("bon") || lower.includes("récolte") || lower.includes("matur"))
      return { background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" };
    if (lower.includes("plant"))
      return { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" };
    if (lower.includes("prob") || lower.includes("mal"))
      return { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" };
    return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" };
  };

  /* Couleurs des stats rapides */
  const statCards = [
    { label: "Terrain", value: terrain ? "1" : "0", icon: MapPin, accent: "#16a34a", bg: "#f0fdf4" },
    { label: "Animaux", value: String(animaux.length), icon: PawPrint, accent: "#2563eb", bg: "#eff6ff" },
    { label: "Cultures", value: String(cultures.length), icon: Wheat, accent: "#d97706", bg: "#fffbeb" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Bannière de bienvenue ─────────────────────── */}
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: 24,
        background: "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)",
        padding: "28px 28px 24px", color: "white",
        boxShadow: "0 8px 32px rgba(22,163,74,0.25)"
      }}>
        {/* Cercles décoratifs */}
        <div style={{
          position: "absolute", top: -40, right: -40, width: 160, height: 160,
          borderRadius: "50%", background: "rgba(255,255,255,0.06)"
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: -20, width: 120, height: 120,
          borderRadius: "50%", background: "rgba(255,255,255,0.05)"
        }} />

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
              Tableau de bord employé
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Bonjour, {currentUser.prenom} 👋
            </h1>
            <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 6px" }}>
              {employeInfo.roleDescription || employeInfo.poste} · {employeInfo.ferme?.nom}
            </p>
            {employeInfo.dateEmbauche && (
              <p style={{ fontSize: 11, opacity: 0.55, display: "flex", alignItems: "center", gap: 5, margin: 0 }}>
                <Clock size={12} />
                Employé depuis le {new Date(employeInfo.dateEmbauche).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>

          <div style={{
            padding: "8px 16px", borderRadius: 9999,
            background: terrain ? "rgba(255,255,255,0.15)" : "rgba(251,191,36,0.25)",
            border: terrain ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(251,191,36,0.4)",
            fontSize: 12, fontWeight: 700, backdropFilter: "blur(4px)"
          }}>
            {terrain ? "✅ Terrain assigné" : "⚠️ Pas de terrain"}
          </div>
        </div>

        {/* Stats rapides dans la bannière */}
        <div style={{ position: "relative", marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {statCards.map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
              borderRadius: 14, padding: "14px 12px", border: "1px solid rgba(255,255,255,0.15)",
              textAlign: "center"
            }}>
              <s.icon style={{ width: 22, height: 22, margin: "0 auto 6px", opacity: 0.9 }} />
              <p style={{ fontSize: 26, fontWeight: 800, margin: "0 0 2px", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, opacity: 0.65, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Corps principal ──────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>

        {/* Row 1 : Terrain + Contact agriculteur */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }} className="responsive-grid-cols">

          {/* Terrain assigné */}
          {terrain ? (
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border-color)",
              borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-sm)"
            }}>
              <div style={{
                padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "linear-gradient(to right, #f0fdf4, #dcfce7)",
                borderBottom: "1px solid #bbf7d0"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <MapPin size={17} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Mon Terrain</p>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{terrain.nom}</h2>
                  </div>
                </div>
                <span className="sf-badge sf-badge-green">📍 MON TERRAIN</span>
              </div>

              <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 14, border: "1px solid #bbf7d0" }}>
                  <p style={{ fontSize: 11, color: "#15803d", fontWeight: 600, margin: "0 0 4px" }}>Superficie</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{terrain.superficie} ha</p>
                </div>
                <div style={{ background: "#fefce8", borderRadius: 12, padding: 14, border: "1px solid #fde68a" }}>
                  <p style={{ fontSize: 11, color: "#a16207", fontWeight: 600, margin: "0 0 4px" }}>Type de sol</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{terrain.typeSol}</p>
                </div>
                {terrain.localisation && (
                  <div style={{ gridColumn: "1/-1", background: "var(--bg-card-alt)", borderRadius: 12, padding: 14, border: "1px solid var(--border-color)" }}>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, margin: "0 0 4px" }}>Localisation</p>
                    <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>{terrain.localisation}</p>
                  </div>
                )}
                <div style={{ gridColumn: "1/-1", display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <PawPrint size={14} /> {terrain.animaux?.length ?? 0} animaux
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Sprout size={14} /> {terrain.cultures?.length ?? 0} cultures
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: "var(--bg-card)", border: "2px dashed var(--border-hover)",
              borderRadius: 20, padding: 48, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center",
              boxShadow: "var(--shadow-xs)"
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <MapPin size={28} style={{ color: "var(--text-subtle)" }} />
              </div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
                Aucun terrain assigné pour l'instant.<br />
                Votre agriculteur vous assignera un terrain bientôt.
              </p>
            </div>
          )}

          {/* Contact agriculteur */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-color)",
            borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{
              padding: "14px 20px", borderBottom: "1px solid var(--border-color)",
              background: "var(--bg-section)", display: "flex", alignItems: "center", gap: 8
            }}>
              <User size={16} style={{ color: "var(--accent)" }} />
              <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14, margin: 0 }}>Mon Agriculteur</h3>
            </div>

            <div style={{ padding: 20 }}>
              {agriculteur ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, overflow: "hidden", flexShrink: 0,
                      background: "linear-gradient(135deg,#22c55e,#16a34a)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 800, fontSize: 16
                    }}>
                      {agriculteur.image
                        ? <img src={agriculteur.image} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : `${agriculteur.prenom?.[0]}${agriculteur.nom?.[0]}`}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px", fontSize: 15 }}>
                        {agriculteur.prenom} {agriculteur.nom}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Agriculteur</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                      <Mail size={13} style={{ flexShrink: 0, color: "var(--text-subtle)" }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agriculteur.email}</span>
                    </div>
                    {agriculteur.telephone && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                        <Phone size={13} style={{ flexShrink: 0, color: "var(--text-subtle)" }} />
                        <span>{agriculteur.telephone}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                      <Building2 size={13} style={{ flexShrink: 0, color: "var(--text-subtle)" }} />
                      <span>{employeInfo.ferme?.nom}</span>
                    </div>
                  </div>

                  <button onClick={() => setShowMessaging(true)} className="sf-btn-primary" style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 8, padding: "11px 0", fontSize: 14, cursor: "pointer"
                  }}>
                    <MessageCircle size={16} /> Contacter
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-subtle)", textAlign: "center" }}>Agriculteur non trouvé</p>
              )}
            </div>

            {(employeInfo.roleDescription || employeInfo.poste) && (
              <div style={{ margin: "0 20px 20px", padding: 14, background: "#fffbeb", borderRadius: 12, border: "1px solid #fde68a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <Briefcase size={12} style={{ color: "#d97706" }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#92400e", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rôle assigné</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                  {employeInfo.roleDescription || employeInfo.poste}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Animaux assignés ─────────────────────── */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid var(--border-color)",
            display: "flex", alignItems: "center", gap: 10, background: "var(--bg-section)"
          }}>
            <div style={{ padding: 8, background: "#dcfce7", borderRadius: 10 }}>
              <PawPrint size={16} style={{ color: "#15803d" }} />
            </div>
            <h3 style={{ fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Mes Animaux</h3>
            <span className="sf-badge sf-badge-green">{animaux.length}</span>
          </div>

          {animaux.length === 0 ? (
            <div style={{ padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--text-subtle)" }}>
              <PawPrint size={32} />
              <p style={{ fontSize: 13, margin: 0 }}>Aucun animal assigné pour l'instant.</p>
            </div>
          ) : (
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
              {animaux.map(({ animal }: any) => (
                <div key={animal.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: 14,
                  background: "var(--bg-card-alt)", borderRadius: 14,
                  border: "1px solid var(--border-color)", transition: "all 0.2s"
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                >
                  <div style={{ padding: 8, background: "#dcfce7", borderRadius: 10, flexShrink: 0 }}>
                    <PawPrint size={15} style={{ color: "#15803d" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {animal.race} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>#{animal.numero}</span>
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {animal.type} · {animal.terrain?.nom}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 9999, fontWeight: 700, flexShrink: 0, ...getEtatStyle(animal.etatSante) }}>
                    {animal.etatSante}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Cultures assignées ───────────────────── */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid var(--border-color)",
            display: "flex", alignItems: "center", gap: 10, background: "var(--bg-section)"
          }}>
            <div style={{ padding: 8, background: "#fef3c7", borderRadius: 10 }}>
              <Wheat size={16} style={{ color: "#d97706" }} />
            </div>
            <h3 style={{ fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Mes Cultures</h3>
            <span className="sf-badge sf-badge-amber">{cultures.length}</span>
          </div>

          {cultures.length === 0 ? (
            <div style={{ padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--text-subtle)" }}>
              <Wheat size={32} />
              <p style={{ fontSize: 13, margin: 0 }}>Aucune culture assignée pour l'instant.</p>
            </div>
          ) : (
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
              {cultures.map(({ culture }: any) => (
                <div key={culture.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: 14,
                  background: "var(--bg-card-alt)", borderRadius: 14,
                  border: "1px solid var(--border-color)", transition: "all 0.2s"
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                >
                  <div style={{ padding: 8, background: "#fef3c7", borderRadius: 10, flexShrink: 0 }}>
                    <Wheat size={15} style={{ color: "#d97706" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {culture.nom}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {culture.terrain?.nom} · {new Date(culture.datePlantation).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 9999, fontWeight: 700, flexShrink: 0, ...getCultureEtatStyle(culture.etat) }}>
                    {culture.etat}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal messagerie */}
      {showMessaging && agriculteur && (
        <MessagerieModal
          currentUser={currentUser}
          interlocuteur={agriculteur}
          onClose={() => setShowMessaging(false)}
        />
      )}
    </div>
  );
}
