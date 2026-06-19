"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export default function ChatThread({
  bookingId,
  currentUserId,
  initialMessages,
}: {
  bookingId: string;
  currentUserId: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Polling sencillo cada 5s para traer mensajes nuevos
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages?bookingId=${bookingId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch {
        /* silencioso */
      }
    }, 5000);
    return () => clearInterval(t);
  }, [bookingId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setText("");
    // Optimista
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      senderId: currentUserId,
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, body }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((m) =>
        m.map((msg) =>
          msg.id === optimistic.id
            ? {
                id: data.message.id,
                senderId: data.message.senderId,
                body: data.message.body,
                createdAt: data.message.createdAt,
              }
            : msg
        )
      );
    }
  }

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-400">
            Aún no hay mensajes. ¡Escribe el primero!
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "rounded-br-sm bg-agua text-white"
                    : "rounded-bl-sm bg-espuma text-petroleo"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    mine ? "text-white/70" : "text-slate-400"
                  }`}
                >
                  {new Date(m.createdAt).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-slate-100 p-3"
      >
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="btn-primary"
        >
          Enviar
        </button>
      </form>
    </>
  );
}
