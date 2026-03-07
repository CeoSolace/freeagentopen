"use client";
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Button from './Button';

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content?: string;
  imageUrl?: string;
  createdAt: string;
}

interface Props {
  conversationId: string;
}

/**
 * Client component that renders a message thread for a given conversation. It
 * fetches the latest 50 messages and allows the user to send new messages.
 * Optional image attachments are uploaded to Cloudinary via a signed request.
 */
export default function MessageThread({ conversationId }: Props) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages on mount and when conversationId changes
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages?conversationId=${conversationId}`);
        if (res.ok) {
          const { data } = await res.json();
          // Sort ascending by createdAt for natural order
          const sorted = data.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setMessages(sorted);
          // scroll to bottom
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      } catch (err) {
        /* ignore */
      }
    }
    fetchMessages();
  }, [conversationId]);

  // Submit handler for sending a message
  const handleSend = async () => {
    if (!content.trim() && !file) return;
    setLoading(true);
    let imageUrl: string | undefined;
    try {
      // If a file is selected upload it to Cloudinary via signed upload
      if (file) {
        const signRes = await fetch('/api/upload/sign-cloudinary');
        if (!signRes.ok) throw new Error('Failed to sign upload');
        const { signature, timestamp, cloudName, apiKey } = await signRes.json();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);
        // Perform the actual upload. Cloudinary returns secure_url in response
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Upload failed');
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.secure_url;
      }
      // Send message to API
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content: content.trim(), imageUrl })
      });
      if (res.ok) {
        const { data } = await res.json();
        setMessages(prev => [...prev, data]);
        setContent('');
        setFile(null);
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
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
          <div
            key={msg._id}
            className={
              'max-w-md px-3 py-2 rounded-lg ' +
              (msg.senderId === (session?.user as any)?.id ? 'ml-auto bg-primary text-white' : 'mr-auto bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100')
            }
          >
            {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
            {msg.imageUrl && (
              <img src={msg.imageUrl} alt="attachment" className="mt-2 max-h-48 rounded-md" />
            )}
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
            placeholder="Type your message..."
            className="flex-1 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-600 dark:text-gray-300"
          />
          <Button onClick={handleSend} disabled={loading || (!content.trim() && !file)}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}