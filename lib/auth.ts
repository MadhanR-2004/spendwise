import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectToDatabase();
        const user = await User.findOne({ email: parsed.data.email }).lean<{
          _id: string;
          name: string;
          email: string;
          passwordHash: string;
          currency: string;
        } | null>();

        if (!user) return null;
        const validPassword = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!validPassword) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          currency: user.currency ?? "INR",
        };
      },
    }),
  ],
});

