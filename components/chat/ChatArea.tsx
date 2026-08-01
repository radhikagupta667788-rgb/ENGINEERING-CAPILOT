"use client";

import { useState } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

export type Message = {
  text: string;
  sender: "user" | "ai";
};

type ChatAreaProps = {
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
};

export default function ChatArea({
  messages,
  onMessagesChange,
}: ChatAreaProps) {
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    if (loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      {
        text: message,
        sender: "user",
      },
    ];

    onMessagesChange(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI response failed.");
      }

      onMessagesChange([
        ...updatedMessages,
        {
          text: data.reply,
          sender: "ai",
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      onMessagesChange([
        ...updatedMessages,
        {
          text: `Error: ${errorMessage}`,
          sender: "ai",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-113px)] flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            text={message.text}
            sender={message.sender}
          />
        ))}

        {loading && (
          <p className="text-sm text-gray-500">
            AI is thinking...
          </p>
        )}
      </div>

      <ChatInput onSend={sendMessage} />
    </div>
  );
}