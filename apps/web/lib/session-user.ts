import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../app/api/auth/[...nextauth]/route";

export async function requireSessionUserApi() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  return {
    ok: true,
    user: {
      id: (session.user as any).id,
      roles: (session.user as any).roles || []
    }
  };
}
