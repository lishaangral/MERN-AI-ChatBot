// frontend/src/rag/components/RagCodeRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as prismStyles from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = { source: string };

const RagCodeRenderer: React.FC<Props> = ({ source }) => {
  const syntaxStyle: any =
    (prismStyles as any).oneDark ??
    (prismStyles as any).atomDark ??
    (prismStyles as any).prism;

  const components: Record<string, any> = {
    code({ inline, className, children }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const lang = match ? match[1] : "";

      if (!inline && match) {
        return (
          <SyntaxHighlighter
            language={lang}
            style={syntaxStyle}
            wrapLongLines
            showLineNumbers
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        );
      }

      return (
        <code
          style={{
            background: "rgba(255,255,255,0.07)",
            padding: "2px 5px",
            borderRadius: 4,
            fontSize: "0.95em",
          }}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={components}
    >
      {source}
    </ReactMarkdown>
  );
};

export default RagCodeRenderer;
