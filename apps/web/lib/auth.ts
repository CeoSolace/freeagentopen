import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import bcrypt from "bcryptjs";
import { connectDB } from "./mongoose";
import { UserModel } from "../models/user";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await UserModel.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: String(user._id),
          email: user.email,
          name: user.name ?? user.email,
          image: user.image ?? null,
          roles: Array.isArray(user.roles) ? user.roles : [],
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord") {
        await connectDB();

        const email =
          typeof user.email === "string" ? user.email.toLowerCase() : null;

        let existingUser: any = null;

        if (email) {
          existingUser = await UserModel.findOne({ email });
        }

        if (!existingUser) {
          existingUser = await UserModel.create({
            email: email ?? `discord_${account.providerAccountId}@no-email.local`,
            name:
              user.name ||
              (typeof (profile as any)?.global_name === "string"
                ? (profile as any).global_name
                : typeof (profile as any)?.username === "string"
                ? (profile as any).username
                : "Discord User"),
            image: typeof user.image === "string" ? user.image : null,
            roles: [],
            discordId: account.providerAccountId,
          });
        } else {
          const updates: Record<string, any> = {};

          if (!existingUser.discordId) {
            updates.discordId = account.providerAccountId;
          }

          if (!existingUser.image && typeof user.image === "string") {
            updates.image = user.image;
          }

          if (Object.keys(updates).length > 0) {
            await UserModel.updateOne({ _id: existingUser._id }, updates);
            existingUser = await UserModel.findById(existingUser._id);
          }
        }

        if (!existingUser) {
          return false;
        }

        (user as any).id = String(existingUser._id);
        (user as any).roles = Array.isArray(existingUser.roles)
          ? existingUser.roles
          : [];

        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.roles = Array.isArray((user as any).roles)
          ? (user as any).roles
          : [];
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).roles = Array.isArray(token.roles)
          ? token.roles
          : [];
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
