"use client";

import { useEffect, useRef, useState } from "react";
import { diaMesHora } from "@/lib/fechas";

// Mismo límite que la API de soporte.
const MAX_CHARS = 2000;

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
  const [error, setError] = useState("");
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
    if (!value || sending) return;
    setSending(true);
    setError("");
    setText("");
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      fromAdmin: mode === "admin",
      body: value,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    // Si falla, fuera el mensaje optimista, el texto vuelve al cuadro y aviso:
    // antes se quedaba en pantalla como enviado aunque no hubiera llegado.
    const deshacer = (mensaje: string) => {
      setMessages((m) => m.filter((msg) => msg.id !== optimistic.id));
      setText((actual) => actual || value);
      setError(mensaje);
    };
    try {
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "admin" ? { userId, body: value } : { body: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.message) {
        deshacer(data.error ?? "No se pudo enviar el mensaje. Inténtalo de nuevo.");
        return;
      }
      setMessages((m) =>
        m.map((msg) => (msg.id === optimistic.id ? data.message : msg))
      );
    } catch {
      deshacer("No se pudo enviar: revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSending(false);
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
                  {diaMesHora(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {error && (
        <p role="alert" className="mx-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-100 p-3">
        <input
          className="input"
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          aria-label="Mensaje"
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-primary">
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
