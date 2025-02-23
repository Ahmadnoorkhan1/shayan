interface StepOneProps {
    handleForm:CallableFunction
  }
  
  const StepOneBookCreator: React.FC<StepOneProps> = ({handleForm}) => {
  
  
    return (
      <div className="flex flex-col items-center justify-center p-8">
          <h2 className="p-4 text-center text-primary"> What do you want your book to be about?</h2>
          <input
          className="w-full px-4 py-2 my-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          type="text"
          placeholder="Enter your topic"
          onChange={(e)=>handleForm(e.target.value)}
        />
      </div>
    )
  }
  
  export default StepOneBookCreator