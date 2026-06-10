import express from "express";

const router = express.Router();

import {
  adminAIChat,
} from "../controllers/adminAIController";

router.post(
  "/chat",
  adminAIChat
);

export default router;