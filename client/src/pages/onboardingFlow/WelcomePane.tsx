"use client"

import type React from "react"
import { motion } from "framer-motion"

interface WelcomePaneProps {
  onNext: () => void
  onSkip: () => void
  theme: any
}

const WelcomePane: React.FC<WelcomePaneProps> = ({ onNext, onSkip, theme }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-medium text-gray-800 mb-6"
        >
          Welcome to Mini Lessons Academy 🚀
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-600 mb-8 max-w-md"
        >
          You're on the fast-track to creating full length digital content in seconds. Can you tell us a little bit
          about yourself? Let's get started!
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-between items-center"
      >
        {/* <button onClick={onSkip} className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
          Skip
        </button> */}

        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center bg-purple-600 px-6 py-2.5 rounded-md font-medium text-white transition-all"
          // style={{ backgroundColor: theme.primary.main }}
        >
          Let's Begin
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

export default WelcomePane
