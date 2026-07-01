import { db } from "@/lib/db";
import { TypeCategorie } from "@prisma/client";

export interface CreateCategorieInput {
  nom: string;
  type: TypeCategorie;
}

export const CategorieModel = {
  /**
   * Fetch all categories from the database
   */
  async getAll() {
    return await db.categorie.findMany({
      orderBy: { id: "desc" },
      include: {
        _count: {
          select: { animaux: true, cultures: true },
        },
      },
    });
  },

  /**
   * Find a single category by ID
   */
  async getById(id: number) {
    return await db.categorie.findUnique({
      where: { id },
    });
  },

  /**
   * Create a new category in the database
   */
  async create(data: CreateCategorieInput) {
    return await db.categorie.create({
      data,
    });
  },

  /**
   * Update an existing category
   */
  async update(id: number, data: Partial<CreateCategorieInput>) {
    return await db.categorie.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a category by ID
   */
  async delete(id: number) {
    return await db.categorie.delete({
      where: { id },
    });
  },
};
