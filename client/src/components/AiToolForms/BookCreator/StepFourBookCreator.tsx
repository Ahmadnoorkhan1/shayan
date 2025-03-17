import { AlertCircle } from "lucide-react";

const StepFourBookCreator = () => {
    const summary = JSON.parse(JSON.stringify(localStorage.getItem('book_summary')));
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary">
            Book Summary
          </h2>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-4 flex items-center gap-2 text-sm text-gray-600">
          <AlertCircle size={16} className="text-primary" />
          <p>
            Review your book summary below. This overview will help guide the content generation process.
          </p>
        </div>

        <div
          className="w-full min-h-[500px] px-4 py-3 text-gray-700 
                     border border-gray-200 rounded-lg bg-gray-50 
                     whitespace-pre-wrap overflow-auto"
        >
          {summary || 'Summary is being generated...'}
        </div>
      </div>
    </div>
    )
  }
  
  export default StepFourBookCreator