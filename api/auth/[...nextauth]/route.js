// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { prisma } from "../../../lib/prisma"; // Adjust path

export const authOptions = {
  // adapter: PrismaAdapter(prisma), // Uncomment if using Prisma adapter
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Add more config as per your README (e.g., callbacks for user creation)
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
