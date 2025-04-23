"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import WelcomePane from "./WelcomePane"
import DemographicsPane from "./DemographicsPane"
import ContentTypePane from "./ContentTypePane"
import CompanySizePane from "./CompanySizePane"
import ProgressBar from "./ProgressBar"
import { useNavigate } from "react-router"
import WelcomeAnimation from "../onboarding/WelcomeAnimation"
import apiService from "../../utilities/service/api"
import { getUserIdWithFallback } from "../../utilities/shared/userUtils";


// Theme colors
export const theme = {
  primary: {
    light: "#f3e5f5",
    main: "#9c27b0",
    dark: "#7b1fa2",
    contrastText: "#ffffff",
  },
  secondary: {
    light: "#e8f5e9",
    main: "#4caf50",
    dark: "#388e3c",
    contrastText: "#ffffff",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
}

export type UserData = {
  demographic: string
  contentType: string
  companySize: string
}

const OnboardingFlow = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for backward, 1 for forward
  const [userData, setUserData] = useState<UserData>({
    demographic: "",
    contentType: "",
    companySize: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalSteps = 5  // Changed from 4 to 5 to account for all steps (0-4)

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1)
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1)
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handleFinish = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const response = await apiService.post("/user-data", { 
        ...userData, 
        userId: getUserIdWithFallback() 
      })
            if (response.success) {
        // Redirect to dashboard after successful submission
        navigate("/dashboard")
      } else {
        throw new Error(response.message || "Failed to save user data")
      }
    } catch (error) {
      console.error("Error saving user data:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

 

  const updateUserData = (key: keyof UserData, value: string) => {
    setUserData((prev) => ({ ...prev, [key]: value }))
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 60 : -60,
      y: direction > 0 ? -20 : 20,
      opacity: 0,
      scale: 0.96,
      rotateY: direction > 0 ? 5 : -5,
    }),
    center: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 25 },
        y: { type: "spring", stiffness: 250, damping: 25 },
        opacity: { duration: 0.4, ease: "easeIn" },
        scale: { type: "spring", stiffness: 400, damping: 30 },
        rotateY: { type: "spring", stiffness: 400, damping: 30 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -60 : 60,
      y: direction > 0 ? 20 : -20,
      opacity: 0,
      scale: 0.96,
      rotateY: direction > 0 ? -5 : 5,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 20 },
        opacity: { duration: 0.3, ease: "easeOut" }
      }
    }),
  }

  const renderCurrentPane = () => {
    return (
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="h-full flex flex-col"
        >
          {currentStep === 0 && <WelcomeAnimation onBegin={handleNext} />}
          {currentStep === 1 && <WelcomePane onNext={handleNext} onSkip={handleSkip} theme={theme} />}
          {currentStep === 2 && (
            <DemographicsPane
              selectedOption={userData.demographic}
              onSelect={(value) => updateUserData("demographic", value)}
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
              theme={theme}
            />
          )}
          {currentStep === 3 && (
            <ContentTypePane
              selectedOption={userData.contentType}
              onSelect={(value) => updateUserData("contentType", value)}
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
              theme={theme}
            />
          )}
          {currentStep === 4 && (
            <CompanySizePane
              selectedOption={userData.companySize}
              onSelect={(value) => updateUserData("companySize", value)}
              onFinish={handleFinish}
              onBack={handleBack}
              onSkip={handleSkip}
              isSubmitting={isSubmitting}
              theme={theme}
            />
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left side content */}
      <div className={`w-full ${currentStep > 0 ? 'md:w-1/2' : 'md:w-full'} p-6 md:p-12 flex flex-col`}>
        <div className="mb-8">
          {currentStep > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img src="/images/logo_minilessons.png" alt="Mini Lessons Academy" className="h-14" />
            </motion.div>
          )}
        </div>

        <div className="flex-grow flex flex-col">
          {currentStep > 0 && (
            <div className="mb-6">
              <ProgressBar currentStep={currentStep} totalSteps={totalSteps} theme={theme} />
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="flex-grow">{renderCurrentPane()}</div>
        </div>
      </div>

      {/* Right side image - only show when not on welcome animation */}
      {currentStep > 0 && (
  <div className="hidden md:block w-1/2 bg-gradient-to-br from-purple-300 to-purple-500 relative overflow-hidden">
    <motion.div
      className="absolute inset-0 w-full h-full"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <motion.div 
        className="w-full h-full"
        animate={{ 
          y: [0, -10, 0],
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <img
          src="/images/onboarding/onboarding_main.jpg" 
          alt="Mini Lessons Academy"
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/60 to-transparent" />
      </motion.div>
    </motion.div>
    
    <div className="absolute bottom-8 left-8 right-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <h3 className="text-2xl text-white font-bold mb-2">Personalized learning journey</h3>
        <p className="text-white/90">
          Customize your educational experience with content that matches your needs and goals.
        </p>
      </motion.div>
    </div>
  </div>
)}
    </div>
  )
}

export default OnboardingFlow
