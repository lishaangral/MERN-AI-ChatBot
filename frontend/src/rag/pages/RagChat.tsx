import React, { useState } from "react";
import { ragQuery } from "../../helpers/api-communicator";

const RagChat: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [chunks, setChunks] = useState<any[]>([]);

  const ask = async () => {
    const res = await ragQuery(projectId, query);
    setAnswer(res.answer);
    setChunks(res.chunks);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Ask a question</h2>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          marginTop: 12,
        }}
      />

      <button
        onClick={ask}
        style={{
          marginTop: 12,
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
        }}
      >
        Run RAG Query
      </button>

      <h3 style={{ marginTop: 24 }}>Answer</h3>
      <pre>{answer}</pre>

      <h4>Chunks used:</h4>
      <ul>
        {chunks.map((c, idx) => (
          <li key={idx}>{c}</li>
        ))}
      </ul>
    </div>
  );
};

export default RagChat;
