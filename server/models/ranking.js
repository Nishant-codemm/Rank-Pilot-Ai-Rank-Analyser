import mongoose from "mongoose";

const rankHistorySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    position: { type: Number, default: null },
    page: { type: Number, default: null },
    title: { type: String, default: "" },
    snippet: { type: String, default: "" },
  },
  { _id: false }
);

const competitorSchema = new mongoose.Schema(
  {
    position: { type: Number, required: true },
    url: { type: String, required: true },
    domain: { type: String, required: true },
    title: { type: String, default: "" },
    snippet: { type: String, default: "" },
  },
  { _id: false }
);

const rankingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    keyword: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    domain: { type: String, required: true },
    currentPosition: { type: Number, default: null },
    currentPage: { type: Number, default: null },
    bestPosition: { type: Number, default: null },
    positionChange: { type: Number, default: 0 },
    rankHistory: { type: [rankHistorySchema], default: [] },
    competitors: { type: [competitorSchema], default: [] },
    active: { type: Boolean, default: true },
    lastChecked: { type: Date, default: null },
    status: { type: String, enum: ["completed", "checking", "failed"], default: "completed" },
  },
  { timestamps: true }
);

const Ranking = mongoose.models.Ranking || mongoose.model("Ranking", rankingSchema);

export default Ranking;
