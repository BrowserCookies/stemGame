import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    prompt: { type: String },
    answers: { type: Object },
    generatedMap: { type: Object },
    status: {
      type: String,
      enum: ["generating", "completed", "failed"],
      default: "generating",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Course", CourseSchema);
