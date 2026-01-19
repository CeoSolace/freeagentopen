const crypto = require("crypto");

const SESSION_COOKIE = process.env.COOKIE_NAME || "freeagent_session";

// In-memory sessions: { sessionId -> { userId, createdAt } }
// NOTE: Not durable across restarts. Replace with DB/Redis later.
const _sessions = new Map();

function createSession(userId) {
  const sessionId = crypto.randomBytes(32).toString("hex");
  _sessions.set(sessionId, { userId: String(userId), createdAt: new Date() });
  return sessionId;
}

function getSession(sessionId) {
  return _sessions.get(sessionId) || null;
}

function destroySession(sessionId) {
  _sessions.delete(sessionId);
}

function destroyAllForUser(userId) {
  const uid = String(userId);
  for (const [sid, sess] of _sessions.entries()) {
    if (String(sess.userId) === uid) _sessions.delete(sid);
  }
}

module.exports = {
  SESSION_COOKIE,
  createSession,
  getSession,
  destroySession,
  destroyAllForUser,

  // kept for backward compatibility if other code pokes it
  _sessions,
};
