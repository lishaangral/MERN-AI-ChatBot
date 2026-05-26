import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks"; // FORCES SINGLE NEWLINES TO BREAK
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, Code2 } from "lucide-react";

// function formatMarkdown(content: string) {
//   if (!content) return "";

//   let text = content
//     .replace(/\r\n/g, "\n")
//     .replace(/'''/g, "```");

//   // 1. Ensure any line ending with a colon or starting with a Bold/Inline-code title gets padding and becomes a subheading
//   text = text.replace(
//     /^([\w\s\d\\/\-\\.\\(\\)\\`\\*]+:)$/gm,
//     "\n\n### $1\n\n"
//   );

//   // 2. Clear out any accidentally created triple newlines
//   text = text.replace(/\n{3,}/g, "\n\n");

//   // 3. Ensure distinct paragraphs that don't have double spacing get separated properly
//   // This looks for single newlines between blocks of text and splits them into real paragraphs
//   const lines = text.split("\n");
//   const processedLines = lines.map((line, index) => {
//     const nextLine = lines[index + 1];
//     // If current line has text, and next line has text, and neither is a list or code block, insert a paragraph break
//     if (
//       line.trim() && 
//       nextLine && 
//       nextLine.trim() && 
//       !line.trim().startsWith("-") && 
//       !line.trim().startsWith("*") &&
//       !line.trim().startsWith("#") &&
//       !line.trim().startsWith("`") &&
//       !line.startsWith(" ") &&
//       !nextLine.trim().startsWith("-") &&
//       !nextLine.trim().startsWith("*") &&
//       !nextLine.trim().startsWith("#")
//     ) {
//       return line + "\n"; // Adds an extra newline to force a new markdown paragraph
//     }
//     return line;
//   });

//   return processedLines.join("\n").trim();
// }

function formatMarkdown(content: string) {
  if (!content) return "";

  let text = content
    .replace(/\r\n/g, "\n")
    .replace(/'''/g, "```");

  // This isolates code blocks so remark-breaks doesn't turn them into text paragraphs
  text = text.replace(/\n*(```\w*)\n*/g, "\n\n$1\n");

  // 1. Ensure any line ending with a colon or starting with a Bold/Inline-code title gets padding and becomes a subheading
  text = text.replace(
    /^([\w\s\d\\/\-\\.\\(\\)\\`\\*]+:)$/gm,
    "\n\n### $1\n\n"
  );

  // 2. Clear out any accidentally created triple newlines
  text = text.replace(/\n{3,}/g, "\n\n");

  // 3. Ensure distinct paragraphs that don't have double spacing get separated properly
  const lines = text.split("\n");
  let inCodeBlock = false;

  const processedLines = lines.map((line, index) => {
    // Track if we are inside a code block to avoid modifying internal code newlines
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    if (inCodeBlock) return line;

    const nextLine = lines[index + 1];
    if (
      line.trim() && 
      nextLine && 
      nextLine.trim() && 
      !line.trim().startsWith("-") && 
      !line.trim().startsWith("*") &&
      !line.trim().startsWith("#") &&
      !line.trim().startsWith("`") &&
      !line.startsWith(" ") &&
      !nextLine.trim().startsWith("-") &&
      !nextLine.trim().startsWith("*") &&
      !nextLine.trim().startsWith("```") && // Don't inject lines right before a code block
      !nextLine.trim().startsWith("#")
    ) {
      return line + "\n"; 
    }
    return line;
  });

  return processedLines.join("\n").trim();
}

export default function MarkdownMessage({
  content,
}: {
  content: string;
}) {
  return (
    <div
      className="
        min-w-0
        max-w-none
        overflow-hidden
        break-words
        prose
        prose-invert
        prose-neutral
        
        /* Explicit paragraph layout adjustments */
        prose-p:my-6
        prose-p:block
        prose-p:leading-8
        prose-p:text-white/90
        
        prose-ul:my-6
        prose-ul:pl-6
        prose-ol:my-6
        prose-ol:pl-6
        prose-li:my-3
        prose-li:leading-8
        
        prose-pre:bg-transparent
        prose-pre:my-8
        prose-strong:text-white
        prose-strong:font-bold
      "
    >
      <ReactMarkdown
        // remarkBreaks solves the continuous single-line string blending bug
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Main headings override
          h2({ children }) {
            return (
              <h2 className="not-prose text-3xl font-bold tracking-tight text-white mt-12 mb-6 block border-b border-white/10 pb-3">
                {children}
              </h2>
            );
          },
          // Subheadings override (e.g. "Save:", "Compile:", "Update Course.java...")
          h3({ children }) {
            return (
              <h3 className="not-prose text-xl font-bold tracking-tight text-white mt-8 mb-3 block">
                {children}
              </h3>
            );
          },
          // Direct element level formatting for paragraphs to guarantee layout execution
          p({ children }) {
            return (
              <p className="not-prose my-5 block text-[1rem] leading-7 text-white/90">
                {children}
              </p>
            );
          },
          code({
            inline,
            className,
            children,
          }: {
            inline?: boolean;
            className?: string;
            children: React.ReactNode;
          }) {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");

            if (!inline && match) {
              return <CodeBlock language={match[1]} code={code} />;
            }

            return (
              <code className="rounded bg-white/[0.08] px-1.5 py-[2px] text-[0.85rem] text-white font-mono break-words whitespace-pre-wrap inline">
                {children}
              </code>
            );

          },
        }}
      >
        {formatMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Code2 className="h-4 w-4" />
          <span className="capitalize">{language}</span>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-white/70 transition-all hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* CODE */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem 1.25rem",
          background: "transparent",
          fontSize: "0.85rem",
          lineHeight: "1.6",
        }}
        // FORCES INTERNAL LINES TO DROP THEIR DEFAULTS BACKDROP
        codeTagProps={{
          style: {
            background: "transparent",
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
