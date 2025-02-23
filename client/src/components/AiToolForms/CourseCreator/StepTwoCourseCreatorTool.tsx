import React from "react"

interface StepTwoProps {
  handleStepChange: CallableFunction
}

const StepTwoCourseCreatorTool: React.FC<StepTwoProps> = ({handleStepChange}) => {
  const suggestedTitles = JSON.parse(localStorage?.getItem('course_titles')|| '')
  const selectTitle = (title:any) =>{
    localStorage.setItem('selectedTitle', title)
    handleStepChange();
  }
  return (
    <div className='flex justify-center flex-col items-center'>
      <h2 className="p-4 text-center text-primary md:text-lg text-base md:w-full w-1/2">Choose A More Detailed Title for Your Course Or click the link below to enter your own!</h2>
      <div className='flex justify-between gap-8 pt-8 lg:w-[720px] w-[325px]  overflow-scroll'>
        {suggestedTitles.map((title: string) => {
          return (
              <button className="p-6 min-w-[275px] bg-white dark:bg-primary border-2 border-gray-300 rounded-lg hover:scale-105 transition duration-500 cursor-pointer" onClick={() => selectTitle(title)}>
                    <h3 className="my-2 text-lg font-bold text-white">{title}</h3>
              </button>
          )
        })}
      </div>
    </div>
  )
}

export default StepTwoCourseCreatorTool