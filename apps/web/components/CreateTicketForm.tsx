"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';

/**
 * Form to open a new support ticket. Takes a subject and an initial message.
 * On successful creation the user is redirected to the ticket detail page.
 */
export default function CreateTicketForm() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create ticket');
      } else {
        router.push(`/support/tickets/${data.data._id}`);
      }
    } catch (err) {
      setError('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-2">Open a Support Ticket</h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !subject.trim() || !message.trim()}>
          Create Ticket
        </Button>
      </div>
    </form>
  );
}