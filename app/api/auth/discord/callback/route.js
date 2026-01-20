const { NextResponse } = require("next/server");

// TS alias works in Next App Router
const { handleCallback } = require("@/src/server/auth/discordOAuth");

// IMPORTANT: User model is default export
const User = require("@/models/User");

const session = require("@/src/server/auth/session");

/**
 * Discord OAuth callback
 * Discord ALWAYS redirects with GET:
 * /api/auth/discord/callback?code=...&state=...
 */
async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Missing OAuth code" },
        { status: 400 }
      );
    }

    // Exchange code → Discord profile
    const profile = await handleCallback(code);

    // Create or update user
    const user = await User.upsertFromDiscord(profile);

    // Create session
    const sessionId = await session.createSession(
      user._id?.toString() || user.id
    );

    // Redirect response (OAuth best practice)
    const response = NextResponse.redirect(
      `${process.env.BASE_URL || ""}/dashboard`
    );

    const secure = process.env.NODE_ENV === "production";

    response.cookies.set(
      session.SESSION_COOKIE || "freeagent_session",
      sessionId,
      {
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      }
    );

    return response;
  } catch (err) {
    return NextResponse.json(
      {
        error: err?.message || "Discord OAuth failed",
      },
      { status: err?.status || 500 }
    );
  }
}

module.exports = { GET };
