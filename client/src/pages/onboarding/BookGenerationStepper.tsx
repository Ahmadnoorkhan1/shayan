"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, ChevronRight, BookOpen, Sparkles, ChevronLeft, Layers, FileText, Loader2 } from "lucide-react"
import BookPurposeStep from "./steps/BookPurposeStep"
import BookDetailsStep from "./steps/BookDetailsStep"
import BookTitleStep from "./steps/BookTitleStep"
import WelcomeAnimation from "./WelcomeAnimation"
import apiService from "../../utilities/service/api"

// Rename these types to be more generic
export type ContentPurpose = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export type ContentDetail = {
  id: string
  name: string
  options: string[]
  value: string
}

export type ContentData = {
  purpose: string
  details: Record<string, string>
  title: string
}

// Rename the component to be more generic
const ContentGenerationStepper = () => {
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [contentData, setContentData] = useState<ContentData>({
    purpose: "",
    details: {},
    title: "",
  })
  const [isCompleted, setIsCompleted] = useState(false)
  const [animateStep, setAnimateStep] = useState(false)
  const [initialRender, setInitialRender] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [contentId, setContentId] = useState<string | null>(null)

  const steps = [
    { id: "purpose", name: "Content Purpose", description: "Define what type of content you want to create" },
    { id: "details", name: "Content Details", description: "Customize your content's style and structure" },
    { id: "title", name: "Choose Title", description: "Select the perfect title for your creation" },
  ]

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
    setContentData((prev) => ({ ...prev, purpose: purposeId }))
  }

  const handleDetailChange = (detailId: string, value: string) => {
    setContentData((prev) => ({
      ...prev,
      details: { ...prev.details, [detailId]: value },
    }))
  }

  const handleTitleSelect = (title: string) => {
    setContentData((prev) => ({ ...prev, title }))
  }

  const createContent = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      // Call API to create content with all the data collected
      const response = await apiService.post("/onboard/generate-content", {
        contentType: contentData.purpose,
        contentTitle: contentData.title,
        contentDetails: contentData.details,
        // Add any other necessary data
      });
      
      if (response.success) {
        // Store the content ID if returned by the API
        if (response.data && response.data.id) {
          setContentId(response.data.id);
        }
        // Show completion screen
        setIsCompleted(true);
      } else {
        throw new Error(response.message || "Failed to create content");
      }
    } catch (err) {
      console.error("Error creating content:", err);
      setSubmitError(err instanceof Error ? err.message : "Failed to create your content. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      // On final step, create the content
      createContent();
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const canProceed = () => {
    if (currentStep === 0) {
      return contentData.purpose !== ""
    } else if (currentStep === 1) {
      // Require at least 3 details to be filled
      return Object.keys(contentData.details).length >= 3
    } else if (currentStep === 2) {
      return contentData.title !== ""
    }
    return false
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BookPurposeStep selectedPurpose={contentData.purpose} onSelect={handlePurposeSelect} />
      case 1:
        return <BookDetailsStep selectedDetails={contentData.details} onChange={handleDetailChange} />
      case 2:
        return <BookTitleStep bookData={contentData} selectedTitle={contentData.title} onSelect={handleTitleSelect} />
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
          <h2 className="text-3xl text-white font-bold">Your Creation Awaits!</h2>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">"{contentData.title}"</h3>
            <p className="text-gray-600">
              Your {contentData.details.audience} {contentData.purpose} content is being crafted with care.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8">
            <h4 className="font-medium text-purple-800 mb-3">Content Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 text-gray-800 font-medium capitalize">{contentData.purpose}</span>
              </div>
              {Object.entries(contentData.details).map(([key, value]) => (
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
              onClick={() => (window.location.href = contentId ? `/dashboard/content/${contentId}` : "/dashboard")}
            >
              <FileText className="mr-2 h-5 w-5" />
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
          Let's bring your ideas to life. Follow these simple steps to create professional, customized content that
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

      {/* Error message if submission fails */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 mx-4">
          <p className="text-sm font-medium">{submitError}</p>
          <p className="text-sm mt-1">Please try again or contact support if the problem persists.</p>
        </div>
      )}

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
              {currentStep === 0 && "Select the purpose of your content to help us understand your goals."}
              {currentStep === 1 && "Provide details about your content to customize its structure and style."}
              {currentStep === 2 && "Choose a title for your creation from our suggestions."}
            </p>
          </div>
        </div>

        <div className="p-6 min-h-[450px]">{renderStep()}</div>

        {/* Navigation */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              flex items-center gap-2
              transform transition-all duration-200
              ${currentStep === 0 || isSubmitting
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
            disabled={!canProceed() || isSubmitting}
            className={`
              px-5 py-2.5 rounded-lg font-medium text-sm
              flex items-center gap-2
              transform transition-all duration-200
              ${canProceed() && !isSubmitting
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
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Create My Content
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

export default ContentGenerationStepper