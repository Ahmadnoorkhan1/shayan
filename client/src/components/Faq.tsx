import React, { useState } from "react";
interface FaqProps {
  data:any
}
const Faq: React.FC<FaqProps> = ({data}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index:any) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div id="accordion-collapse" className="container py-8">
      {data.map((item:any, index:any) => (
        <div key={index} className="border border-primary rounded-lg  my-4">
          <h2>
            <button
              type="button"
              onClick={() => toggleAccordion(index)}
              className={`flex items-center justify-between w-full p-2 font-medium text-black hover:text-primary focus:outline-none ${
                activeIndex === index ? "rounded-t-lg" : "rounded-lg"
              }`}
            >
              <span className="text-xl">{item.question}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  activeIndex === index ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </button>
          </h2>
          <div
            className={`transition-[max-height] overflow-hidden ${
              activeIndex === index ? "max-h-[1000px]" : "max-h-0"
            }`}
          >
            <div className="p-2 text-primary">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


export default Faq;
