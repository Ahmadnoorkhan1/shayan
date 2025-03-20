"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, ChevronRight, BookOpen, Sparkles, ChevronLeft } from "lucide-react"
import BookPurposeStep from "./steps/BookPurposeStep"
import BookDetailsStep from "./steps/BookDetailsStep"
import BookTitleStep from "./steps/BookTitleStep"
import WelcomeAnimation from "./WelcomeAnimation"


export type BookPurpose = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export type BookDetail = {
  id: string
  name: string
  options: string[]
  value: string
}

export type BookData = {
  purpose: string
  details: Record<string, string>
  title: string
}

const BookGenerationStepper = () => {
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [bookData, setBookData] = useState<BookData>({
    purpose: "",
    details: {},
    title: "",
  })
  const [isCompleted, setIsCompleted] = useState(false)
  const [animateStep, setAnimateStep] = useState(false)
  // Add this state to track initial render
  const [initialRender, setInitialRender] = useState(true)

  const steps = [
    { id: "purpose", name: "Book Purpose", description: "Define what type of book you want to create" },
    { id: "details", name: "Book Details", description: "Customize your book's style and content" },
    { id: "title", name: "Book Title", description: "Choose the perfect title for your creation" },
  ]

  // Remove the auto-dismiss welcome screen timer
  // We'll now rely on the button click only

  useEffect(() => {
    // Trigger animation when step changes
    setAnimateStep(true)
    const timer = setTimeout(() => {
      setAnimateStep(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [currentStep])

  // Add new useEffect to handle animation when welcome screen is dismissed
  useEffect(() => {
    if (!showWelcome && initialRender) {
      // Apply the same animation when first showing the stepper
      setAnimateStep(true)
      const timer = setTimeout(() => {
        setAnimateStep(false)
        setInitialRender(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [showWelcome, initialRender])

  // Update the welcome dismiss handler to trigger animation
  const handleWelcomeDismiss = () => {
    setShowWelcome(false)
    // Animation will be triggered by the useEffect above
  }

  const handlePurposeSelect = (purposeId: string) => {
    setBookData((prev) => ({ ...prev, purpose: purposeId }))
  }

  const handleDetailChange = (detailId: string, value: string) => {
    setBookData((prev) => ({
      ...prev,
      details: { ...prev.details, [detailId]: value },
    }))
  }

  const handleTitleSelect = (title: string) => {
    setBookData((prev) => ({ ...prev, title }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const canProceed = () => {
    if (currentStep === 0) {
      return bookData.purpose !== ""
    } else if (currentStep === 1) {
      // Require at least 3 details to be filled
      return Object.keys(bookData.details).length >= 3
    } else if (currentStep === 2) {
      return bookData.title !== ""
    }
    return false
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BookPurposeStep selectedPurpose={bookData.purpose} onSelect={handlePurposeSelect} />
      case 1:
        return <BookDetailsStep selectedDetails={bookData.details} onChange={handleDetailChange} />
      case 2:
        return <BookTitleStep bookData={bookData} selectedTitle={bookData.title} onSelect={handleTitleSelect} />
      default:
        return null
    }
  }

  if (showWelcome) {
    return <WelcomeAnimation 
      onBegin={handleWelcomeDismiss} 
      onComplete={() => {}} 
    />
  }

  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl shadow-[0_20px_60px_-15px_rgba(124,58,237,0.3)] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 text-white">
          <h2 className="text-3xl text-white font-bold">Your Masterpiece Awaits!</h2>
          <p className="mt-2 opacity-90">We're bringing your vision to life</p>
        </div>

        <div className="bg-white p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-600 blur-lg opacity-30 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">"{bookData.title}"</h3>
            <p className="text-gray-600">
              Your {bookData.details.audience} {bookData.purpose} book is being crafted with care.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8">
            <h4 className="font-medium text-purple-800 mb-3">Book Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 text-gray-800 font-medium capitalize">{bookData.purpose}</span>
              </div>
              {Object.entries(bookData.details).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="text-gray-500 capitalize">{key}:</span>
                  <span className="ml-2 text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="bg-gradient-to-r flex items-center from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-10 py-4 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => (window.location.href = "/dashboard")}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Go to My Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with animated gradient */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 p-8 md:p-12 mb-8 shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600 opacity-50"></div>
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Create With Us</h1>
        <p className="text-purple-100 max-w-xl">
          Let's bring your ideas to life. Follow these simple steps to create a professional, customized book that
          perfectly captures your vision.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="mb-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center mb-4 md:mb-0 group">
              <div className="flex-shrink-0">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    index < currentStep
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                      : index === currentStep
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg ring-4 ring-purple-100"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="text-lg font-semibold">{index + 1}</span>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium transition-colors ${
                    index <= currentStep ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 max-w-[150px]">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block w-24 mx-4">
                  <div className="h-1 bg-gray-100 rounded-full">
                    <div
                      className={`h-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-in-out ${
                        index < currentStep ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div
        className={`bg-white rounded-2xl shadow-[0_10px_50px_-12px_rgba(124,58,237,0.25)] overflow-hidden transition-all duration-300 ease-in-out ${
          animateStep ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
        }`}
      >
        <div className="border-b border-gray-100">
          <div className="px-6 py-5">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{steps[currentStep].name}</h2>
            <p className="text-gray-500">
              {currentStep === 0 && "Select the purpose of your book to help us understand your goals."}
              {currentStep === 1 && "Provide details about your book to customize the content."}
              {currentStep === 2 && "Choose a title for your book from our suggestions."}
            </p>
          </div>
        </div>

        <div className="p-6 min-h-[450px]">{renderStep()}</div>

        {/* Navigation */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              flex items-center gap-2
              transform transition-all duration-200
              ${currentStep === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'hover:bg-purple-50 hover:text-purple-700 active:scale-95 text-gray-600 bg-white border border-gray-200'
              }
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="px-4 py-1.5 bg-white rounded-full border border-gray-200">
            <div className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`
              px-5 py-2.5 rounded-lg font-medium text-sm
              flex items-center gap-2
              transform transition-all duration-200
              ${canProceed()
                ? `
                  bg-gradient-to-r from-purple-600 to-purple-700
                  hover:from-purple-700 hover:to-purple-800
                  active:scale-95 text-white
                  shadow-[0_4px_10px_-3px_rgba(124,58,237,0.5)]
                  hover:shadow-[0_6px_15px_-3px_rgba(124,58,237,0.6)]
                `
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {currentStep === steps.length - 1 ? (
              <>
                Create My Book
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookGenerationStepper