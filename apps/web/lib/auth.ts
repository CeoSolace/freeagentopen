import NextAuth, { AuthOptions, User as NextAuthUser, Session, DefaultSession } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { connectDB } from './mongoose';
import { UserModel, IUser } from '../models/user';
import { getAccessState } from './getAccessState';

/**
 * Extend the default session so that we can attach additional properties to it.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles: string[];
      verified: boolean;
    } & DefaultSession['user'];
  }
  interface User extends NextAuthUser {
    roles: string[];
    verified: boolean;
  }
}

/**
 * The NextAuth configuration object. Only the Discord OAuth provider is
 * configured. A JWT session strategy is used so that we can embed the user
 * identifier and roles into the token. On sign‑in the user is upserted into
 * the database and the access state is computed to decide whether to allow
 * authentication.
 */
export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: { params: { scope: 'identify guilds email' } }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // When a Discord account signs in we ensure the user exists in our DB.
      await connectDB();
      const discordUser = profile as any;
      const discordId = discordUser?.id;
      if (!discordId) return false;
      // Upsert the user record.
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
        // Update fields on subsequent logins.
        dbUser.username = discordUser.username;
        dbUser.discriminator = discordUser.discriminator;
        dbUser.avatar = discordUser.avatar;
        dbUser.email = discordUser.email;
        await dbUser.save();
      }
      // Compute access state; if banned or blocked return false to deny sign in.
      const state = getAccessState(dbUser);
      if (!state.allowed && state.banned) {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      // When a user logs in the `user` argument is defined. Persist
      // identifying fields on the token. On subsequent calls retrieve the
      // latest user record from the database so that banning/verification
      // changes are reflected without requiring a new login.
      if (user) {
        token.id = (user as any).id || (user as any)._id;
        token.roles = (user as any).roles || ['MEMBER'];
        token.verified = (user as any).verified || false;
        token.banned = (user as any).banned || false;
        token.accountAllowed = (user as any).accountAllowed !== false;
        token.openingFeeDue = (user as any).openingFeeDue || false;
        token.paymentMethodAdded = (user as any).paymentMethodAdded || false;
      } else if (token?.id) {
        // refresh token with latest user state on subsequent calls
        try {
          await connectDB();
          const dbUser = await UserModel.findById(token.id);
          if (dbUser) {
            token.roles = dbUser.roles;
            token.verified = dbUser.verified;
            token.banned = dbUser.banned;
            token.accountAllowed = dbUser.accountAllowed !== false;
            token.openingFeeDue = dbUser.openingFeeDue;
            token.paymentMethodAdded = dbUser.paymentMethodAdded;
          }
        } catch (err) {
          console.warn('Failed to refresh JWT token:', err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Propagate JWT fields to the session so they are available client‑side.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as string[]) || ['MEMBER'];
        session.user.verified = (token.verified as boolean) || false;
        (session.user as any).banned = token.banned as boolean;
        (session.user as any).openingFeeDue = token.openingFeeDue as boolean;
        (session.user as any).paymentMethodAdded = token.paymentMethodAdded as boolean;
        (session.user as any).accountAllowed = token.accountAllowed as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  }
};

// Helper to initialise NextAuth for both GET and POST handlers in the route
export const handler = NextAuth(authOptions);
