import { CultureModel } from "@/models/culture";

export const CultureService = {
  getAll() {
    return CultureModel.getAll();
  },

  getById(id: number) {
    return CultureModel.getById(id);
  },

  getByFerme(fermeId: number) {
    return CultureModel.getByFerme(fermeId);
  },

  create(data: any) {
    return CultureModel.create(data);
  },

  update(id: number, data: any) {
    return CultureModel.update(id, data);
  },

  delete(id: number) {
    return CultureModel.delete(id);
  },
};