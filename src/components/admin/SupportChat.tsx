"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { id: string; fromAdmin: boolean; body: string; createdAt: string };

// Chat de soporte reutilizable. mode="admin" conversa con `userId`; mode="user"
// usa el hilo propio del usuario autenticado. "Mío" = lo envió quien está mirando.
export default function SupportChat({
  mode,
  userId,
  initialMessages,
}: {
  mode: "admin" | "user";
  userId?: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const getUrl =
    mode === "admin" ? `/api/admin/support?userId=${userId}` : "/api/support";
  const postUrl = mode === "admin" ? "/api/admin/support" : "/api/support";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(getUrl);
        if (res.ok) setMessages((await res.json()).messages);
      } catch {
        /* silencioso */
      }
    }, 5000);
    return () => clearInterval(t);
  }, [getUrl]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setSending(true);
    setText("");
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      fromAdmin: mode === "admin",
      body: value,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    const res = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "admin" ? { userId, body: value } : { body: value }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((m) =>
        m.map((msg) => (msg.id === optimistic.id ? data.message : msg))
      );
    }
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-2xl border border-slate-100 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-400">
            Aún no hay mensajes. ¡Escribe el primero!
          </p>
        )}
        {messages.map((m) => {
          // "Mío" depende de quién mira: el admin ve a la derecha sus mensajes
          // (fromAdmin); el usuario ve a la derecha los suyos (!fromAdmin).
          const mine = mode === "admin" ? m.fromAdmin : !m.fromAdmin;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "rounded-br-sm bg-agua text-white"
                    : "rounded-bl-sm bg-espuma text-petroleo"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>
                  {new Date(m.createdAt).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
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
      <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-100 p-3">
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-primary">
          Enviar
        </button>
      </form>
    </div>
  );
}
