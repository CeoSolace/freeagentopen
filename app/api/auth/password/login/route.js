const { NextResponse } = require("next/server");

const User = require("@/models/User");
const { verifyPasswordLogin } = require("@/src/server/auth/passwordAuth");
const session = require("@/src/server/auth/session");

/*
 * API route: log in with email + password.
 * Body: { email, password }
 * Sets a session cookie on success.
 */

async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await verifyPasswordLogin(email, password);

    user.lastLoginAt = new Date();
    await user.save();

    const sessionId = session.createSession(user._id);

    const response = NextResponse.json({
      success: true,
      user: typeof user.toJSON === "function" ? user.toJSON() : user,
    });

    const secure = process.env.NODE_ENV === "production";
    response.cookies.set(session.SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    const status = err.status || 500;
    const msg = err.message || "Login failed";
    return NextResponse.json({ error: msg }, { status });
  }
}

module.exports = { POST };
