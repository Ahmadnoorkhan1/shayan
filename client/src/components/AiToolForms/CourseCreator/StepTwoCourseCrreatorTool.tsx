
const StepTwoCourseCrreatorTool = () => {
  const suggestedTitles = ['Alpha Bravo Charlie', 'Bravo Charlie Alpha', 'Charlie Alpha Bravo',]
  return (
    <div className='flex flex-col items-center justify-center p-8'>
      <h2 className="p-4 text-center text-primary">Choose A More Detailed Title for Your Course Or click the link below to enter your own!</h2>
      <div className='flex justify-between gap-8 pt-8'>
        {suggestedTitles.map((title: string) => {
          return (
            <>
              <button className="relative cursor-pointe" onClick={() => localStorage.setItem('selectedTitle', title)}>
                <span className="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-primary rounded-lg bg-opacity-20"></span>
                <div className="relative p-6 bg-white dark:bg-primary border-2  border-gray-300 rounded-lg hover:scale-105 transition duration-500">
                  <div className="flex items-center">
                    <h3 className="my-2 text-lg font-bold text-white">{title}</h3>
                  </div>
                  <p className=" text-gray-300">
                  </p>
                </div>
              </button>
            </>
          )
        })}
      </div>
    </div>
  )
}

export default StepTwoCourseCrreatorTool