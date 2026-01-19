const { NextResponse } = require("next/server");

// Use TS path alias "@/..."
const { handleCallback } = require("@/src/server/auth/discordOAuth");

// IMPORTANT: models/User.js exports the model directly, not { User }
const User = require("@/models/User");

const session = require("@/src/server/auth/session");

/*
 * API route: handle Discord OAuth callback.
 * Expects JSON body containing { code } returned by Discord.
 * Exchanges code -> profile, then resolves/creates user, then sets session cookie.
 */

async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code } = body || {};

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const profile = await handleCallback(code);
    const user = await User.upsertFromDiscord(profile);

    // Create session ID using your session module
    // (Your module must expose createSession + SESSION_COOKIE)
    const sessionId = await session.createSession(user._id || user.id);

    const response = NextResponse.json({
      success: true,
      user: typeof user.toJSON === "function" ? user.toJSON() : user,
    });

    const secure = process.env.NODE_ENV === "production";

    response.cookies.set(session.SESSION_COOKIE || "freeagent_session", sessionId, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "OAuth callback failed";
    return NextResponse.json({ error: message }, { status });
  }
}

module.exports = { POST };
