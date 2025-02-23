const StepsThirdCourseCreator = () => {
  const title  = JSON.stringify(localStorage.getItem('selectedTitle'));
  return (
    <div className="flex flex-col justify-center items-center p-8">
          <h2 className="p-4 text-center text-primary">Find out What Your New Course Will Cover!</h2>
        <input className="w-full px-4 py-2 my-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" type="text" placeholder="" value={title} />

    </div>
  )
}

export default StepsThirdCourseCreator