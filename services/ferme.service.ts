import { FermeModel } from "@/models/ferme";

export const FermeService = {
  getAll() {
    return FermeModel.getAll();
  },

  getById(id: number) {
    return FermeModel.getById(id);
  },

  create(data: any) {
    return FermeModel.create(data);
  },

  update(id: number, data: any) {
    return FermeModel.update(id, data);
  },

  delete(id: number) {
    return FermeModel.delete(id);
  },
};
