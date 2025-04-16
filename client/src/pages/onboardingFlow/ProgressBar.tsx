"use client"

import type React from "react"
import { motion } from "framer-motion"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  theme: any
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, theme }) => {
  // Adjust steps for zero-indexing (currentStep starts at 0, but we want to show progress starting from step 1)
  // const adjustedCurrentStep = currentStep - 1
  
  return (
    <div className="w-full flex space-x-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="h-1 rounded-full flex-grow bg-gray-200 overflow-hidden">
          {index <= currentStep && (
            <motion.div
              initial={{ width: index < currentStep ? "100%" : "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full bg-purple-600"
              // style={{ backgroundColor: theme.primary.main }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default ProgressBar
