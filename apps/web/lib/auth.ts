import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { connectDB } from "./mongoose";
import { UserModel } from "../models/user";
import { ROLES, type RoleKey } from "./roles";

function parseOwnerDiscordIds(): Set<string> {
  return new Set(
    (process.env.OWNER_USER_IDS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function normalizeRoles(input: unknown): RoleKey[] {
  const roles = Array.isArray(input) ? input.filter(Boolean).map(String) : [];
  const valid = new Set(Object.values(ROLES));
  const filtered = roles.filter((role): role is RoleKey => valid.has(role as RoleKey));

  if (filtered.length === 0) {
    return [ROLES.MEMBER];
  }

  if (!filtered.includes(ROLES.MEMBER)) {
    filtered.push(ROLES.MEMBER);
  }

  return Array.from(new Set(filtered));
}

function buildAvatarUrl(profile: any, fallbackImage?: string | null): string | undefined {
  if (typeof fallbackImage === "string" && fallbackImage.trim()) {
    return fallbackImage;
  }

  if (profile?.id && profile?.avatar) {
    return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
  }

  return undefined;
}

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

      const owners = parseOwnerDiscordIds();
      const discordId =
        typeof account.providerAccountId === "string"
          ? account.providerAccountId
          : typeof (profile as any)?.id === "string"
          ? (profile as any).id
          : "";

      if (!discordId) {
        return false;
      }

      const email =
        typeof user.email === "string" ? user.email.toLowerCase() : undefined;

      const username =
        typeof (profile as any)?.global_name === "string" && (profile as any).global_name.trim()
          ? (profile as any).global_name.trim()
          : typeof (profile as any)?.username === "string" && (profile as any).username.trim()
          ? (profile as any).username.trim()
          : typeof user.name === "string" && user.name.trim()
          ? user.name.trim()
          : `discord-${discordId}`;

      const avatar = buildAvatarUrl(profile as any, user.image);
      const discriminator =
        typeof (profile as any)?.discriminator === "string"
          ? (profile as any).discriminator
          : undefined;

      const shouldBeOwner = owners.has(discordId);

      let existingUser =
        (await UserModel.findOne({ discordId })) ||
        (email ? await UserModel.findOne({ email }) : null);

      if (!existingUser) {
        const roles: RoleKey[] = shouldBeOwner
          ? [ROLES.OWNER, ROLES.ADMIN, ROLES.MEMBER]
          : [ROLES.MEMBER];

        existingUser = await UserModel.create({
          discordId,
          username,
          discriminator,
          avatar,
          email,
          roles,
          verified: false,
          accountAllowed: true,
          banned: false,
          ipBanned: false,
          openingFeeDue: false,
          paymentMethodAdded: false,
        });
      } else {
        const nextRoles = normalizeRoles(existingUser.roles);

        if (shouldBeOwner) {
          nextRoles.unshift(ROLES.OWNER, ROLES.ADMIN);
        }

        const update: Record<string, unknown> = {
          discordId,
          username: existingUser.username || username,
          discriminator: existingUser.discriminator || discriminator,
          avatar: existingUser.avatar || avatar,
          email: existingUser.email || email,
          roles: Array.from(new Set(normalizeRoles(nextRoles))),
        };

        await UserModel.updateOne({ _id: existingUser._id }, update);
        existingUser = await UserModel.findById(existingUser._id);
      }

      if (!existingUser) {
        return false;
      }

      if (existingUser.banned || existingUser.accountAllowed === false) {
        return "/banned";
      }

      (user as any).id = String(existingUser._id);
      (user as any).discordId = existingUser.discordId;
      (user as any).name = existingUser.username;
      (user as any).email = existingUser.email;
      (user as any).image = existingUser.avatar;
      (user as any).roles = normalizeRoles(existingUser.roles);
      (user as any).verified = Boolean(existingUser.verified);
      (user as any).banned = Boolean(existingUser.banned);
      (user as any).accountAllowed = existingUser.accountAllowed !== false;
      (user as any).openingFeeDue = Boolean(existingUser.openingFeeDue);
      (user as any).paymentMethodAdded = Boolean(existingUser.paymentMethodAdded);

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.discordId = (user as any).discordId;
        token.roles = normalizeRoles((user as any).roles);
        token.verified = Boolean((user as any).verified);
        token.banned = Boolean((user as any).banned);
        token.accountAllowed = (user as any).accountAllowed !== false;
        token.openingFeeDue = Boolean((user as any).openingFeeDue);
        token.paymentMethodAdded = Boolean((user as any).paymentMethodAdded);
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).discordId = token.discordId;
        (session.user as any).roles = normalizeRoles(token.roles);
        (session.user as any).verified = Boolean(token.verified);
        (session.user as any).banned = Boolean(token.banned);
        (session.user as any).accountAllowed = token.accountAllowed !== false;
        (session.user as any).openingFeeDue = Boolean(token.openingFeeDue);
        (session.user as any).paymentMethodAdded = Boolean(token.paymentMethodAdded);
        session.user.name = typeof token.name === "string" ? token.name : session.user.name;
        session.user.email = typeof token.email === "string" ? token.email : session.user.email;
        session.user.image = typeof token.picture === "string" ? token.picture : session.user.image;
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
