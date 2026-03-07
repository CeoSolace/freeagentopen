
/*
 * Discord integration client.
 *
 * The functions in this file abstract away calls to the Discord bot/worker
 * service. Environment variables configure the base URL for these calls. In
 * production the bot worker handles assigning roles, validating verification
 * tokens and onboarding users to the guild. If these calls fail the caller
 * should handle the error appropriately (e.g. by showing an error message
 * or retrying later).
 */

const BOT_WORKER_URL = process.env.BOT_WORKER_URL || '';

async function request(path: string, options: RequestInit = {}) {
  const url = `${BOT_WORKER_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    throw new Error(`Discord request failed: ${res.status}`);
  }
  return res.json();
}

export async function validateVerifyToken(token: string) {
  return request(`/verify/validate`, { method: 'POST', body: JSON.stringify({ token }) });
}

export async function assignMemberRole(userId: string) {
  return request(`/discord/assign-role`, {
    method: 'POST',
    body: JSON.stringify({ userId, role: process.env.DISCORD_MEMBER_ROLE_ID })
  });
}

export async function joinGuild(userId: string) {
  return request(`/discord/join-guild`, { method: 'POST', body: JSON.stringify({ userId }) });
}
