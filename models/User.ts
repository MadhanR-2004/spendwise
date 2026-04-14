import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    currency: { type: String, default: "INR" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const User = models.User || model("User", UserSchema);

export default User;
