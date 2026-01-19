"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!conversationId) return;

    let disposed = false;

    (async () => {
      try {
        setError(null);

        const res = await fetch("/api/chat/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ conversationId })
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Unable to join conversation: ${text || res.statusText}`);
        }

        // ✅ dynamic import prevents Next from bundling Node websocket deps
        const mod = await import("socket.io-client");
        const io = mod.io || mod.default;

        if (disposed) return;

        const socket = io({
          path: "/socket.io",
          transports: ["websocket"],
          withCredentials: true
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("join", { conversationId });
        });

        socket.on("history", (msgs) => {
          if (disposed) return;
          setMessages(Array.isArray(msgs) ? msgs : []);
          scrollToBottom();
        });

        socket.on("message", (msg) => {
          if (disposed) return;
          setMessages((prev) => [...prev, msg]);
          scrollToBottom();
        });

        socket.on("connect_error", (err) => {
          if (!disposed) setError(err?.message || "Socket connection error");
        });
      } catch (e) {
        if (!disposed) setError(e?.message || "Failed to join conversation");
      }
    })();

    return () => {
      disposed = true;

      fetch("/api/chat/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversationId })
      }).catch(() => {});

      if (socketRef.current) {
        try {
          socketRef.current.emit("leave", { conversationId });
          socketRef.current.close();
        } catch {}
        socketRef.current = null;
      }
    };
  }, [conversationId]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    const temp = {
      _id: Math.random().toString(36).slice(2),
      sender: "You",
      content: input,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, temp]);

    try {
      socketRef.current.emit("message", { conversationId, content: input });
    } catch {}

    setInput("");
    scrollToBottom();
  };

  return (
    <div style={{ padding: 20, height: "100vh", display: "flex", flexDirection: "column" }}>
      <h1>Conversation</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ flex: 1, overflowY: "auto", border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
        {messages.map((msg) => (
          <div key={msg._id || msg.id || Math.random()} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>
              {msg.sender} &bull; {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
            </div>
            <div>{msg.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1, marginRight: 8 }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
