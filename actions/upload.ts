"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function uploadProfileImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("image") as File;
    
    if (!file) {
      return { success: false, error: "Aucune image sélectionnée" };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Format d'image non supporté. Utilisez JPEG, PNG, WEBP ou GIF." };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "L'image ne doit pas dépasser 5MB" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public/uploads/profiles");
    
    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL
    const url = `/uploads/profiles/${filename}`;
    
    return { success: true, url };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Erreur lors du téléchargement de l'image" };
  }
}