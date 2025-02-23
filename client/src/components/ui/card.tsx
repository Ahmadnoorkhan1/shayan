import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`rounded-2xl shadow-md bg-white p-4 border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
