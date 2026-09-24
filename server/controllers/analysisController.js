import Analysis from "../models/analysis.js";
import { createAnalysisPayload } from "../utils/seoGenerators.js";

export const listAnalyses = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      Analysis.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Analysis.countDocuments({ userId: req.user.id }),
    ]);

    res.status(200).json({ 
      analyses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("List analyses error:", error);
    res.status(500).json({ message: "Unable to load analyses." });
  }
};

export const createAnalysis = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: "URL is required." });
    }

    const payload = await createAnalysisPayload(url, req.user.id);
    const analysis = await Analysis.create(payload);
    res.status(201).json({ analysis });
  } catch (error) {
    console.error("Create analysis error:", error);
    res.status(400).json({ message: error.message || "Unable to create analysis. Please enter a valid URL." });
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    res.status(200).json({ analysis });
  } catch (error) {
    console.error("Get analysis error:", error);
    res.status(500).json({ message: "Unable to load analysis." });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    res.status(200).json({ message: "Analysis deleted." });
  } catch (error) {
    console.error("Delete analysis error:", error);
    res.status(500).json({ message: "Unable to delete analysis." });
  }
};
