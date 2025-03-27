import { FC } from "react";
import Card from "./ToolCard";
import { CheckCircle } from "lucide-react";

type StepperProps = {
  currentStep: number;
  steps: { label: string; icon: boolean }[];
};

const Stepper: FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <ol className="flex items-center w-full min-w-max text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = index <= currentStep;

          return (
            <li
              key={index}
              className={`
                relative flex md:flex-1 items-center 
                ${index !== steps.length - 1 ? 'md:pr-8' : ''}
                ${isClickable ? 'cursor-pointer' : ''}
              `}
            >
              
              {/* Step indicator */}
              <div className={`
                flex items-center justify-center
                transition-all duration-300 relative z-10
                ${isActive ? "text-primary scale-105" : ""}
                ${isCompleted ? "text-primary" : ""}
              `}>
                <span className={`
                  flex items-center justify-center
                  w-8 h-8 md:w-10 md:h-10 rounded-full
                  text-xs md:text-sm font-semibold
                  transition-all duration-300
                  ${isActive ? "bg-purple-100 text-primary ring-2 ring-purple-200" : ""}
                  ${isCompleted ? "bg-primary text-white" : "bg-gray-100"}
                  ${!isActive && !isCompleted ? "text-gray-500" : ""}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                
                {/* Step label */}
                <span className={`
                  ml-2 md:ml-3 max-w-[80px] md:max-w-none
                  whitespace-normal text-left text-xs md:text-sm
                  ${isActive ? "font-semibold text-primary" : ""}
                  ${isCompleted ? "font-medium text-primary" : ""}
                  ${!isActive && !isCompleted ? "text-gray-500" : ""}
                `}>
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

interface CourseFormProps {
  renderForm: CallableFunction;
  renderButtons: CallableFunction;
  currentStep: number;
  steps: { label: string; icon: boolean }[];
}

const CourseForm: FC<CourseFormProps> = ({
  renderForm,
  renderButtons,
  currentStep,
  steps
}) => {
  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6">
      <div className="mt-4 md:mt-8">
        <Stepper currentStep={currentStep} steps={steps} />
      </div>
      
      <div className="my-6 md:my-10">
        <Card 
          className="flex flex-col justify-center py-8 md:py-12 lg:py-16 px-4 md:px-6 items-center"
          renderForm={renderForm} 
          renderButtons={renderButtons}
        />
      </div>
    </div>
  );
};

// Add scrollbar-hide utility if not already defined in your app
const ScrollbarStyles = () => (
  <style >{`
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `}</style>
);

// Enhanced export with ScrollbarStyles
const EnhancedCourseForm: FC<CourseFormProps> = (props) => (
  <>
    <ScrollbarStyles />
    <CourseForm {...props} />
  </>
);

export default EnhancedCourseForm;