import { useEffect, useMemo, useRef, useState } from "react";

export default function ChatPanel({ messages, currentUserId, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const uniqueMessages = useMemo(() => {
    const seen = new Set();

    return messages.filter((message) => {
      const id = message.id;

      if (seen.has(id)) {
        return false;
      }

      seen.add(id);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [uniqueMessages.length]);

  function submit(e) {
    e.preventDefault();

    const trimmed = text.trim();

    if (!trimmed) return;

    onSend(trimmed);
    setText("");
  }

  return (
    <div className="flex h-full flex-col rounded-xl border-2 border-[#2438F0] bg-[#141A40]">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-bold text-[#F5F6FF]">
          Chat
        </h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {uniqueMessages.length === 0 && (
          <p className="text-sm text-white/55">
            No messages yet. Say hello to the room.
          </p>
        )}

        {uniqueMessages.map((m, index) => (
          <div
            key={`${m.id}-${index}`}
            className={`max-w-[85%] ${
              m.userId === currentUserId
                ? "ml-auto text-right"
                : ""
            }`}
          >
            <div className="text-xs">
              <span className="font-semibold text-white/80">
                {m.username}
              </span>{" "}
              <span className="text-white/45">
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div
              className={`mt-1 inline-block rounded-lg px-3 py-1.5 text-left text-sm ${
                m.userId === currentUserId
                  ? "bg-[#FFD23F] text-[#0E1330]"
                  : "bg-[#2438F0] text-white"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={submit}
        className="flex gap-2 border-t border-white/10 p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="Type a message…"
          className="w-full rounded-lg border-2 border-white/15 bg-[#0E1330] px-3 py-2 text-sm text-[#F5F6FF] placeholder:text-white/40 focus:border-[#FFD23F] focus:outline-none focus:ring-4 focus:ring-[#FFD23F]/20"
        />

        <button
          type="submit"
          className="shrink-0 rounded-lg bg-[#FFD23F] px-4 py-2 text-sm font-bold text-[#0E1330] transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD23F]/40"
        >
          Send
        </button>
      </form>
    </div>
  );
}