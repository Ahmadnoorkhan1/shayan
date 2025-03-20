"use client"

import type React from "react"

// import type { BookDetail } from "../book-generation-stepper"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select"
// import { CustomSelect } from "../../components/ui/select"

import { useState } from "react"
import { BookDetail } from "../BookGenerationStepper"
import { CustomSelect } from "../../../components/ui/Select"

interface BookDetailsStepProps {
  selectedDetails: Record<string, string>
  onChange: (detailId: string, value: string) => void
}

const BookDetailsStep: React.FC<BookDetailsStepProps> = ({ selectedDetails, onChange }) => {
  const [activeDetail, setActiveDetail] = useState<string | null>(null)

  const details: BookDetail[] = [
    {
      id: "style",
      name: "Writing Style",
      options: ["Academic", "Conversational", "Technical", "Narrative", "Instructional", "Poetic"],
      value: selectedDetails.style || "",
    },
    {
      id: "audience",
      name: "Target Audience",
      options: [
        "Children (Ages 5-12)",
        "Young Adults (Ages 13-17)",
        "College Students",
        "Professionals",
        "General Adult Readers",
        "Seniors",
      ],
      value: selectedDetails.audience || "",
    },
    {
      id: "language",
      name: "Language Level",
      options: ["Beginner", "Intermediate", "Advanced", "Technical", "Simplified", "Academic"],
      value: selectedDetails.language || "",
    },
    {
      id: "chapters",
      name: "Number of Chapters",
      options: ["5", "10", "15", "20", "25", "30"],
      value: selectedDetails.chapters || "",
    },
    {
      id: "tone",
      name: "Tone",
      options: ["Formal", "Informal", "Humorous", "Serious", "Inspirational", "Critical"],
      value: selectedDetails.tone || "",
    },
    {
      id: "format",
      name: "Book Format",
      options: [
        "Standard Chapters",
        "Workbook with Exercises",
        "Illustrated Guide",
        "Q&A Format",
        "Case Studies",
        "Step-by-Step Guide",
      ],
      value: selectedDetails.format || "",
    },
  ]

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-6">
        Customize your book by selecting options for each category below. Fill at least 3 categories to continue.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {details.map((detail) => {
          const isActive = activeDetail === detail.id
          const isSelected = !!detail.value

          return (
            <div
              key={detail.id}
              className={`relative rounded-xl transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-r from-purple-50 to-white border border-purple-100"
                  : "bg-white border border-gray-100 hover:border-purple-100"
              } ${isActive ? "shadow-md" : ""} p-5`}
            >
              <label
                htmlFor={detail.id}
                className={`block text-sm font-medium mb-2 transition-colors ${
                  isSelected ? "text-purple-700" : "text-gray-700"
                }`}
              >
                {detail.name}
              </label>

              <CustomSelect
  value={detail.value}
  options={detail.options}
  placeholder={`Select ${detail.name}`}
  onChange={(value) => onChange(detail.id, value)}
  isSelected={isSelected}
  className="hover:border-purple-300 focus:ring-purple-200"
/>

              {isSelected && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-purple-500 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (Object.keys(selectedDetails).length / 3) * 100)}%` }}
            ></div>
          </div>

          <div className="ml-4 text-sm font-medium text-gray-600">
            {Object.keys(selectedDetails).length >= 3 ? (
              <span className="text-purple-600">Ready to continue!</span>
            ) : (
              <span>{3 - Object.keys(selectedDetails).length} more selections needed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetailsStep

