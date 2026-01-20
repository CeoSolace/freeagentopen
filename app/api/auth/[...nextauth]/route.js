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
      authorization: { params: { scope: 'identify email guilds' } },  // For guild access if needed
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.discordId = token.discordId;  // Custom if needed
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.discordId = profile.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',  // Custom if you have one
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
