// components/FermeTable.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deleteFermeAction } from "@/actions/ferme";
import {
  Pencil, Trash2, Warehouse, Search, Plus,
  MapPin, Ruler, User, ChevronLeft, ChevronRight, AlertTriangle,
} from "lucide-react";
import { Role } from "@prisma/client";

interface Ferme {
  id: number;
  nom: string;
  adresse: string;
  superficie: number;
  agriculteur: { id: number; nom: string; prenom: string };
}
interface Props {
  initialFermes: Ferme[];
  user: { id: number; role: Role };
}

export default function FermeTable({ initialFermes, user }: Props) {
  const [fermes, setFermes] = useState(initialFermes || []);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const canManage = user?.role === Role.ADMIN || user?.role === Role.AGRICULTEUR;
  const ITEMS_PER_PAGE = 8;

  async function handleDelete(id: number) {
    if (!confirm("Voulez-vous vraiment supprimer cette ferme ?")) return;
    setDeletingId(id);
    const result = await deleteFermeAction(id);
    if (result.success) setFermes((old) => old.filter((f) => f.id !== id));
    else setError(result.error || "Erreur lors de la suppression.");
    setDeletingId(null);
  }

  const filteredFermes = useMemo(() =>
    fermes.filter((f) =>
      (f.nom + " " + f.adresse + " " + f.agriculteur.nom + " " + f.agriculteur.prenom)
        .toLowerCase().includes(search.toLowerCase())
    ), [fermes, search]);

  const totalPages = Math.ceil(filteredFermes.length / ITEMS_PER_PAGE);
  const paginated = filteredFermes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(22,163,74,0.3)"
          }}>
            <Warehouse size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Mes Fermes
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              {filteredFermes.length} ferme(s) enregistrée(s)
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: 36, width: 200 }}
            />
          </div>
          {canManage && (
            <Link href="/dashboard/fermes/add" className="sf-btn-primary" style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
              textDecoration: "none", fontSize: 13
            }}>
              <Plus size={16} /> Ajouter
            </Link>
          )}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
          background: "var(--color-danger-bg)", border: "1px solid var(--color-danger-border)",
          borderRadius: 12, padding: "12px 16px", color: "var(--color-danger)", fontSize: 13
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Empty state */}
      {filteredFermes.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "64px 24px",
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderRadius: 20, boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "var(--accent-bg)", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
          }}>
            <Warehouse size={36} style={{ color: "var(--accent)" }} />
          </div>
          <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>
            {search ? "Aucun résultat" : "Aucune ferme"}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 24px" }}>
            {search ? "Essayez une autre recherche." : "Commencez par ajouter votre première ferme."}
          </p>
          {canManage && !search && (
            <Link href="/dashboard/fermes/add" className="sf-btn-primary" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 22px", textDecoration: "none", fontSize: 14
            }}>
              <Plus size={16} /> Ajouter une ferme
            </Link>
          )}
        </div>
      ) : (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderRadius: 20, boxShadow: "var(--shadow-sm)", overflow: "hidden"
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-section)", borderBottom: "1px solid var(--border-color)" }}>
                  {["Ferme", "Adresse", "Superficie", "Propriétaire", ...(canManage ? ["Actions"] : [])].map((h, i, arr) => (
                    <th key={h} style={{
                      padding: "13px 20px",
                      textAlign: (i === arr.length - 1 && canManage) ? "right" : "left",
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.1em", color: "var(--text-muted)", whiteSpace: "nowrap"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((ferme) => (
                  <tr key={ferme.id}
                    style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          <Warehouse size={17} style={{ color: "var(--accent)" }} />
                        </div>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
                          {ferme.nom}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
                        <MapPin size={13} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
                        {ferme.adresse}
                      </span>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <span className="sf-badge sf-badge-green" style={{ gap: 5 }}>
                        <Ruler size={11} /> {ferme.superficie} ha
                      </span>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
                        <User size={13} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
                        {ferme.agriculteur.prenom} {ferme.agriculteur.nom}
                      </span>
                    </td>

                    {canManage && (
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                          <Link href={`/dashboard/fermes/${ferme.id}/edit`} style={{
                            width: 34, height: 34, borderRadius: 9,
                            background: "var(--accent-bg)", border: "1px solid #bbf7d0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            textDecoration: "none", color: "var(--accent)", transition: "all 0.2s"
                          }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                          >
                            <Pencil size={14} />
                          </Link>
                          <button onClick={() => handleDelete(ferme.id)} disabled={deletingId === ferme.id} style={{
                            width: 34, height: 34, borderRadius: 9, cursor: "pointer",
                            background: "var(--color-danger-bg)", border: "1px solid var(--color-danger-border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--color-danger)", transition: "all 0.2s"
                          }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-danger)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-danger-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--color-danger)"; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", borderTop: "1px solid var(--border-color)",
              background: "var(--bg-card-alt)"
            }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Page {currentPage} / {totalPages} — {filteredFermes.length} résultats
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-color)",
                    background: "var(--bg-surface)", color: "var(--text-muted)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)} style={{
                    width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                    fontWeight: 700, fontSize: 13, transition: "all 0.2s",
                    background: currentPage === p ? "linear-gradient(135deg,#22c55e,#16a34a)" : "var(--bg-surface)",
                    color: currentPage === p ? "white" : "var(--text-muted)",
                    boxShadow: currentPage === p ? "0 3px 10px rgba(22,163,74,0.3)" : "none",
                    border: currentPage === p ? "none" : "1px solid var(--border-color)"
                  } as React.CSSProperties}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-color)",
                    background: "var(--bg-surface)", color: "var(--text-muted)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}