import { useEffect } from "react";
import Markdown from "markdown-to-jsx";
import { Code, Link, AlertTriangle } from "lucide-react";

interface MarkdownEditorProps {
  data: string;
  editable?: boolean;
}

const MarkdownEditor = ({ data, editable = false }: MarkdownEditorProps) => {
  // Process content to handle common issues
  const processedContent = data
    ? data
        .replace(/\\"/g, '"') // Handle escaped quotes
        .replace(/\\n/g, '\n') // Fix escaped newlines
        .replace(/^"|"$/g, '') // Remove surrounding quotes if present
    : "No content available yet.";

    console.log("[MarkdownEditor] Rendered with data:", processedContent);
    
  useEffect(() => {
    // Scroll to top when content changes
    window.scrollTo(0, 0);
    
    return () => {
      console.log("[MarkdownEditor] Cleanup triggered");
    };
  }, [data]);

  return (
    <div className="flex flex-col mx-auto gap-4 w-full max-w-6xl">
      <div className="border border-gray-200 p-4 sm:p-6 md:p-8 rounded-lg bg-white 
                    overflow-hidden transition-all duration-300">
        {data ? (
          <Markdown
            options={{
              overrides: {
                h1: {
                  component: ({ children }: any) => (
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 mt-2 
                                  border-b border-gray-200 pb-2">{children}</h1>
                  ),
                },
                h2: {
                  component: ({ children }: any) => {
                    // Clean up titles - remove duplicate numbers and backslashes
                    let cleanTitle = children;
                    if (typeof children === 'string') {
                      cleanTitle = children
                        .replace(/Chapter\s+(\d+)\s*:\s*\1\.*/, "Chapter $1:")
                        .replace(/\//g, "-");
                    }
                    
                    return (
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mt-8 mb-4">{cleanTitle}</h2>
                    );
                  },
                },
                h3: {
                  component: ({ children }: any) => (
                    <h3 className="text-lg sm:text-xl font-medium text-gray-800 mt-6 mb-3">{children}</h3>
                  ),
                },
                p: {
                  component: ({ children }: any) => (
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-5">{children}</p>
                  ),
                },
                strong: {
                  component: ({ children }: any) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                },
                em: {
                  component: ({ children }: any) => (
                    <em className="italic text-gray-800">{children}</em>
                  ),
                },
                blockquote: {
                  component: ({ children }: any) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-5">{children}</blockquote>
                  ),
                },
                ul: {
                  component: ({ children }: any) => (
                    <ul className="list-disc pl-6 mb-5 mt-2 text-base sm:text-lg text-gray-700 space-y-2">{children}</ul>
                  ),
                },
                ol: {
                  component: ({ children }: any) => (
                    <ol className="list-decimal pl-6 mb-5 mt-2 text-base sm:text-lg text-gray-700 space-y-2">{children}</ol>
                  ),
                },
                li: {
                  component: ({ children }: any) => (
                    <li className="mb-1.5">{children}</li>
                  ),
                },
                a: {
                  component: ({ children, href }: any) => (
                    <a href={href} 
                       className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      {children}<Link size={14} className="inline-block ml-0.5" />
                    </a>
                  ),
                },
                hr: {
                  component: () => (
                    <hr className="my-6 border-t border-gray-200" />
                  ),
                },
                code: {
                  component: ({ children, className }: any) => {
                    // Parse language from className
                    const language = className ? className.replace("lang-", "") : "";
                    
                    if (!className || className === "lang-") {
                      // Inline code
                      return (
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono text-sm border border-gray-200">
                          {children}
                        </code>
                      );
                    }
                    
                    // Code block
                    return (
                      <div className="relative my-6 rounded-lg overflow-hidden">
                        <div className="flex items-center gap-2 bg-gray-800 text-gray-200 py-2 px-4 text-sm">
                          <Code size={16} />
                          <span className="font-medium">{language || "Code"}</span>
                        </div>
                        <pre className="bg-gray-100 text-gray-800 border border-gray-300 p-4 overflow-x-auto text-sm font-mono">
                          <code className={language}>{children}</code>
                        </pre>
                      </div>
                    );
                  },
                },
                table: {
                  component: ({ children }: any) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full divide-y divide-gray-300 border border-gray-200 rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                },
                thead: {
                  component: ({ children }: any) => (
                    <thead className="bg-gray-50">{children}</thead>
                  ),
                },
                tbody: {
                  component: ({ children }: any) => (
                    <tbody className="divide-y divide-gray-200">{children}</tbody>
                  ),
                },
                tr: {
                  component: ({ children }: any) => (
                    <tr className="hover:bg-gray-50">{children}</tr>
                  ),
                },
                th: {
                  component: ({ children }: any) => (
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">{children}</th>
                  ),
                },
                td: {
                  component: ({ children }: any) => (
                    <td className="px-4 py-3 text-sm text-gray-700">{children}</td>
                  ),
                },
                img: {
                  component: ({ src, alt }: any) => (
                    <div className="my-6">
                      <img 
                        src={src} 
                        alt={alt || "Image"} 
                        className="max-w-full h-auto rounded-lg shadow-sm mx-auto" 
                      />
                      {alt && <p className="text-center text-sm text-gray-500 mt-2">{alt}</p>}
                    </div>
                  ),
                },
              },
            }}
          >
            {processedContent}
          </Markdown>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle size={32} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No content is available for this chapter yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;