/**
 * Displays a message when a user is banned or their IP is blocked. This page
 * is reached via middleware when the access state indicates a ban.
 */
export default function BannedPage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-3xl font-semibold mb-4">Access Denied</h2>
      <p className="mb-4">Your account or IP address has been banned from FreeAgentsLTD.</p>
      <p className="mb-4">If you believe this is a mistake please contact our support team.</p>
    </div>
  );
}