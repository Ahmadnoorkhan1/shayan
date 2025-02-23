// import React, { FC, useState } from "react";
// import StepOneCourseCreator from "../AiToolForms/EasyCourseCreator/StepOneCourseCreator";
// import StepTwoCourseCreatorTool from "../AiToolForms/EasyCourseCreator/StepTwoCourseCreatorTool";
// import StepsThirdCourseCreator from "../AiToolForms/EasyCourseCreator/StepsThirdCourseCreator";
// import StepFourCourseCreator from "../AiToolForms/EasyCourseCreator/StepFourCourseCreator";
// import Card from "./card";
// import StepFiveCourseCreator from "../AiToolForms/EasyCourseCreator/StepFiveCourseCreator";

// type StepperProps = {
//   currentStep: number;
// };

// const Stepper: FC<StepperProps> = ({ currentStep }) => {
//   const steps = [
//     { label: "Give A Topic", icon: true },
//     { label: "Pro Course", icon: true },
//   ];

//   return (
//     <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
//       {steps.map((step, index) => (
//         <li
//           key={index}
//           className={`flex items-center justify-center w-full transition-all duration-300 ${index === currentStep ? "text-primary font-bold scale-105" : "text-gray-500"
//             }`}
//         >
//           <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
//             {step.icon ? (
//               <svg
//                 className={`w-10 h-10 sm:w-8 sm:h-8 me-2.5 text-gray-400 transition-all duration-300 ${index === currentStep ? "text-primary scale-110" : ""
//                   }`}
//                 aria-hidden="true"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//               >
//                 <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
//               </svg>
//             ) : (
//               <span className="me-2">{index + 1}</span>
//             )}
//             {step.label}
//           </span>
//         </li>
//       ))}
//     </ol>
//   );
// };

// const CourseForm: FC = () => {
//   const [currentStep, setCurrentStep] = useState(0);

//   const renderForm = () => {
//     switch (currentStep) {
//       case 0:
//         return <StepOneCourseCreator />;
//       case 1:
//         return <StepTwoCourseCreatorTool />;
//       case 2:
//         return <StepsThirdCourseCreator />;
//       case 3:
//         return <StepFourCourseCreator />;
//       case 4:
//         return <StepFiveCourseCreator />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="w-full mt-4">
//       <Stepper currentStep={currentStep} />
//       <div className="my-8">
//       <Card className="h-full lg:h-[70vh] flex flex-col justify-center items-center">
//   <div className="my-4">{renderForm()}</div>
//   <div className="my-4 flex gap-8">
//     {currentStep > 0 && (
//       <button onClick={() => setCurrentStep((prev) => prev - 1)} className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white bg-primary bg-opacity-5 transition duration-300 ease-out border-2 border-primary rounded-full shadow-md group">
//         <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 translate-x-full bg-primary group-hover:translate-x-0 ease">
//           <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
//         </span>
//         <span className="absolute flex items-center justify-center w-full h-full text-primary transition-all duration-300 transform group-hover:translate-x-full ease">Back</span>
//         <span className="relative invisible">Back</span>
//       </button>
//     )}
//     {currentStep < 4 && (
//       <button onClick={() => setCurrentStep((prev) => prev + 1)} className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white bg-primary bg-opacity-5 transition duration-300 ease-out border-2 border-primary rounded-full shadow-md group">
//         <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-primary group-hover:translate-x-0 ease">
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
//         </span>
//         <span className="absolute flex items-center justify-center w-full h-full text-primary transition-all duration-300 transform group-hover:translate-x-full ease">Next</span>
//         <span className="relative invisible">Next</span>
//       </button>
//     )}
//   </div>
// </Card>
//       </div>
//     </div>
//   );
// };

// export default CourseForm;



const Steps = () => {
  return (
    <div>Steps</div>
  )
}

export default Steps