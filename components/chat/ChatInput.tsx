"use client";

import { useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (trimmedMessage === "") return;

    onSend(trimmedMessage);
    setMessage("");
  };

  return (
    <div className="flex gap-3 border-t bg-white p-4">
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSend();
          }
        }}
        placeholder="Ask your engineering doubt..."
        className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
      />

      <button
        onClick={handleSend}
        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
}