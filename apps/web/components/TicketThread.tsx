"use client";
import { useState, useEffect, useRef } from 'react';
import Button from './Button';

interface TicketMessage {
  _id: string;
  ticketId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Props {
  ticketId: string;
  initialMessages: TicketMessage[];
}

/**
 * Displays and updates the message thread for a support ticket. Messages are
 * initially provided by the server. Users can send additional messages via
 * the form at the bottom. New messages are appended and the view scrolls
 * to the bottom.
 */
export default function TicketThread({ ticketId, initialMessages }: Props) {
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data.data]);
        setContent('');
      }
    } catch (err) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg._id} className="max-w-md px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            <span className="block text-xs mt-1 text-right opacity-70">
              {new Date(msg.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Reply..."
            className="flex-1 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2"
          />
          <Button onClick={handleSend} disabled={loading || !content.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}