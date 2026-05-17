import express from "express";
import { createRanking, deleteRanking, getRanking, listRankings, refreshRanking, updateRanking } from "../controllers/rankingController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", listRankings);
router.post("/", createRanking);
router.get("/:id", getRanking);
router.patch("/:id", updateRanking);
router.post("/:id/refresh", refreshRanking);
router.delete("/:id", deleteRanking);

export default router;
