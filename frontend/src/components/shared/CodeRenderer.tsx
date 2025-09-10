// frontend/src/components/shared/CodeRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import styles module as an object (robust to package versions)
import * as prismStyles from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = { source: string };

type CodeRendererProps = {
  inline?: boolean;
  className?: string | undefined;
  children: React.ReactNode;
  node?: unknown;
  [key: string]: unknown;
};

const CodeRenderer: React.FC<Props> = ({ source }) => {
  // pick a style safely
  // many versions include 'oneDark' -> try that first, otherwise fallback to a known style key
  const syntaxStyle: any = (prismStyles as any).oneDark ?? (prismStyles as any).atomDark ?? (prismStyles as any).prism;

  const components: {
    code: (props: CodeRendererProps) => JSX.Element | null;
    [key: string]: unknown;
  } = {
    code(props: CodeRendererProps) {
      const { inline, className, children } = props;
      const cls = (className ?? "").toString();
      const match = /language-(\w+)/.exec(cls);
      const lang = match ? match[1] : "";

      if (!inline && match) {
        const codeString = String(children).replace(/\n$/, "");
        return (
          <div style={{ margin: "8px 0", borderRadius: 8, overflow: "hidden" }}>
            <SyntaxHighlighter
              language={lang}
              style={syntaxStyle}
              PreTag="div"
              showLineNumbers
              wrapLongLines
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code
          style={{
            background: "rgba(255,255,255,0.03)",
            padding: "2px 6px",
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

export default CodeRenderer;
