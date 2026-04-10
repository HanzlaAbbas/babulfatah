import type { NextAuthOptions } from "next-auth";
import type { DefaultSession, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// ── Type Augmentation ──────────────────────────────────────────
// Extend the default NextAuth types to include `id` and `role` on
// both the User and Session objects. This eliminates ALL `as any` casts.

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "ADMIN" | "CUSTOMER";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "ADMIN" | "CUSTOMER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "CUSTOMER";
  }
}

// ── Auth Options ───────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Only allow ADMIN role
        if (user.role !== "ADMIN") return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // P2 #14 FIX: Session expires after 24 hours — forces re-authentication
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // ✅ Type-safe — no `as any` needed
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;   // ✅ Type-safe
        session.user.role = token.role; // ✅ Type-safe
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
