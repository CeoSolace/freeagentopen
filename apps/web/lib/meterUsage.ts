/*
 * Usage metering helper.
 *
 * This function records billable events such as message sends, post
 * creations or contract updates. The implementation forwards the event
 * details to the shared usage service defined by the `SHARED_SERVICE_URL`
 * environment variable. If that variable is undefined the function silently
 * resolves. When adding new meterable events ensure the event name and
 * quantity is agreed upon with the billing and infrastructure teams.
 */
const SHARED_SERVICE_URL = process.env.SHARED_SERVICE_URL;

export async function meterUsage(userId: string, event: string, quantity: number = 1): Promise<void> {
  if (!SHARED_SERVICE_URL) return;
  try {
    await fetch(`${SHARED_SERVICE_URL}/usage/meter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, event, quantity })
    });
  } catch (err) {
    // Intentionally swallow errors; metering should not block user actions.
    console.warn('Failed to meter usage', err);
  }
}
