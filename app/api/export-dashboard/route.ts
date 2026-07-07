// app/api/export-dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import jsPDF from 'jspdf';
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export const dynamic = 'force-dynamic';

// Fonction pour formater les dates
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateLong = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

const formatShortDate = (date: Date | string) => formatDate(new Date(date));

const roleLabelMap: Record<string, string> = {
  ADMIN: 'Administrateur',
  AGRICULTEUR: 'Agriculteur',
  EMPLOYE: 'Employé',
  VETERINAIRE: 'Vétérinaire',
};

const roleColorMap: Record<string, [number, number, number]> = {
  ADMIN: [41, 69, 62],
  AGRICULTEUR: [60, 108, 95],
  EMPLOYE: [120, 120, 120],
  VETERINAIRE: [74, 106, 121],
};

// Types pour les données - tous les IDs sont des number (comme dans Prisma)
interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  createdAt: Date;
}

interface Ferme {
  id: number;
  nom: string;
  adresse: string;
  agriculteurId: string;
  terrains: Terrain[];
}

interface Terrain {
  id: number;
  nom: string;
  fermeId: number;
  animaux: Animal[];
  cultures: Culture[];
}

interface Animal {
  id: number;
  numero: string;
  type: string;
  etatSante: string;
}

interface Culture {
  id: number;
  nom: string;
  type: string;
}

interface Traitement {
  id: number;
  medicament: string;
  date: Date;
  description: string;
  veterinaireId: string;
  animalId: number;
  animal?: {
    numero: string;
    type: string;
  };
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'API d\'export dashboard - Version améliorée',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, period } = body;

    console.log('📄 Génération PDF amélioré avec données réelles...');

    // ============================================
    // RÉCUPÉRATION DES DONNÉES RÉELLES
    // ============================================
    
    let stats: any = {
      total: 0,
      active: 0,
      new: 0,
      roles: {}
    };
    let users: Utilisateur[] = [];
    let fermes: Ferme[] = [];

    // Récupérer les données selon le rôle
    if (role === 'ADMIN') {
      // Données admin : tous les utilisateurs
      const fetchedUsers = await db.utilisateur.findMany({
        orderBy: { createdAt: 'desc' },
        take: period === 'month' ? 50 : 100,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          createdAt: true,
        }
      });
      users = fetchedUsers as unknown as Utilisateur[];

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      stats = {
        total: users.length,
        active: users.filter(u => u.role !== Role.EMPLOYE).length,
        new: users.filter(u => new Date(u.createdAt) > weekAgo).length,
        roles: {
          ADMIN: users.filter(u => u.role === Role.ADMIN).length,
          AGRICULTEUR: users.filter(u => u.role === Role.AGRICULTEUR).length,
          VETERINAIRE: users.filter(u => u.role === Role.VETERINAIRE).length,
          EMPLOYE: users.filter(u => u.role === Role.EMPLOYE).length,
        }
      };
    } else if (role === 'AGRICULTEUR') {
      // Données agriculteur : ses fermes
      const fetchedFermes = await db.ferme.findMany({
        where: { agriculteurId: userId },
        include: {
          terrains: {
            include: {
              animaux: true,
              cultures: true,
            }
          }
        }
      });
      fermes = fetchedFermes as unknown as Ferme[];

      const totalAnimaux = fermes.reduce((acc: number, f: Ferme) => 
        acc + f.terrains.reduce((a: number, t: Terrain) => a + t.animaux.length, 0), 0
      );
      const totalCultures = fermes.reduce((acc: number, f: Ferme) => 
        acc + f.terrains.reduce((a: number, t: Terrain) => a + t.cultures.length, 0), 0
      );

      stats = {
        totalFermes: fermes.length,
        totalTerrains: fermes.reduce((acc: number, f: Ferme) => acc + f.terrains.length, 0),
        totalAnimaux: totalAnimaux,
        totalCultures: totalCultures,
      };
    } else if (role === 'VETERINAIRE') {
      // Données vétérinaire : ses traitements
      const treatments = await db.traitement.findMany({
        where: { veterinaireId: userId },
        orderBy: { date: 'desc' },
        take: 50,
        include: {
          animal: {
            select: { numero: true, type: true }
          }
        }
      });

      const sickAnimals = await db.animal.count({
        where: { 
          etatSante: { 
            in: ['Malade', 'En traitement'] 
          } 
        }
      });

      stats = {
        totalTreatments: treatments.length,
        sickAnimals: sickAnimals,
        recentTreatments: treatments,
      };
    } else {
      // EMPLOYE : données générales
      const fetchedFermes = await db.ferme.findMany({
        include: {
          terrains: {
            include: {
              animaux: true,
              cultures: true,
            }
          }
        }
      });
      fermes = fetchedFermes as unknown as Ferme[];

      const totalAnimaux = fermes.reduce((acc: number, f: Ferme) => 
        acc + f.terrains.reduce((a: number, t: Terrain) => a + t.animaux.length, 0), 0
      );
      const totalCultures = fermes.reduce((acc: number, f: Ferme) => 
        acc + f.terrains.reduce((a: number, t: Terrain) => a + t.cultures.length, 0), 0
      );

      stats = {
        totalFermes: fermes.length,
        totalTerrains: fermes.reduce((acc: number, f: Ferme) => acc + f.terrains.length, 0),
        totalAnimaux: totalAnimaux,
        totalCultures: totalCultures,
      };
    }

    // ============================================
    // CRÉATION DU PDF AMELIORE
    // ============================================

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    const headerHeight = 28;
    let y = 16;

    const drawHeader = (pageIndex: number) => {
      doc.setFillColor(41, 69, 62);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Smart Farming', margin, 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Rapport de tableau de bord', margin, 18);

      const roleLabel = roleLabelMap[role] || role;
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(41, 69, 62);
      doc.roundedRect(pageWidth - 56, 6, 42, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(roleLabel, pageWidth - 35, 12.5, { align: 'center' });

      doc.setTextColor(230, 230, 230);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(formatDateLong(new Date()), pageWidth - margin, 10, { align: 'right' });
      doc.text(`Page ${pageIndex}`, pageWidth - margin, 16, { align: 'right' });
    };

    const ensureSpace = (neededHeight: number) => {
      if (y + neededHeight <= pageHeight - 16) {
        return;
      }

      doc.addPage();
      drawHeader(doc.getNumberOfPages());
      y = 16;
    };

    const drawSectionTitle = (title: string, subtitle?: string) => {
      ensureSpace(18);
      doc.setTextColor(60, 108, 95);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(title, margin, y);
      if (subtitle) {
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(subtitle, margin, y + 5);
      }
      y += subtitle ? 11 : 8;
    };

    const drawMetricCard = (x: number, yPos: number, w: number, h: number, label: string, value: string | number, accent: [number, number, number], note?: string) => {
      doc.setFillColor(248, 250, 245);
      doc.setDrawColor(accent[0], accent[1], accent[2]);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, yPos, w, h, 3, 3, 'FD');

      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(String(value), x + 5, yPos + 10);

      doc.setTextColor(70, 70, 70);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(label.toUpperCase(), x + 5, yPos + 16);

      if (note) {
        doc.setTextColor(110, 110, 110);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(note, x + 5, yPos + h - 3);
      }
    };

    const drawSimpleRow = (labels: string[], values: (string | number)[]) => {
      const rowHeight = 10;
      ensureSpace(rowHeight + 8);
      const columns = labels.length;
      const columnWidth = contentWidth / columns;

      labels.forEach((label, index) => {
        const x = margin + index * columnWidth;
        doc.setFillColor(index % 2 === 0 ? 248 : 244, 250, 245);
        doc.rect(x, y, columnWidth - 1, rowHeight, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(label, x + 2, y + 4);
        doc.setTextColor(41, 69, 62);
        doc.setFont('helvetica', 'normal');
        doc.text(String(values[index] ?? '-'), x + 2, y + 8);
      });

      y += rowHeight + 2;
    };

    drawHeader(1);
    y = 34;

    // Bloc contexte
    ensureSpace(24);
    doc.setFillColor(245, 248, 246);
    doc.setDrawColor(204, 214, 198);
    doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'FD');
    doc.setTextColor(41, 69, 62);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Utilisateur: ${body.userId} (${roleLabelMap[role] || role})`, margin + 4, y + 6);
    doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, margin + 4, y + 12);
    doc.text(`Période: ${period === 'month' ? '30 derniers jours' : 'Toutes les données'}`, pageWidth - margin - 4, y + 6, { align: 'right' });
    y += 24;

    drawSectionTitle('Résumé exécutif', 'Vue rapide des indicateurs les plus importants.');

    let statsItems: Array<{ label: string; value: number; note?: string }> = [];
    let overviewNote = '';

    if (role === 'ADMIN') {
      const total = stats.total || 0;
      const active = stats.active || 0;
      const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

      statsItems = [
        { label: 'Total utilisateurs', value: total, note: 'Comptes dans le système' },
        { label: 'Utilisateurs actifs', value: active, note: `${activeRate}% du total` },
        { label: 'Nouveaux (7j)', value: stats.new || 0, note: 'Dernières créations' },
        { label: 'Admins', value: stats.roles?.ADMIN || 0, note: 'Gestion centrale' },
        { label: 'Agriculteurs', value: stats.roles?.AGRICULTEUR || 0, note: 'Exploitations' },
        { label: 'Vétérinaires', value: stats.roles?.VETERINAIRE || 0, note: 'Santé animale' },
        { label: 'Employés', value: stats.roles?.EMPLOYE || 0, note: 'Support opérationnel' },
      ];

      overviewNote = `Taux d'activité global estimé à ${activeRate}%.`;
    } else if (role === 'AGRICULTEUR' || role === 'EMPLOYE') {
      const totalFermes = stats.totalFermes || 0;
      const totalTerrains = stats.totalTerrains || 0;
      const totalAnimaux = stats.totalAnimaux || 0;
      const totalCultures = stats.totalCultures || 0;

      statsItems = [
        { label: 'Fermes', value: totalFermes, note: 'Périmètre suivi' },
        { label: 'Terrains', value: totalTerrains, note: 'Parcelles exploitées' },
        { label: 'Animaux', value: totalAnimaux, note: 'Cheptel suivi' },
        { label: 'Cultures', value: totalCultures, note: 'Surfaces cultivées' },
      ];

      overviewNote = `Répartition actuelle: ${totalTerrains} terrains pour ${totalAnimaux} animaux et ${totalCultures} cultures.`;
    } else if (role === 'VETERINAIRE') {
      statsItems = [
        { label: 'Traitements', value: stats.totalTreatments || 0, note: 'Actes enregistrés' },
        { label: 'Animaux malades', value: stats.sickAnimals || 0, note: 'Cas à surveiller' },
      ];

      overviewNote = 'Le rapport met l\'accent sur les soins récents et les animaux à risque.';
    }

    const cardWidth = role === 'ADMIN' ? 62 : 85;
    const cardHeight = 22;
    const cardsPerRow = role === 'ADMIN' ? 4 : 4;
    const gap = 4;
    const rowCount = Math.ceil(statsItems.length / cardsPerRow);
    const totalGridWidth = Math.min(contentWidth, cardsPerRow * cardWidth + (cardsPerRow - 1) * gap);
    const startX = margin + (contentWidth - totalGridWidth) / 2;

    statsItems.forEach((item, index) => {
      const col = index % cardsPerRow;
      const row = Math.floor(index / cardsPerRow);
      const x = startX + col * (cardWidth + gap);
      const yPos = y + row * (cardHeight + 5);
      drawMetricCard(x, yPos, cardWidth, cardHeight, item.label, item.value, roleColorMap[role] || [41, 69, 62], item.note);
    });

    y += rowCount * (cardHeight + 5) + 2;

    if (overviewNote) {
      ensureSpace(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text(overviewNote, margin, y);
      y += 6;
    }

    // Détails selon le rôle
    if (role === 'ADMIN') {
      drawSectionTitle('Répartition des rôles', 'Lecture rapide de la population utilisateurs.');

      drawSimpleRow(
        ['Administrateurs', 'Agriculteurs', 'Vétérinaires', 'Employés'],
        [stats.roles?.ADMIN || 0, stats.roles?.AGRICULTEUR || 0, stats.roles?.VETERINAIRE || 0, stats.roles?.EMPLOYE || 0]
      );

      drawSectionTitle('Derniers utilisateurs', 'Aperçu des comptes les plus récents.');
      const userList = users.slice(0, 12);

      const tableHeaderHeight = 10;
      const tableRowHeight = 9;
      ensureSpace(tableHeaderHeight + userList.length * tableRowHeight + 8);

      doc.setFillColor(60, 108, 95);
      doc.rect(margin, y, contentWidth, tableHeaderHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Nom complet', margin + 3, y + 6.5);
      doc.text('Email', margin + 75, y + 6.5);
      doc.text('Rôle', margin + 165, y + 6.5);
      doc.text('Créé le', pageWidth - margin - 6, y + 6.5, { align: 'right' });
      y += tableHeaderHeight;

      userList.forEach((user: Utilisateur, index: number) => {
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 245);
          doc.rect(margin, y, contentWidth, tableRowHeight, 'F');
        }

        const color = roleColorMap[user.role] || [100, 100, 100];
        doc.setTextColor(41, 69, 62);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`${user.prenom} ${user.nom}`, margin + 3, y + 6);
        doc.text(String(user.email || 'N/A').slice(0, 28), margin + 75, y + 6);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(String(user.role || 'N/A'), margin + 165, y + 6);
        doc.setTextColor(90, 90, 90);
        doc.text(formatShortDate(user.createdAt || new Date()), pageWidth - margin - 6, y + 6, { align: 'right' });
        y += tableRowHeight;
      });

    } else if (role === 'AGRICULTEUR' || role === 'EMPLOYE') {
      drawSectionTitle('Synthèse des exploitations', 'Détail des fermes avec terrains, animaux et cultures.');

      const rowHeight = 10;
      ensureSpace(rowHeight + fermes.slice(0, 8).length * rowHeight + 10);

      doc.setFillColor(60, 108, 95);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Ferme', margin + 3, y + 6.5);
      doc.text('Terrains', margin + 90, y + 6.5);
      doc.text('Animaux', margin + 130, y + 6.5);
      doc.text('Cultures', margin + 170, y + 6.5);
      doc.text('Adresse', pageWidth - margin - 4, y + 6.5, { align: 'right' });
      y += rowHeight;

      fermes.slice(0, 8).forEach((ferme: Ferme, index: number) => {
        ensureSpace(rowHeight + 2);
        const terrains = ferme.terrains || [];
        const totalAnimaux = terrains.reduce((acc: number, t: Terrain) => acc + (t.animaux?.length || 0), 0);
        const totalCultures = terrains.reduce((acc: number, t: Terrain) => acc + (t.cultures?.length || 0), 0);

        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 245);
          doc.rect(margin, y, contentWidth, rowHeight, 'F');
        }

        doc.setTextColor(41, 69, 62);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(String(ferme.nom || 'Ferme sans nom').slice(0, 32), margin + 3, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(String(terrains.length), margin + 90, y + 6);
        doc.text(String(totalAnimaux), margin + 130, y + 6);
        doc.text(String(totalCultures), margin + 170, y + 6);
        doc.setTextColor(90, 90, 90);
        doc.text(String(ferme.adresse || 'N/A').slice(0, 32), pageWidth - margin - 4, y + 6, { align: 'right' });
        y += rowHeight;
      });

    } else if (role === 'VETERINAIRE') {
      drawSectionTitle('Traitements récents', 'Suivi des actes vétérinaires les plus récents.');
      const treatmentList = stats.recentTreatments || [];

      const headerHeight = 10;
      const treatmentRowHeight = 11;
      ensureSpace(headerHeight + treatmentList.slice(0, 10).length * treatmentRowHeight + 8);

      doc.setFillColor(60, 108, 95);
      doc.rect(margin, y, contentWidth, headerHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Traitement', margin + 3, y + 6.5);
      doc.text('Animal', margin + 95, y + 6.5);
      doc.text('Date', margin + 145, y + 6.5);
      doc.text('Description', pageWidth - margin - 4, y + 6.5, { align: 'right' });
      y += headerHeight;

      treatmentList.slice(0, 10).forEach((treatment: Traitement, index: number) => {
        ensureSpace(treatmentRowHeight);
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 245);
          doc.rect(margin, y, contentWidth, treatmentRowHeight, 'F');
        }

        doc.setTextColor(41, 69, 62);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(String(treatment.medicament || 'Traitement').slice(0, 24), margin + 3, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(String(treatment.animal?.numero || 'N/A').slice(0, 14), margin + 95, y + 6);
        doc.text(formatShortDate(treatment.date), margin + 145, y + 6);
        doc.setTextColor(90, 90, 90);
        doc.text(String(treatment.description || '').slice(0, 38) || 'N/A', pageWidth - margin - 4, y + 6, { align: 'right' });
        y += treatmentRowHeight;
      });
    }

    // Synthese finale
    drawSectionTitle('Observation générale', 'Résumé simple à conserver avec le document.');
    ensureSpace(18);
    doc.setFillColor(245, 248, 246);
    doc.setDrawColor(204, 214, 198);
    doc.roundedRect(margin, y, contentWidth, 16, 3, 3, 'FD');
    doc.setTextColor(41, 69, 62);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    let conclusion = 'Le rapport présente les indicateurs principaux de l\'exploitation.';
    if (role === 'ADMIN') {
      conclusion = `Base utilisateurs visible: ${formatNumber(stats.total || 0)} comptes, dont ${formatNumber(stats.active || 0)} actifs.`;
    } else if (role === 'AGRICULTEUR' || role === 'EMPLOYE') {
      conclusion = `L'exploitation suit ${formatNumber(stats.totalFermes || 0)} fermes, ${formatNumber(stats.totalTerrains || 0)} terrains, ${formatNumber(stats.totalAnimaux || 0)} animaux et ${formatNumber(stats.totalCultures || 0)} cultures.`;
    } else if (role === 'VETERINAIRE') {
      conclusion = `Le suivi vétérinaire comprend ${formatNumber(stats.totalTreatments || 0)} traitements et ${formatNumber(stats.sickAnimals || 0)} animaux malades à surveiller.`;
    }
    doc.text(conclusion, margin + 4, y + 6);
    y += 22;

    // ========== PIED DE PAGE SUR CHAQUE PAGE ==========
    const totalPages = doc.getNumberOfPages();
    for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
      doc.setPage(pageIndex);
      const footerY = pageHeight - 10;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Smart Farming - Dashboard Export', margin, footerY);
      doc.text(`Page ${pageIndex}/${totalPages} • Généré le ${new Date().toLocaleString('fr-FR')}`, pageWidth - margin, footerY, { align: 'right' });
    }

    // ============================================
    // SAUVEGARDE
    // ============================================
    
    const pdfBuffer = doc.output('arraybuffer');
    console.log(`✅ PDF généré: ${pdfBuffer.byteLength} bytes`);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="dashboard-${role.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('❌ Erreur détaillée:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du PDF',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}