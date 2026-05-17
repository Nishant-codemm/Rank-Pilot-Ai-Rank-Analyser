import Analysis from "../models/analysis.js";
import { createAnalysisPayload } from "../utils/seoGenerators.js";

export const listAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ analyses });
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

    const analysis = await Analysis.create(createAnalysisPayload(url, req.user.id));
    res.status(201).json({ analysis });
  } catch (error) {
    console.error("Create analysis error:", error);
    res.status(400).json({ message: "Unable to create analysis. Please enter a valid URL." });
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
