import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDirectory = path.resolve("uploads", "deliveries");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    callback(null, `${Date.now()}-${safeName}`);
  }
});

export const deliveryUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const blocked = [".exe", ".bat", ".cmd", ".sh"];
    callback(blocked.includes(path.extname(file.originalname).toLowerCase()) ? new Error("Executable files are not allowed") : null, !blocked.includes(path.extname(file.originalname).toLowerCase()));
  }
});
