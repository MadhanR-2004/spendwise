import { Schema, model, models, Types } from "mongoose";

const SavingsGoalSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true, min: 1 },
    savedAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, default: null },
    color: { type: String, default: "#8b5cf6" },
    icon: { type: String, default: "target" },
  },
  { timestamps: true }
);

const SavingsGoal = models.SavingsGoal || model("SavingsGoal", SavingsGoalSchema);

export default SavingsGoal;
