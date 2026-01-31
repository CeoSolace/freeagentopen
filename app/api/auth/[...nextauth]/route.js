// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: 'identify email guilds' } }, // For guild access if needed
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Remove explicit 'jwt' strategy to default to 'database' with adapter
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
        session.user.discordId = user.discordId; // If 'discordId' is stored in user model
      }
      return session;
    },
    // JWT callback can be retained if needed for custom token handling, but not required for database strategy
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.discordId = profile.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin', // Custom if you have one
  },
  cookies: {
    sessionToken: {
      name: process.env.COOKIE_NAME || '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
        secure: process.env.COOKIE_SECURE === 'true',
      },
    },
    csrfToken: {
      name: process.env.COOKIE_NAME ? `${process.env.COOKIE_NAME}.csrf` : '__Host-next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
        secure: process.env.COOKIE_SECURE === 'true',
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
