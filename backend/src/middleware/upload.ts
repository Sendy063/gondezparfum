// src/middleware/upload.ts
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req: any, file: { originalname: string; }, cb: (arg0: null, arg1: string) => void) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });
