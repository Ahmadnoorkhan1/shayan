import React from "react";

interface CardProps {
  className?: string;
  renderForm:CallableFunction,
  renderButtons:CallableFunction,
}

const Card: React.FC<CardProps> = ({  className = "", renderForm,renderButtons }) => {
  return (
    <div className={`rounded-2xl shadow-md bg-white p-4 border border-gray-200 ${className}`}>
      {/* {children} */}
      {renderForm()}            
      {renderButtons()}
    </div>
  );
};

export default Card;
