import React, { useState } from "react";
import { ArrowUp } from "lucide-react";

type Props = {
  onSend: (promptText: string) => Promise<void> | void;
};

const PromptForm: React.FC<Props> = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <input
        className="prompt-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Message Gemini..."
      />
      <button type="submit" className="send-prompt-btn" aria-label="Send">
        <ArrowUp size={18} />
      </button>
    </form>
  );
};

export default PromptForm;
