"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, BookMarked, Check } from "lucide-react"
import { BookData } from "../BookGenerationStepper"

interface BookTitleStepProps {
  bookData: BookData
  selectedTitle: string
  onSelect: (title: string) => void
}

const BookTitleStep: React.FC<BookTitleStepProps> = ({ bookData, selectedTitle, onSelect }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [titles, setTitles] = useState<string[]>([])
  const [animatedTitles, setAnimatedTitles] = useState<string[]>([])

  // Simulate fetching titles based on the book data
  useEffect(() => {
    const generateTitles = () => {
      setIsLoading(true)

      // In a real app, this would be an API call to generate titles based on the book data
      setTimeout(() => {
        const purposeTitles: Record<string, string[]> = {
          educational: [
            "The Complete Guide to Understanding " + (bookData.details.audience || "Learning"),
            "Mastering " + (bookData.details.style || "Knowledge") + ": A Comprehensive Approach",
            "Essential " + (bookData.details.format || "Lessons") + " for " + (bookData.details.audience || "Students"),
            "The " + (bookData.details.audience || "Learner's") + " Handbook",
            "Foundations of " +
              (bookData.details.style || "Learning") +
              " for " +
              (bookData.details.audience || "Everyone"),
            "The " + (bookData.details.language || "Advanced") + " Learning Companion",
          ],
          training: [
            "Professional Development: " + (bookData.details.format || "A Guide"),
            "The " + (bookData.details.audience || "Professional's") + " Training Manual",
            "Skill Building: " + (bookData.details.style || "A Practical Approach"),
            "Mastering " + (bookData.details.style || "Skills") + " Through Practice",
            "The " + (bookData.details.tone || "Comprehensive") + " Training Workbook",
            "From Novice to Expert: " + (bookData.details.format || "A Training Guide"),
          ],
          fiction: [
            "The " + (bookData.details.style || "Mysterious") + " Journey",
            "Whispers of " + (bookData.details.tone || "Destiny"),
            "Beyond the " + (bookData.details.style || "Horizon"),
            "The Last " + (bookData.details.audience || "Hero"),
            "Echoes of " + (bookData.details.tone || "Time"),
            "The " + (bookData.details.style || "Secret") + " Chronicles",
          ],
          nonfiction: [
            "The Truth About " + (bookData.details.style || "Reality"),
            "Understanding " + (bookData.details.style || "Our World"),
            "A " +
              (bookData.details.tone || "Comprehensive") +
              " History of " +
              (bookData.details.style || "Knowledge"),
            "The " + (bookData.details.audience || "Reader's") + " Guide to " + (bookData.details.style || "Facts"),
            "Exploring " + (bookData.details.style || "Reality") + ": A " + (bookData.details.tone || "Journey"),
            "The " + (bookData.details.language || "Definitive") + " Handbook",
          ],
          creative: [
            "Painted Words: A " + (bookData.details.style || "Collection"),
            "The " + (bookData.details.tone || "Artistic") + " Expression",
            "Verses of " + (bookData.details.style || "Imagination"),
            "The " + (bookData.details.audience || "Creative") + " Mind",
            "Dreams and " + (bookData.details.style || "Visions"),
            "The " + (bookData.details.tone || "Colorful") + " Tapestry of Words",
          ],
          reference: [
            "The Complete " + (bookData.details.audience || "User's") + " Reference",
            "The " +
              (bookData.details.language || "Comprehensive") +
              " Encyclopedia of " +
              (bookData.details.style || "Knowledge"),
            "A-Z of " + (bookData.details.style || "Information"),
            "The Ultimate " +
              (bookData.details.audience || "Guide") +
              " to " +
              (bookData.details.style || "Everything"),
            "The " + (bookData.details.tone || "Definitive") + " Reference Manual",
            "The " + (bookData.details.language || "Complete") + " Compendium",
          ],
        }

        const generatedTitles = purposeTitles[bookData.purpose as keyof typeof purposeTitles] || [
          "Untitled Book Project",
          "New Book Creation",
          "Your Custom Book",
          "Personalized Publication",
          "Custom Content Creation",
          "Your Authored Work",
        ]

        setTitles(generatedTitles)

        // Animate titles appearing one by one
        setAnimatedTitles([])
        const animateInterval = setInterval(() => {
          setAnimatedTitles((prev) => {
            if (prev.length >= generatedTitles.length) {
              clearInterval(animateInterval)
              return prev
            }
            return [...prev, generatedTitles[prev.length]]
          })
        }, 300)

        setIsLoading(false)
      }, 1500)
    }

    generateTitles()
  }, [bookData])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-purple-600 blur-lg opacity-20 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        </div>
        <p className="text-gray-600 mt-6 text-center max-w-md">
          Our AI is crafting the perfect titles based on your book's purpose and details...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl p-5 mb-6">
        <div className="flex items-start">
          <div className="mr-4 mt-1 bg-white p-2 rounded-lg shadow-sm">
            <BookMarked className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-purple-800 mb-1">Title Suggestions</h3>
            <p className="text-sm text-gray-600">
              Based on your selections, we've generated these title suggestions for your {bookData.purpose} book. Choose
              one that resonates with your vision.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {animatedTitles.map((title, index) => (
          <div
            key={index}
            className={`border rounded-xl p-5 cursor-pointer transition-all duration-300 animate-fadeIn ${
              selectedTitle === title
                ? "border-purple-400 bg-gradient-to-r from-purple-50 to-white shadow-md"
                : "border-gray-200 hover:border-purple-200 hover:shadow-sm bg-white"
            }`}
            onClick={() => onSelect(title)}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-center justify-between">
              <h3 className={`font-medium text-lg ${selectedTitle === title ? "text-purple-800" : "text-gray-800"}`}>
                {title}
              </h3>

              {selectedTitle === title && (
                <div className="bg-purple-600 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookTitleStep

