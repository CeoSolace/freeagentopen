import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../app/api/auth/[...nextauth]/route";

type SessionUserApiResult =
  | {
      ok: false;
      response: NextResponse;
    }
  | {
      ok: true;
      user: {
        id: string;
        roles: string[];
      };
    };

export async function requireSessionUserApi(): Promise<SessionUserApiResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ok: true,
    user: {
      id: String((session.user as any).id),
      roles: Array.isArray((session.user as any).roles)
        ? (session.user as any).roles
        : [],
    },
  };
}
