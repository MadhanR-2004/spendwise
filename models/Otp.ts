import { Schema, model, models } from "mongoose";

const OtpSchema = new Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    type: { type: String, enum: ["register", "reset"], required: true },
  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const Otp = models.Otp || model("Otp", OtpSchema);

export default Otp;
