// import  { useEffect } from "react";
// import Markdown from 'react-markdown'

// const MarkdownEditor = (data:any) => {
//   useEffect(() => {
//     return(()=>{
//       data="";
//     })
//   }, [data])
  
//   return (
//     <div className="flex flex-col gap-4 p-4 w-full ">
//       {/* Rendered Markdown output */}
//       <div className="border border-gray-200 p-4 rounded-md bg-gray-50">
//         <Markdown>{data?.data.toString()}</Markdown>
//       </div>
//     </div>
//   );
// };

// export default MarkdownEditor;
import { useEffect } from "react";
import Markdown from "markdown-to-jsx";

const MarkdownEditor = ({ data }: { data: string }) => {
  useEffect(() => {
    return () => {
      data = "";
    };
  }, [data]);

  return (
    <div className="flex flex-col mx-auto gap-4 p-4 ">
      <div className="border border-gray-200 p-4 rounded-md text-gray-600 bg-gray-50">
        <Markdown
          options={{
            overrides: {
              code: {
                component: ({ children, className }: any) => {
                  const language = className ? className.replace("lang-", "") : "";
                  return (
                    <pre className={`bg-gray-100 text-gray-700 border border-gray-300 my-2 p-2 rounded-md overflow-auto`}>
                      <code className={language}>{children}</code>
                    </pre>
                  );
                },
              },
            },
          }}
        >
          {data}
        </Markdown>
      </div>
    </div>
  );
};

export default MarkdownEditor;
