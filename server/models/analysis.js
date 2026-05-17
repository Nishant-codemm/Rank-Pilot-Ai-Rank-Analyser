import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    seo: { type: Number, required: true },
    performance: { type: Number, required: true },
    accessibility: { type: Number, required: true },
    bestPractices: { type: Number, required: true },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    url: { type: String, required: true },
    overallScore: { type: Number, required: true },
    status: { type: String, enum: ["completed", "processing", "failed"], default: "completed" },
    loadTime: { type: Number, default: 0 },
    pageSize: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    categories: { type: categorySchema, required: true },
    metaData: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      canonical: { type: String, default: "" },
      robots: { type: String, default: "" },
      ogTitle: { type: String, default: "" },
      ogDescription: { type: String, default: "" },
      ogImage: { type: String, default: "" },
      twitterCard: { type: String, default: "" },
      viewport: { type: String, default: "" },
      charset: { type: String, default: "" },
    },
    headings: {
      h1: { type: Number, default: 0 },
      h2: { type: Number, default: 0 },
      h3: { type: Number, default: 0 },
      h4: { type: Number, default: 0 },
      h5: { type: Number, default: 0 },
      h6: { type: Number, default: 0 },
      h1Texts: { type: [String], default: [] },
    },
    links: {
      internal: { type: Number, default: 0 },
      external: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    images: {
      total: { type: Number, default: 0 },
      missingAlt: { type: Number, default: 0 },
      withAlt: { type: Number, default: 0 },
    },
    keywords: [
      {
        word: { type: String, required: true },
        count: { type: Number, default: 0 },
        density: { type: Number, default: 0 },
      },
    ],
    issues: [
      {
        severity: { type: String, enum: ["critical", "warning", "info"], default: "info" },
        category: { type: String, required: true },
        message: { type: String, required: true },
        recommendation: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Analysis = mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);

export default Analysis;
