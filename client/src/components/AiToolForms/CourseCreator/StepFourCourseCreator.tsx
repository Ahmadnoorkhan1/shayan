const StepFourCourseCreator = () => {
  const summary = JSON.parse(JSON.stringify(localStorage.getItem('course_summary')));
  return (
    <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-center text-primary">Edit Your Syllabus or Press Generate Now- You're in Control of Your Course!</h2>
        <textarea className="w-full px-4 py-2 my-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" name="" id="" rows={7} cols={8}>{summary}</textarea>
    </div>
  )
}

export default StepFourCourseCreator