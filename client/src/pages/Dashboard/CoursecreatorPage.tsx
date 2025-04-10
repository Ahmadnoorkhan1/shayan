import GettingStarted from "../../components/dashboard/GettingStarted"

const CoursecreatorPage = () => {
  return (
    <div className="flex flex-col ">
      <GettingStarted button={false} title="Create a course with our AI" description="What do you want your course to be about?
(don't worry, you can always change the content or name of your course later!)" />
      {/* <StepIndicator  steps={["book.svg","brain.svg","calendar.svg"]} activeStep={1}/> */}
    </div>
  )
}

export default CoursecreatorPage