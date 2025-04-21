"use client"

import { useState } from "react"
import { CustomSelect } from "../../../components/ui/Select"
import { ChevronDown, ChevronUp, Settings, Users, BookOpen } from "lucide-react"

interface ContentDetailsStepProps {
  selectedDetails: Record<string, string>
  onChange: (detailId: string, value: string) => void
}

const ContentDetailsStep: React.FC<ContentDetailsStepProps> = ({ selectedDetails, onChange }) => {
  const [activeDetail, setActiveDetail] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Split details into essential and advanced categories
  const essentialDetails: any[] = [
    {
      id: "audience",
      name: "Target Audience",
      icon: <Users size={18} className="text-purple-500" />,
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
      description: "Who will be reading or consuming your content?"
    },
    {
      id: "style",
      name: "Content Style",
      icon: <BookOpen size={18} className="text-purple-500" />,
      options: ["Academic", "Conversational", "Technical", "Narrative", "Instructional", "Poetic", "Journalistic", "Business"],
      value: selectedDetails.style || "",
      description: "The overall writing approach and presentation style"
    },
    {
      id: "length",
      name: "Length/Depth",
      icon: <BookOpen size={18} className="text-purple-500" />,
      options: ["Brief", "Standard", "Comprehensive", "In-depth", "Bite-sized", "Extended Series"],
      value: selectedDetails.length || "",
      description: "How extensive should the content be?"
    },
    {
      id: "numOfChapters",
      name: "Number of Chapters",
      icon: <BookOpen size={18} className="text-purple-500" />,
      options: ["3", "5", "7", "10", "12", "15"],  // Add options for chapter count
      value: selectedDetails.numOfChapters?.toString() || "3",
      description: "How many chapters should the content have?"
    },
  ]

  const advancedDetails: any[] = [
    {
      id: "structure",
      name: "Content Structure",
      icon: <Settings size={18} className="text-purple-500" />,
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
      description: "How the content is organized and presented"
    },
    {
      id: "tone",
      name: "Tone",
      icon: <Settings size={18} className="text-purple-500" />,
      options: ["Formal", "Informal", "Humorous", "Serious", "Inspirational", "Critical", "Neutral", "Enthusiastic", "Authoritative"],
      value: selectedDetails.tone || "",
      description: "The emotional quality of the writing"
    },
    {
      id: "media",
      name: "Media Type",
      icon: <Settings size={18} className="text-purple-500" />,
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
      description: "What formats and media elements to include"
    },
  ]

  const renderDetailCard = (detail: any) => {
    const isActive = activeDetail === detail.id;
    const isSelected = !!selectedDetails[detail.id];

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
        <div className="flex items-center gap-2 mb-3">
          {detail.icon}
          <label
            htmlFor={detail.id}
            className={`block text-sm font-medium transition-colors ${
              isSelected ? "text-purple-700" : "text-gray-700"
            }`}
          >
            {detail.name}
          </label>
        </div>

        {detail?.description && (
          <p className="text-xs text-gray-500 mb-3">{detail.description}</p>
        )}

        <CustomSelect
          id={detail.id as any}
          value={selectedDetails[detail.id] || ""}
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
    );
  }

  // Count total selections for progress
  const totalSelections = Object.keys(selectedDetails).length;
  const requiredSelections = 4;
  const progress = Math.min(100, (totalSelections / requiredSelections) * 100);
  
  // Count selections in each category for showing badges
  const essentialSelectionsCount = essentialDetails.filter(detail => 
    selectedDetails[detail.id]).length;
  const advancedSelectionsCount = advancedDetails.filter(detail => 
    selectedDetails[detail.id]).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Essential Details</h3>
        <p className="text-sm text-gray-500 mb-4">
          Please select these basic options to help us tailor your content.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {essentialDetails.map(renderDetailCard)}
        </div>
        {essentialSelectionsCount > 0 && (
          <div className="mt-2 text-sm text-right text-purple-600 font-medium">
            {essentialSelectionsCount}/{essentialDetails.length} selected
          </div>
        )}
      </div>

      <div className="relative pt-6 mt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
        >
          {showAdvanced ? (
            <>
              <ChevronUp size={16} className="mr-2" />
              Hide Advanced Options
            </>
          ) : (
            <>
              <ChevronDown size={16} className="mr-2" />
              Show Advanced Options {advancedSelectionsCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full">
                  {advancedSelectionsCount}
                </span>
              )}
            </>
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Advanced Options <span className="text-sm font-normal text-gray-500">(Optional)</span></h3>
            <p className="text-sm text-gray-500 mb-4">
              Fine-tune your content with these additional settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advancedDetails.map(renderDetailCard)}
            </div>
            {advancedSelectionsCount > 0 && (
              <div className="mt-2 text-sm text-right text-purple-600 font-medium">
                {advancedSelectionsCount}/{advancedDetails.length} selected
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="ml-4 text-sm font-medium text-gray-600">
            {totalSelections >= requiredSelections ? (
              <span className="text-purple-600">Ready to continue!</span>
            ) : (
              <span>{requiredSelections - totalSelections} more selections needed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentDetailsStep