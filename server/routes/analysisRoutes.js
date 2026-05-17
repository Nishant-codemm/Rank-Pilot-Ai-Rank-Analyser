import express from "express";
import { createAnalysis, deleteAnalysis, getAnalysis, listAnalyses } from "../controllers/analysisController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", listAnalyses);
router.post("/", createAnalysis);
router.get("/:id", getAnalysis);
router.delete("/:id", deleteAnalysis);

export default router;
