import { Schema, model, models, Types } from "mongoose";

const BudgetSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ["weekly", "monthly"], required: true },
    category: { type: String, default: null },
    color: { type: String, default: "#6366f1" },
    alertThreshold: { type: Number, default: 80, min: 0, max: 100 },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, period: 1, category: 1 }, { unique: true });

const Budget = models.Budget || model("Budget", BudgetSchema);

export default Budget;
