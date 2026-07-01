import { db } from "@/lib/db";

export const CultureModel = {
  async getAll() {
    return db.culture.findMany({
      include: {
        terrain: {
          include: {
            ferme: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
        categorie: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: { datePlantation: "desc" },
    });
  },

  async getById(id: number) {
    return db.culture.findUnique({
      where: { id },
      include: {
        terrain: {
          include: {
            ferme: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
        categorie: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });
  },

  async getByFerme(fermeId: number) {
    return db.culture.findMany({
      where: {
        terrain: {
          fermeId: fermeId,
        },
      },
      include: {
        terrain: {
          include: {
            ferme: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
        categorie: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: { datePlantation: "desc" },
    });
  },

  async getByAgriculteur(utilisateurId: number) {
    return db.culture.findMany({
      where: {
        terrain: {
          ferme: {
            agriculteurId: utilisateurId,
          },
        },
      },
      include: {
        terrain: {
          include: {
            ferme: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
        categorie: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: { datePlantation: "desc" },
    });
  },

  async getByEmploye(utilisateurId: number) {
    return db.culture.findMany({
      where: {
        terrain: {
          ferme: {
            employes: {
              some: {
                employeId: utilisateurId,
              },
            },
          },
        },
      },
      include: {
        terrain: {
          include: {
            ferme: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
        categorie: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: { datePlantation: "desc" },
    });
  },

  async create(data: {
    nom: string;
    datePlantation: Date;
    quantitePrevue: number;
    etat: string;
    terrainId: number;
    categorieId: number;
  }) {
    return db.culture.create({
      data: {
        nom: data.nom,
        datePlantation: data.datePlantation,
        quantitePrevue: data.quantitePrevue,
        etat: data.etat,
        terrainId: data.terrainId,
        categorieId: data.categorieId,
      },
      include: {
        terrain: {
          include: {
            ferme: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
        categorie: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });
  },

  async update(
    id: number,
    data: Partial<{
      nom: string;
      datePlantation: Date;
      quantitePrevue: number;
      etat: string;
      terrainId: number;
      categorieId: number;
    }>
  ) {
    return db.culture.update({
      where: { id },
      data,
      include: {
        terrain: {
          include: {
            ferme: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
        categorie: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });
  },

  async delete(id: number) {
    return db.culture.delete({
      where: { id },
    });
  },
};