import { db } from "@/lib/db";

export const TraitementModel = {
  async getAll() {
    return db.traitement.findMany({
      include: {
        animal: {
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
          },
        },
        veterinaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
  },

  async getById(id: number) {
    return db.traitement.findUnique({
      where: { id },
      include: {
        animal: {
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
          },
        },
        veterinaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });
  },

  async getByAgriculteur(utilisateurId: number) {
    return db.traitement.findMany({
      where: {
        animal: {
          terrain: {
            ferme: {
              agriculteurId: utilisateurId,
            },
          },
        },
      },
      include: {
        animal: {
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
          },
        },
        veterinaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
  },

  async getByEmploye(utilisateurId: number) {
    return db.traitement.findMany({
      where: {
        animal: {
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
      },
      include: {
        animal: {
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
          },
        },
        veterinaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
  },

  async getByVeterinaire(utilisateurId: number) {
    return db.traitement.findMany({
      where: {
        veterinaireId: utilisateurId,
      },
      include: {
        animal: {
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
          },
        },
        veterinaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
  },

  async create(data: {
    date: Date;
    dateFin?: Date | null;
    medicament: string;
    description: string;
    dosage?: string | null;
    observation?: string | null;
    animalId: number;
    veterinaireId: number;
  }) {
    return db.traitement.create({
      data,
      include: {
        animal: {
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
          },
        },
        veterinaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });
  },

  async delete(id: number) {
    return db.traitement.delete({
      where: { id },
    });
  },
};
