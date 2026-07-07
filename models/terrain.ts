import { db } from "@/lib/db";

export const TerrainModel = {


  async getById(id: number) {
    return db.terrain.findUnique({
      where: { id },
      include: {
        ferme: true,
      },
    });
  },

async getAll() {
  return db.terrain.findMany({
    include: {
      ferme: true,
      animaux: {
        include: {
          categorie: true,
        },
      },
      cultures: {
        include: {
          categorie: true,
        },
      },
    },
  });
},

async getByAgriculteur(utilisateurId: number) {
  return db.terrain.findMany({
    where: {
      ferme: {
        agriculteurId: utilisateurId,
      },
    },
    include: {
      ferme: true,
      animaux: {
        include: {
          categorie: true,
        },
      },
      cultures: {
        include: {
          categorie: true,
        },
      },
    },
  });
},

async getByEmploye(utilisateurId: number) {
  return db.terrain.findMany({
    where: {
      ferme: {
        employes: {
          some: {
            employeId: utilisateurId,
          },
        },
      },
    },
    include: {
      ferme: true,
      animaux: {
        include: {
          categorie: true,
        },
      },
      cultures: {
        include: {
          categorie: true,
        },
      },
    },
  });
},

  async getByVeterinaire() {
    return db.terrain.findMany({
      where: {
        animaux: {
          some: {},
        },
      },
      include: {
        ferme: true,
        animaux: true,
      },
    });
  },

  async create(data: any) {
    return db.terrain.create({
      data,
    });
  },

  async update(id: number, data: any) {
    return db.terrain.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return db.terrain.delete({
      where: { id },
    });
  },
};