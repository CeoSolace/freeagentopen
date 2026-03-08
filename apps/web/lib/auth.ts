import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
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
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "discord") {
        return false;
      }

      await connectDB();

      const discordId =
        typeof account.providerAccountId === "string"
          ? account.providerAccountId
          : null;

      const email =
        typeof user.email === "string" ? user.email.toLowerCase() : null;

      let existingUser: any = null;

      if (discordId) {
        existingUser = await UserModel.findOne({ discordId });
      }

      if (!existingUser && email) {
        existingUser = await UserModel.findOne({ email });
      }

      const displayName =
        typeof user.name === "string" && user.name.trim()
          ? user.name.trim()
          : typeof (profile as any)?.global_name === "string" &&
            (profile as any).global_name.trim()
          ? (profile as any).global_name.trim()
          : typeof (profile as any)?.username === "string" &&
            (profile as any).username.trim()
          ? (profile as any).username.trim()
          : "Discord User";

      const image =
        typeof user.image === "string" && user.image.trim()
          ? user.image
          : null;

      if (!existingUser) {
        existingUser = await UserModel.create({
          email: email ?? `discord_${discordId}@no-email.local`,
          name: displayName,
          image,
          roles: [],
          discordId: discordId ?? undefined,
        });
      } else {
        const updates: Record<string, any> = {};

        if (!existingUser.discordId && discordId) {
          updates.discordId = discordId;
        }

        if ((!existingUser.name || existingUser.name === "Discord User") && displayName) {
          updates.name = displayName;
        }

        if (!existingUser.image && image) {
          updates.image = image;
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
      (user as any).name = existingUser.name ?? displayName;
      (user as any).email = existingUser.email ?? email;
      (user as any).image = existingUser.image ?? image;

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
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const target = new URL(url);
        if (target.origin === baseUrl) {
          return url;
        }
      } catch {}

      return `${baseUrl}/feed`;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
