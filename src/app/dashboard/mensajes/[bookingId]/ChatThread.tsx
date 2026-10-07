"use client";

import { useEffect, useRef, useState } from "react";
import { hora } from "@/lib/fechas";

// Mismo límite que la API (/api/messages).
const MAX_CHARS = 2000;

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
  const [error, setError] = useState("");
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
    if (!body || sending) return;
    setSending(true);
    setError("");
    setText("");
    // Optimista
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      senderId: currentUserId,
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    // Si el envío falla, el mensaje no puede quedarse en pantalla como si se
    // hubiera enviado: se quita, el texto vuelve al cuadro y se avisa.
    const deshacer = (mensaje: string) => {
      setMessages((m) => m.filter((msg) => msg.id !== optimistic.id));
      setText((actual) => actual || body);
      setError(mensaje);
    };
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.message) {
        deshacer(data.error ?? "No se pudo enviar el mensaje. Inténtalo de nuevo.");
        return;
      }
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
    } catch {
      deshacer("No se pudo enviar: revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSending(false);
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
                  {hora(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p
          role="alert"
          className="mx-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}
      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-slate-100 p-3"
      >
        <input
          className="input"
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          aria-label="Mensaje"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="btn-primary"
        >
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </>
  );
}
