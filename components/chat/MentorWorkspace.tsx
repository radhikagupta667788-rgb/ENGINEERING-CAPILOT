"use client";

import { useRef, useState } from "react";
import ChatArea, { Message } from "./ChatArea";
import ChatSidebar from "./ChatSidebar";

type Chat = {
  id: number;
  title: string;
  messages: Message[];
};

export default function MentorWorkspace() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const activeChatIdRef = useRef<number | null>(null);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) || null;

  const handleNewChat = () => {
    activeChatIdRef.current = null;
    setActiveChatId(null);
  };

  const handleSelectChat = (id: number) => {
    activeChatIdRef.current = id;
    setActiveChatId(id);
  };

  const handleMessagesChange = (updatedMessages: Message[]) => {
    const currentChatId = activeChatIdRef.current;

    if (currentChatId === null) {
      const firstUserMessage = updatedMessages.find(
        (message) => message.sender === "user"
      );

      if (!firstUserMessage) return;

      const newChatId = Date.now();

      const newChat: Chat = {
        id: newChatId,
        title: firstUserMessage.text.slice(0, 30),
        messages: updatedMessages,
      };

      // Ref turant update hota hai, isliye AI reply nayi chat nahi banayega
      activeChatIdRef.current = newChatId;
      setActiveChatId(newChatId);

      setChats((previousChats) => [
        newChat,
        ...previousChats,
      ]);

      return;
    }

    setChats((previousChats) =>
      previousChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: updatedMessages,
            }
          : chat
      )
    );
  };

  return (
    <div className="flex">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      <div className="flex-1">
        <ChatArea
          messages={activeChat?.messages || []}
          onMessagesChange={handleMessagesChange}
        />
      </div>
    </div>
  );
}