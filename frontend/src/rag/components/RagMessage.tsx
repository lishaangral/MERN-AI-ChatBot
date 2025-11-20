import React from "react";
import RagCodeRenderer from "./RagCodeRenderer";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

const RagMessage: React.FC<{ message: Msg }> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        marginBottom: 18,
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          background: isUser
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0.04)",
          padding: "12px 14px",
          borderRadius: 10,
          fontSize: 15,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
        }}
      >
        {isUser ? (
          message.content
        ) : (
          <RagCodeRenderer source={message.content} />
        )}
      </div>
    </div>
  );
};

export default RagMessage;
