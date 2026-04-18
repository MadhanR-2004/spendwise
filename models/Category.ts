import { Schema, model, models, Types } from "mongoose";

const CategorySchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

const Category = models.Category || model("Category", CategorySchema);

export default Category;
