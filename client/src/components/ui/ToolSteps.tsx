import { FC} from "react";
import Card from "./ToolCard";

type StepperProps = {
  currentStep: number;
  steps: { label: string; icon: boolean }[];
};

const Stepper: FC<StepperProps> = ({ currentStep, steps }) => {
 

  return (
    <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
      {steps.map((step, index) => (
        <li
          key={index}
          className={`flex items-center justify-center w-full transition-all duration-300 ${
            index === currentStep
              ? "text-primary font-bold scale-105"
              : "text-gray-500"
          }`}
        >
          <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
            {step.icon ? (
              <svg
                className={`w-10 h-10 sm:w-8 sm:h-8 me-2.5 text-gray-400 transition-all duration-300 ${
                  index === currentStep ? "text-primary scale-110" : ""
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            ) : (
              <span className="me-2">{index + 1}</span>
            )}
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
};

interface CourseForm{
  renderForm:CallableFunction,
  renderButtons:CallableFunction,
  currentStep: number,
  steps: { label: string; icon: boolean }[]
}

const CourseForm: FC<CourseForm> = ({renderForm,renderButtons,currentStep,steps}) => {
  return (
    <div className="w-full mt-4">
      <Stepper currentStep={currentStep} steps={steps} />
      <div className="my-8">
        <Card className="flex flex-col justify-center py-16 items-center" renderForm={renderForm} renderButtons={renderButtons}/>
      </div>
    </div>
  );
};

export default CourseForm;
