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
    let users: any[] = [];
    let fermes: any[] = [];
    let animaux: any[] = [];
    let cultures: any[] = [];

    // Récupérer les données selon le rôle
    if (role === 'ADMIN') {
      // Données admin : tous les utilisateurs
      users = await db.utilisateur.findMany({
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
      fermes = await db.ferme.findMany({
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

      const totalAnimaux = fermes.reduce((acc, f) => 
        acc + f.terrains.reduce((a, t) => a + t.animaux.length, 0), 0
      );
      const totalCultures = fermes.reduce((acc, f) => 
        acc + f.terrains.reduce((a, t) => a + t.cultures.length, 0), 0
      );

      stats = {
        totalFermes: fermes.length,
        totalTerrains: fermes.reduce((acc, f) => acc + f.terrains.length, 0),
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
        recentTreatments: treatments.slice(0, 10),
      };
    } else {
      // EMPLOYE : données générales
      fermes = await db.ferme.findMany({
        include: {
          terrains: {
            include: {
              animaux: true,
              cultures: true,
            }
          }
        }
      });

      const totalAnimaux = fermes.reduce((acc, f) => 
        acc + f.terrains.reduce((a, t) => a + t.animaux.length, 0), 0
      );
      const totalCultures = fermes.reduce((acc, f) => 
        acc + f.terrains.reduce((a, t) => a + t.cultures.length, 0), 0
      );

      stats = {
        totalFermes: fermes.length,
        totalTerrains: fermes.reduce((acc, f) => acc + f.terrains.length, 0),
        totalAnimaux: totalAnimaux,
        totalCultures: totalCultures,
      };
    }

    // ============================================
    // CRÉATION DU PDF MODERNE
    // ============================================
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 25;

    // ========== EN-TÊTE AVEC DÉGRADÉ ==========
    // Fond de l'en-tête
    doc.setFillColor(41, 69, 62); // #29453E
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Logo / Titre
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('🌾 Smart Farming', margin, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Dashboard Export', margin, 32);
    
    // Date à droite
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.text(formatDateLong(new Date()), pageWidth - margin, 20, { align: 'right' });

    y = 55;

    // ========== SECTION UTILISATEUR ==========
    doc.setTextColor(41, 69, 62);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`👤 Utilisateur: ${body.userId} (${role})`, margin, y);
    y += 8;
    doc.text(`📅 Généré le: ${new Date().toLocaleString('fr-FR')}`, margin, y);
    y += 8;
    doc.text(`📊 Période: ${period === 'month' ? '30 derniers jours' : 'Toutes les données'}`, margin, y);
    y += 15;

    // Ligne de séparation
    doc.setDrawColor(157, 174, 122);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // ========== STATISTIQUES ==========
    doc.setTextColor(60, 108, 95);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('📈 STATISTIQUES', margin, y);
    y += 10;

    // Créer des cartes de statistiques
    let statsItems: any[] = [];

    if (role === 'ADMIN') {
      statsItems = [
        { label: 'Total Utilisateurs', value: stats.total || 0, icon: '👥' },
        { label: 'Utilisateurs Actifs', value: stats.active || 0, icon: '✅' },
        { label: 'Nouveaux (7j)', value: stats.new || 0, icon: '🆕' },
      ];
      
      if (stats.roles) {
        statsItems.push(
          { label: 'Admin', value: stats.roles.ADMIN || 0, icon: '🔑' },
          { label: 'Agriculteurs', value: stats.roles.AGRICULTEUR || 0, icon: '🌾' },
          { label: 'Vétérinaires', value: stats.roles.VETERINAIRE || 0, icon: '💉' },
          { label: 'Employés', value: stats.roles.EMPLOYE || 0, icon: '👷' }
        );
      }
    } else if (role === 'AGRICULTEUR' || role === 'EMPLOYE') {
      statsItems = [
        { label: 'Fermes', value: stats.totalFermes || 0, icon: '🏠' },
        { label: 'Terrains', value: stats.totalTerrains || 0, icon: '🌍' },
        { label: 'Animaux', value: stats.totalAnimaux || 0, icon: '🐄' },
        { label: 'Cultures', value: stats.totalCultures || 0, icon: '🌱' },
      ];
    } else if (role === 'VETERINAIRE') {
      statsItems = [
        { label: 'Traitements', value: stats.totalTreatments || 0, icon: '💊' },
        { label: 'Animaux Malades', value: stats.sickAnimals || 0, icon: '🏥' },
      ];
    }

    // Afficher les stats en grille
    const cols = Math.min(statsItems.length, 4);
    const colWidth = (pageWidth - (margin * 2) - ((cols - 1) * 5)) / cols;
    
    statsItems.forEach((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = margin + (col * (colWidth + 5));
      const yPos = y + 5 + (row * 25);

      // Fond de la carte
      doc.setFillColor(248, 250, 245);
      doc.setDrawColor(157, 174, 122);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, yPos, colWidth, 20, 3, 3, 'FD');

      // Valeur
      doc.setTextColor(41, 69, 62);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(String(item.value), x + 5, yPos + 8);

      // Label
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${item.icon} ${item.label}`, x + 5, yPos + 17);
    });

    y += 40 + (Math.ceil(statsItems.length / cols) * 20);

    // ========== LISTE DES UTILISATEURS (ADMIN) ==========
    if (role === 'ADMIN' && users.length > 0) {
      y += 5;
      doc.setTextColor(60, 108, 95);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('👥 UTILISATEURS', margin, y);
      y += 8;

      // En-tête du tableau
      doc.setFillColor(60, 108, 95);
      doc.rect(margin, y - 5, pageWidth - (margin * 2), 7, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Nom', margin + 5, y);
      doc.text('Email', margin + 50, y);
      doc.text('Rôle', margin + 120, y);
      
      y += 8;

      // Lignes du tableau
      const userList = users.slice(0, 15);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      userList.forEach((user, index) => {
        const rowY = y + (index * 6);
        if (rowY > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }

        // Alternance des couleurs
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 245);
          doc.rect(margin, rowY - 4, pageWidth - (margin * 2), 5, 'F');
        }

        doc.setTextColor(41, 69, 62);
        doc.text(`${user.prenom} ${user.nom}`, margin + 5, rowY);
        doc.text(user.email || 'N/A', margin + 50, rowY);
        
        // Couleur du rôle
        const roleColors: any = {
          'ADMIN': [200, 50, 50],
          'AGRICULTEUR': [60, 108, 95],
          'VETERINAIRE': [41, 69, 62],
          'EMPLOYE': [100, 100, 100],
        };
        const color = roleColors[user.role] || [100, 100, 100];
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(user.role || 'N/A', margin + 120, rowY);
      });

      y += (userList.length * 6) + 10;
    }

    // ========== FERMES (AGRICULTEUR/EMPLOYE) ==========
    if ((role === 'AGRICULTEUR' || role === 'EMPLOYE') && fermes.length > 0) {
      y += 5;
      doc.setTextColor(60, 108, 95);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('🏠 FERMES', margin, y);
      y += 8;

      fermes.slice(0, 10).forEach((ferme, index) => {
        const rowY = y + (index * 15);
        if (rowY > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(248, 250, 245);
        doc.roundedRect(margin, rowY - 3, pageWidth - (margin * 2), 12, 2, 2, 'F');
        
        doc.setTextColor(41, 69, 62);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(ferme.nom || 'Ferme sans nom', margin + 5, rowY + 3);

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const terrains = ferme.terrains || [];
        const totalAnimaux = terrains.reduce((acc: number, t: any) => acc + (t.animaux?.length || 0), 0);
        const totalCultures = terrains.reduce((acc: number, t: any) => acc + (t.cultures?.length || 0), 0);
        
        doc.text(`📍 ${terrains.length} terrains • 🐄 ${totalAnimaux} animaux • 🌱 ${totalCultures} cultures`, margin + 100, rowY + 3);
      });

      y += (Math.min(fermes.length, 10) * 15) + 10;
    }

    // ========== TRAITEMENTS (VETERINAIRE) ==========
    if (role === 'VETERINAIRE' && stats.recentTreatments && stats.recentTreatments.length > 0) {
      y += 5;
      doc.setTextColor(60, 108, 95);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('💊 TRAITEMENTS RÉCENTS', margin, y);
      y += 8;

      stats.recentTreatments.slice(0, 10).forEach((treatment: any, index: number) => {
        const rowY = y + (index * 10);
        if (rowY > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }

        doc.setTextColor(41, 69, 62);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${treatment.medicament || 'Traitement'}`, margin + 5, rowY);
        doc.text(`Animal: ${treatment.animal?.numero || 'N/A'}`, margin + 60, rowY);
        doc.text(formatDate(treatment.date), margin + 120, rowY);
      });

      y += (stats.recentTreatments.slice(0, 10).length * 10) + 10;
    }

    // ========== PIED DE PAGE ==========
    const footerY = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart Farming - Dashboard Export', margin, footerY);
    doc.text(`Page 1/1 • Généré le ${new Date().toLocaleString('fr-FR')}`, pageWidth - margin, footerY, { align: 'right' });

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