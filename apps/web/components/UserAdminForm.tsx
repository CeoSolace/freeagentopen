"use client";
import { useState } from 'react';
import Button from './Button';

interface UserData {
  _id: string;
  username: string;
  roles: string[];
  banned?: boolean;
  accountAllowed?: boolean;
}

const allRoles = ['OWNER', 'ADMIN', 'MOD', 'SUPPORT', 'MEMBER'];

/**
 * Form for editing a user's roles and ban/account status. The admin can
 * toggle individual roles and mark an account as banned or disallowed. On
 * submit the form calls the admin API to persist changes.
 */
export default function UserAdminForm({ user }: { user: UserData }) {
  const [roles, setRoles] = useState<string[]>(user.roles);
  const [banned, setBanned] = useState<boolean>(!!user.banned);
  const [accountAllowed, setAccountAllowed] = useState<boolean>(user.accountAllowed !== false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleRole = (role: string) => {
    setRoles(prev => (prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles, banned, accountAllowed })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <h3 className="text-lg font-semibold mb-2">Roles</h3>
        <div className="grid grid-cols-2 gap-2">
          {allRoles.map(role => (
            <label key={role} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={roles.includes(role)}
                onChange={() => toggleRole(role)}
                className="rounded border-gray-300 dark:border-gray-700"
                disabled={role === 'OWNER'}
              />
              <span>{role}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Owner role cannot be changed.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={banned}
            onChange={e => setBanned(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-700"
          />
          <span>Banned</span>
        </label>
        <label className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            checked={accountAllowed}
            onChange={e => setAccountAllowed(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-700"
          />
          <span>Account Allowed</span>
        </label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}