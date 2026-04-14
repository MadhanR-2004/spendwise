import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    const email = "dummy@example.com";
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Dummy user already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcryptjs.hash("password123", 10);
    
    await User.create({
      name: "Dummy User",
      email: email,
      password: hashedPassword,
    });

    console.log("Dummy user inserted successfully!");
    console.log("Email: dummy@example.com");
    console.log("Password: password123");
  } catch (error) {
    console.error("Error inserting user:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
