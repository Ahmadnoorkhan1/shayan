import React from "react"

interface StepTwoProps {
  handleStepChange: CallableFunction
}

const StepTwoBookCreator: React.FC<StepTwoProps> = ({handleStepChange}) => {
  const suggestedTitles = JSON.parse(localStorage?.getItem('book_titles')|| '')
  const selectTitle = (title:any) =>{
    localStorage.setItem('selectedBookTitle',title)
    handleStepChange();
  }
  return (
    <div className='flex justify-center flex-col items-center'>
      <h2 className="p-4 text-center text-primary md:text-lg text-base md:w-full w-1/2">Choose A More Detailed Title for Your New Book Or click the link below to enter your own!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 py-6">
          {suggestedTitles?.slice(3,9)?.map((title: string, index: number) => (
            <button
              key={index}
              className="p-4 h-full bg-primary border-2 border-gray-300 rounded-lg 
                         hover:scale-[1.03] transition duration-300 cursor-pointer 
                         flex items-center justify-center shadow-md"
              onClick={() => selectTitle(title)}
            >
              <h3 className="text-base font-bold text-white text-center line-clamp-3">
                {title}
              </h3>
            </button>
          ))}
        </div>
    </div>
  )
}

export default StepTwoBookCreator