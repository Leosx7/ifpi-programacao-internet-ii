import multer from "multer";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { UnprocessableEntityError } from "../errors/HttpError.ts";

const storage = multer.diskStorage({
  destination: join(process.cwd(), "uploads"),
  filename(_request, file, callback) {
    const extension = file.mimetype === "image/png" ? ".png" : ".jpg";
    callback(null, `${randomUUID()}${extension}`);
  },
});

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(_request, file, callback) {
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      callback(new UnprocessableEntityError("A foto deve ser JPEG ou PNG."));
      return;
    }
    callback(null, true);
  },
});
