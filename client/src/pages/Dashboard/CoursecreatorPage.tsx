import GettingStarted from "../../components/dashboard/GettingStarted"

const CoursecreatorPage = () => {
  return (
    <div className="flex flex-col ">
      <GettingStarted button={false} title="Create a course with our AI" description=" lorem ipsum diloer lorem ipsum diloerlorem ipsum diloerlorem ipsum diloerlorem ipsum diloerlorem ipsum diloer" />
      {/* <StepIndicator  steps={["book.svg","brain.svg","calendar.svg"]} activeStep={1}/> */}
    </div>
  )
}

export default CoursecreatorPage