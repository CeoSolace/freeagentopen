import NextAuth, { type AuthOptions, type DefaultSession } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { connectDB } from './mongoose';
import { UserModel } from '../models/user';
import { getAccessState } from './getAccessState';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roles: string[];
      verified: boolean;
      banned?: boolean;
      openingFeeDue?: boolean;
      paymentMethodAdded?: boolean;
      accountAllowed?: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    roles?: string[];
    verified?: boolean;
    banned?: boolean;
    accountAllowed?: boolean;
    openingFeeDue?: boolean;
    paymentMethodAdded?: boolean;
  }
}

export const authOptions: AuthOptions = {
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'identify email guilds'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ profile }) {
      await connectDB();

      const discordUser = profile as any;
      const discordId = discordUser?.id;

      if (!discordId) {
        return false;
      }

      let dbUser = await UserModel.findOne({ discordId });

      if (!dbUser) {
        dbUser = await UserModel.create({
          discordId,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          email: discordUser.email,
          roles: ['MEMBER'],
          accountAllowed: true,
          verified: false
        });
      } else {
        dbUser.username = discordUser.username;
        dbUser.discriminator = discordUser.discriminator;
        dbUser.avatar = discordUser.avatar;
        dbUser.email = discordUser.email;
        await dbUser.save();
      }

      const state = getAccessState(dbUser as any);

      if (!state.allowed && state.banned) {
        return false;
      }

      return true;
    },

    async jwt({ token, profile }) {
      const discordProfile = profile as any;

      try {
        await connectDB();

        let dbUser = null;

        if (discordProfile?.id) {
          dbUser = await UserModel.findOne({ discordId: discordProfile.id });
        } else if (token?.id) {
          dbUser = await UserModel.findById(token.id);
        }

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.roles = dbUser.roles || ['MEMBER'];
          token.verified = !!dbUser.verified;
          token.banned = !!dbUser.banned;
          token.accountAllowed = dbUser.accountAllowed !== false;
          token.openingFeeDue = !!dbUser.openingFeeDue;
          token.paymentMethodAdded = !!dbUser.paymentMethodAdded;
        }
      } catch (err) {
        console.warn('Failed to hydrate JWT token:', err);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || '';
        session.user.roles = token.roles || ['MEMBER'];
        session.user.verified = !!token.verified;
        session.user.banned = !!token.banned;
        session.user.openingFeeDue = !!token.openingFeeDue;
        session.user.paymentMethodAdded = !!token.paymentMethodAdded;
        session.user.accountAllowed = token.accountAllowed !== false;
      }

      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  }
};

export const handler = NextAuth(authOptions);
