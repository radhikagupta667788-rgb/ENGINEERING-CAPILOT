"use client";

import { Message } from "./ChatArea";

type Chat = {
  id: number;
  title: string;
  messages: Message[];
};

type ChatSidebarProps = {
  chats: Chat[];
  activeChatId: number | null;
  onNewChat: () => void;
  onSelectChat: (id: number) => void;
};

export default function ChatSidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
}: ChatSidebarProps) {
  return (
    <aside className="w-72 border-r bg-white p-4">
      <button
        onClick={onNewChat}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
      >
        ➕ New Chat
      </button>

      <div className="mt-6 space-y-2">
        {chats.length === 0 ? (
          <p className="text-sm text-gray-500">
            No chats yet.
          </p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full rounded-lg p-3 text-left ${
                activeChatId === chat.id
                  ? "bg-blue-100"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              💬 {chat.title}
            </button>
          ))
        )}
      </div>
    </aside>
  );
}