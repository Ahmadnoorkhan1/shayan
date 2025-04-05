const StepsThirdCourseCreator = () => {
  const title = localStorage.getItem('selectedTitle');
  return (
    <div className="flex flex-col justify-center items-center p-8">
      <h2 className="p-4 text-center text-primary text-xl md:text-2xl font-bold">
        Awesome Choice! Let's Get Started
      </h2>
      <p className="text-center text-gray-600 mb-4 text-sm">
        Don't worry - you can always change it later.
      </p>
      <input 
        className="w-full px-4 py-2 my-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
        type="text" 
        placeholder="" 
        value={title as any} 
      />
    </div>
  )
}

export default StepsThirdCourseCreator