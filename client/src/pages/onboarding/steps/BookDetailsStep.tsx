"use client"

import type React from "react"
import { useState } from "react"
import { ContentDetail } from "../BookGenerationStepper"
import { CustomSelect } from "../../../components/ui/Select"

interface ContentDetailsStepProps {
  selectedDetails: Record<string, string>
  onChange: (detailId: string, value: string) => void
}

const ContentDetailsStep: React.FC<ContentDetailsStepProps> = ({ selectedDetails, onChange }) => {
  const [activeDetail, setActiveDetail] = useState<string | null>(null)

  const details: ContentDetail[] = [
    {
      id: "style",
      name: "Content Style",
      options: ["Academic", "Conversational", "Technical", "Narrative", "Instructional", "Poetic", "Journalistic", "Business"],
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
        "Beginners",
        "Intermediate Learners",
        "Advanced Practitioners",
        "Executives",
        "Educators",
      ],
      value: selectedDetails.audience || "",
    },
    {
      id: "length",
      name: "Length/Depth",
      options: ["Brief", "Standard", "Comprehensive", "In-depth", "Bite-sized", "Extended Series"],
      value: selectedDetails.length || "",
    },
    {
      id: "structure",
      name: "Content Structure",
      options: [
        "Standard Chapters",
        "Modules/Lessons",
        "Q&A Format",
        "Step-by-Step Guide",
        "Case Studies",
        "Theory & Practice",
        "Problem-Solution",
        "Sequential Learning",
        "Thematic Organization"
      ],
      value: selectedDetails.structure || "",
    },
    {
      id: "tone",
      name: "Tone",
      options: ["Formal", "Informal", "Humorous", "Serious", "Inspirational", "Critical", "Neutral", "Enthusiastic", "Authoritative"],
      value: selectedDetails.tone || "",
    },
    {
      id: "media",
      name: "Media Type",
      options: [
        "Text-only",
        "Text with Graphics",
        "Illustrated",
        "Interactive Elements",
        "Video Support",
        "Audio Companion",
        "Multi-format"
      ],
      value: selectedDetails.media || "",
    },
  ]

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-6">
        Customize your content by selecting options for each category below. Fill at least 3 categories to continue.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {details?.map((detail) => {
          const isActive = activeDetail === detail.id
          const isSelected = !!detail.value

          return (
            <div
              key={detail.id}
              onClick={() => setActiveDetail(detail.id)}
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

export default ContentDetailsStep