import { TerrainModel } from "@/models/terrain";

export const TerrainService = {
  getAll() {
    return TerrainModel.getAll();
  },

  getById(id: number) {
    return TerrainModel.getById(id);
  },

  create(data: any) {
    return TerrainModel.create(data);
  },

  update(id: number, data: any) {
    return TerrainModel.update(id, data);
  },

  delete(id: number) {
    return TerrainModel.delete(id);
  },
};