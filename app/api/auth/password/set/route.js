const { NextResponse } = require("next/server");

const session = require("@/src/server/auth/session");
const User = require("@/models/User");
const { setPasswordForUser } = require("@/src/server/auth/passwordAuth");

/*
 * API route: set or update password for the currently logged-in user.
 * Requires a valid session cookie. Body: { password }
 */

async function POST(req) {
  try {
    const cookiesHeader = req.headers.get("cookie") || "";
    const match = cookiesHeader.match(new RegExp(`${session.SESSION_COOKIE}=([^;]+)`));
    const sessionId = match ? match[1] : null;

    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const sess = session.getSession(sessionId);
    if (!sess) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const user = await User.findById(sess.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { password } = body || {};

    // This validates length and sets passwordHash + passwordEnabled
    const updated = await setPasswordForUser(user._id, password);

    return NextResponse.json({
      success: true,
      user: typeof updated.toJSON === "function" ? updated.toJSON() : updated,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to set password" },
      { status: err.status || 500 }
    );
  }
}

module.exports = { POST };
