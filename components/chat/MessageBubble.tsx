type MessageBubbleProps = {
  text: string;
  sender: "user" | "ai";
};

export default function MessageBubble({
  text,
  sender,
}: MessageBubbleProps) {
  return (
    <div
      className={`mb-4 flex ${
        sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          sender === "user"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        {text}
      </div>
    </div>
  );
}