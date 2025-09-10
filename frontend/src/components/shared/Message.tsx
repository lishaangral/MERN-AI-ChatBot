// frontend/src/components/shared/Message.tsx
import React from "react";
import CodeRenderer from "./CodeRenderer";

type MessageType = {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  loading?: boolean;
  error?: boolean;
};

const Message: React.FC<{ message: MessageType }> = ({ message }) => {
  const isBot = message.role === "model";
  return (
    <div className={`message ${isBot ? "bot" : "user"} ${message.loading ? "loading" : ""} ${message.error ? "error" : ""}`}>
      {isBot && <div className="avatar">🤖</div>}
      <div className="message-body">
        {isBot ? <CodeRenderer source={message.content} /> : <div className="plain-text">{message.content}</div>}
      </div>
    </div>
  );
};

export default Message;
