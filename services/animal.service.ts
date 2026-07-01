import { AnimalModel } from "@/models/animal";

export const AnimalService = {
  getAll: () => AnimalModel.getAll(),
  getById: (id: number) => AnimalModel.getById(id),
  getByAgriculteur: (id: number) => AnimalModel.getByAgriculteur(id),
  getByEmploye: (id: number) => AnimalModel.getByEmploye(id),
  create: (data: any) => AnimalModel.create(data),
  update: (id: number, data: any) => AnimalModel.update(id, data),
  delete: (id: number) => AnimalModel.delete(id),

  addTraitement: (data: any) => AnimalModel.addTraitement(data),
  deleteTraitement: (id: number) => AnimalModel.deleteTraitement(id),

  addVaccination: (data: any) => AnimalModel.addVaccination(data),
  deleteVaccination: (id: number) => AnimalModel.deleteVaccination(id),

  getCategories: () => AnimalModel.getCategories(),
};
