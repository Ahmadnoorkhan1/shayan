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
    <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = index <= currentStep;
        const isLast = index === steps.length - 1;

        return (
          <li
            key={index}
            className={`
              relative flex items-center flex-1
              ${!isLast ? 'pr-2 sm:pr-4 md:pr-6' : ''}
              ${isClickable ? 'cursor-pointer' : ''}
              ${index !== 0 ? 'pl-2 sm:pl-4 md:pl-6' : ''}
            `}
          >
            {/* Connector line */}
            {/* {index !== 0 && (
              <div 
                className={`
                  absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2
                  ${isCompleted ? 'bg-primary' : 'bg-gray-200'}
                `} 
                style={{width: 'calc(100% - 3rem)', left: '-45%', zIndex: 0}}
              />
            )} */}
            
            {/* Step indicator */}
            <div className={`
              flex items-center justify-center w-full
              transition-all duration-300 relative z-10
              ${isActive ? "text-primary scale-105" : ""}
              ${isCompleted ? "text-primary" : ""}
            `}>
              <span className={`
                flex items-center justify-center
                w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full
                text-xs md:text-sm font-semibold shrink-0
                transition-all duration-300
                ${isActive ? "bg-purple-100 text-primary  " : ""}
                ${isCompleted ? "bg-primary text-white" : "bg-gray-100"}
                ${!isActive && !isCompleted ? "text-gray-500" : ""}
              `}>
                {isCompleted ? (
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                ) : (
                  <span className="text-[10px] sm:text-xs md:text-sm">{index + 1}</span>
                )}
              </span>
              
              {/* Step label */}
              <div className="ml-1 sm:ml-2 md:ml-3 max-w-[90px] sm:max-w-[120px] md:max-w-full text-center">
                <span className={`
                  block text-center text-[10px] leading-tight sm:text-xs md:text-sm
                  ${isActive ? "font-semibold text-primary" : ""}
                  ${isCompleted ? "font-medium text-primary" : ""}
                  ${!isActive && !isCompleted ? "text-gray-500" : ""}
                `}>
                  {step.label}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  </div>
  );
};

// Update the CourseFormProps interface to include loadingIndicator
interface CourseFormProps {
  renderForm: CallableFunction;
  renderButtons: CallableFunction;
  currentStep: number;
  steps: { label: string; icon: boolean }[];
  loadingIndicator?: React.ReactNode; // New prop
}

// Update the CourseForm component to render the loading indicator
const CourseForm: FC<CourseFormProps> = ({
  renderForm,
  renderButtons,
  currentStep,
  steps,
  loadingIndicator // New prop
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
        
        {/* Render loading indicator if provided */}
        {loadingIndicator && (
          <div className="flex justify-center mt-4">
            {loadingIndicator}
          </div>
        )}
      </div>
    </div>
  );
};

// Add scrollbar-hide utility if not already defined in your app
const ScrollbarStyles = () => (
  <style  >{`
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