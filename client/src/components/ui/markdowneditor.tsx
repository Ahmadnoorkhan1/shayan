import { useEffect } from "react";
import Markdown from "markdown-to-jsx";

const MarkdownEditor = ({ data }: { data: string }) => {
  useEffect(() => {
    return () => {
      console.log("[MarkdownEditor] Cleanup triggered");
    };
  }, [data]);

  return (
    <div className="flex flex-col mx-auto gap-4 mt-8 p-4 w-full ">
      <div
        className="border border-gray-200 p-6 rounded-lg text-gray-700 bg-white shadow-sm overflow-y-auto overflow-x-hidden transition-shadow duration-300 hover:shadow-md"
      >
        <Markdown
          options={{
            overrides: {
              h1: {
                component: ({ children }: any) => (
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{children}</h1>
                ),
              },
              h2: {
                component: ({ children }: any) => (
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mt-6 mb-3">{children}</h2>
                ),
              },
              p: {
                component: ({ children }: any) => (
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">{children}</p>
                ),
              },
              ul: {
                component: ({ children }: any) => (
                  <ul className="list-disc pl-6 mb-4 text-base sm:text-lg text-gray-600">{children}</ul>
                ),
              },
              li: {
                component: ({ children }: any) => (
                  <li className="mb-2">{children}</li>
                ),
              },
              code: {
                component: ({ children, className }: any) => {
                  const language = className ? className.replace("lang-", "") : "";
                  return (
                    <pre className="bg-gray-100 text-gray-700 border border-gray-300 my-4 p-4 rounded-md overflow-x-auto">
                      <code className={language}>{children}</code>
                    </pre>
                  );
                },
              },
            },
          }}
        >
          {data || "No content available yet."}
        </Markdown>
      </div>
    </div>
  );
};

export default MarkdownEditor;