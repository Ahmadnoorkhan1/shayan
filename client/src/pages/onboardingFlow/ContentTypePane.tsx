"use client"

import type React from "react"
import { motion } from "framer-motion"

interface ContentTypePaneProps {
  selectedOption: string
  onSelect: (value: string) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  theme: any
}

const ContentTypePane: React.FC<ContentTypePaneProps> = ({
  selectedOption,
  onSelect,
  onNext,
  onBack,
  onSkip,
  theme,
}) => {
  const options = [
    { value: "courses", label: "Courses", emoji: "📚" },
    { value: "fiction_books", label: "Fiction Books", emoji: "📖" },
    { value: "non_fiction_books", label: "Non-Fiction Books", emoji: "📔" },
    { value: "lead_magnets", label: "Lead Magnets", emoji: "🧲" },
    { value: "audiobooks", label: "Audiobooks", emoji: "🎧" },
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
          What type of content do you want to create?
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
            className="text-gray-500 hover:text-gray-700 font-medium flex items-center transition-colors"
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

          {/* <button onClick={onSkip} className="text-gray-500 hover:text-gray-700 font-medium transition-colors">
            Skip
          </button> */}
        </div>

        <motion.button
          onClick={onNext}
          disabled={!selectedOption}
          whileHover={selectedOption ? { scale: 1.03 } : {}}
          whileTap={selectedOption ? { scale: 0.97 } : {}}
          className={`
            px-6 py-2.5 rounded-md font-medium transition-colors flex items-center
            ${selectedOption ? "text-white bg-purple-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
          `}
        
        >
          Next
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  )
}

export default ContentTypePane
