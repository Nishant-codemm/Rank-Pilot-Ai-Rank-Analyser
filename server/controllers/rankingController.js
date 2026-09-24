import Ranking from "../models/ranking.js";
import { createRankingPayload } from "../utils/seoGenerators.js";

export const listRankings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [rankings, total] = await Promise.all([
      Ranking.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Ranking.countDocuments({ userId: req.user.id }),
    ]);

    res.status(200).json({ 
      rankings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("List rankings error:", error);
    res.status(500).json({ message: "Unable to load rankings." });
  }
};

export const createRanking = async (req, res) => {
  try {
    const { keyword, url } = req.body;
    if (!keyword || !url) {
      return res.status(400).json({ message: "Keyword and URL are required." });
    }

    const payload = await createRankingPayload({ keyword, url, userId: req.user.id });
    const ranking = await Ranking.create(payload);
    res.status(201).json({ ranking });
  } catch (error) {
    console.error("Create ranking error:", error);
    res.status(400).json({ message: error.message || "Unable to create ranking. Please enter a valid keyword and URL." });
  }
};

export const getRanking = async (req, res) => {
  try {
    const ranking = await Ranking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!ranking) {
      return res.status(404).json({ message: "Ranking not found." });
    }

    res.status(200).json({ ranking });
  } catch (error) {
    console.error("Get ranking error:", error);
    res.status(500).json({ message: "Unable to load ranking." });
  }
};

export const updateRanking = async (req, res) => {
  try {
    const allowed = {};
    if (typeof req.body.active === "boolean") {
      allowed.active = req.body.active;
    }

    const ranking = await Ranking.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, allowed, { new: true });
    if (!ranking) {
      return res.status(404).json({ message: "Ranking not found." });
    }

    res.status(200).json({ ranking });
  } catch (error) {
    console.error("Update ranking error:", error);
    res.status(500).json({ message: "Unable to update ranking." });
  }
};

export const refreshRanking = async (req, res) => {
  try {
    const ranking = await Ranking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!ranking) {
      return res.status(404).json({ message: "Ranking not found." });
    }

    const previousPosition = ranking.currentPosition;
    // Simulate rank fluctuation instead of always improving
    const fluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const nextPosition = previousPosition ? Math.max(1, previousPosition + fluctuation) : 18;
    
    ranking.currentPosition = nextPosition;
    ranking.currentPage = Math.ceil(nextPosition / 10);
    ranking.bestPosition = ranking.bestPosition ? Math.min(ranking.bestPosition, nextPosition) : nextPosition;
    ranking.positionChange = previousPosition ? previousPosition - nextPosition : 0;
    ranking.lastChecked = new Date();
    ranking.status = "completed";
    
    // maintain max history of 30 days
    if (ranking.rankHistory.length >= 30) {
      ranking.rankHistory.shift();
    }
    
    ranking.rankHistory.push({
      date: new Date(),
      position: nextPosition,
      page: Math.ceil(nextPosition / 10),
      title: `${ranking.domain} result for ${ranking.keyword}`,
      snippet: `Latest estimated ranking snapshot for ${ranking.keyword}.`,
    });

    await ranking.save();
    res.status(200).json({ ranking });
  } catch (error) {
    console.error("Refresh ranking error:", error);
    res.status(500).json({ message: "Unable to refresh ranking." });
  }
};

export const deleteRanking = async (req, res) => {
  try {
    const ranking = await Ranking.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!ranking) {
      return res.status(404).json({ message: "Ranking not found." });
    }

    res.status(200).json({ message: "Ranking deleted." });
  } catch (error) {
    console.error("Delete ranking error:", error);
    res.status(500).json({ message: "Unable to delete ranking." });
  }
};
