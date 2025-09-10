// frontend/src/components/shared/CodeRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {oneDark} from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * Simpler types to avoid depending on @types/react / JSX namespace.
 * We intentionally use `any` / `unknown` for renderer props so the file
 * does not reference React-specific types that require @types/react.
 */
type Props = { source: string };

type CodeRendererProps = {
  inline?: boolean;
  className?: string | undefined;
  children?: any;
  node?: unknown;
  [k: string]: unknown;
};

const CodeRenderer = (props: Props) => {
  const { source } = props;

  // Components object for react-markdown: code renderer uses plain types and returns `any`.
  const components: any = {
    code: (cprops: CodeRendererProps) => {
      const inline = !!cprops.inline;
      const className = (cprops.className ?? "") as string;
      const children = cprops.children ?? "";
      const cls = className.toString();
      const match = /language-(\w+)/.exec(cls);
      const lang = match ? match[1] : "";

      // Fenced code block with language -> use SyntaxHighlighter
      if (!inline && match) {
        const codeString = String(children).replace(/\n$/, "");
        // build DOM via React.createElement (no JSX)
        return React.createElement(
          "div",
          { style: { margin: "8px 0", borderRadius: 8, overflow: "hidden" } },
          React.createElement(
            SyntaxHighlighter,
            {
              language: lang,
              style: oneDark,
              PreTag: "div",
              showLineNumbers: true,
              wrapLongLines: true,
            },
            codeString
          )
        );
      }

      // Inline code fallback -> return a <code> element
      return React.createElement(
        "code",
        {
          style: {
            background: "rgba(255,255,255,0.03)",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: "0.95em",
          },
        },
        children
      );
    },
  };

  // Return ReactMarkdown element created via createElement to avoid JSX parsing
  return React.createElement(
    ReactMarkdown as any,
    {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeRaw, rehypeSanitize],
      components,
    },
    source
  );
};

export default CodeRenderer;
