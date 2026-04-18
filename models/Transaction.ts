import { Schema, model, models, Types } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    note: { type: String, default: "" },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

const Transaction = models.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
