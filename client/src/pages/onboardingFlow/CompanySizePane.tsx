"use client"

import type React from "react"
import { motion } from "framer-motion"

interface CompanySizePaneProps {
  selectedOption: string
  onSelect: (value: string) => void
  onFinish: () => void
  onBack: () => void
  onSkip: () => void
  isSubmitting?: boolean
  theme: any
}

const CompanySizePane: React.FC<CompanySizePaneProps> = ({
  selectedOption,
  onSelect,
  onFinish,
  onBack,
  onSkip,
  isSubmitting = false,
  theme,
}) => {
  const options = [
    { value: "solo", label: "It's just me", emoji: "👤" },
    { value: "small", label: "Small (2-25)", emoji: "👥" },
    { value: "medium", label: "Medium (25-100)", emoji: "🏢" },
    { value: "large", label: "Large (100+)", emoji: "🏙️" },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-xl md:text-2xl font-medium text-gray-800 mb-6"
        >
          How large is your company?
        </motion.h2>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3 max-w-md">
          {options.map((option) => (
            <motion.button
              key={option.value}
              variants={item}
              onClick={() => onSelect(option.value)}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center px-5 py-4 rounded-lg border transition-all
                ${
                  selectedOption === option.value
                    ? "border-transparent text-white shadow-md bg-purple-600"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/80"
                }
              `}
              // style={{
              //   backgroundColor: selectedOption === option.value ? theme.primary.main : "",
              // }}
            >
              <span className="mr-3 text-xl">{option.emoji}</span>
              <span className="font-medium">{option.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-between items-center mt-8"
      >
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className={`
              text-gray-500 hover:text-gray-700 font-medium flex items-center transition-colors
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* <button
            onClick={onSkip}
            disabled={isSubmitting}
            className={`
              text-gray-500 hover:text-gray-700 font-medium transition-colors
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            Skip
          </button> */}
        </div>

        <motion.button
          onClick={onFinish}
          disabled={!selectedOption || isSubmitting}
          whileHover={selectedOption && !isSubmitting ? { scale: 1.03 } : {}}
          whileTap={selectedOption && !isSubmitting ? { scale: 0.97 } : {}}
          className={`
            px-6 py-2.5 rounded-md font-medium transition-colors flex items-center
            ${selectedOption && !isSubmitting ? "text-white bg-purple-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
          `}
          // style={{
          //   backgroundColor: selectedOption && !isSubmitting ? theme.primary.main : "",
          // }}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              Finish
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}

export default CompanySizePane
