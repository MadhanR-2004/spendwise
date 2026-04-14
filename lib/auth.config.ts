import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.currency = user.currency;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.currency = String(token.currency ?? "INR");
      }
      return session;
    },
  },
  providers: [], // To be populated in Node environment
} satisfies NextAuthConfig;
