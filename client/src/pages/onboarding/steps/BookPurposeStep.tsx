"use client"

import type React from "react"

import { BookOpen, GraduationCap, Lightbulb, BookText, Palette, BookMarked, Video, FileText, Globe, Presentation } from "lucide-react"
import { useState } from "react"
import { ContentPurpose } from "../BookGenerationStepper"

interface ContentPurposeStepProps {
  selectedPurpose: string
  onSelect: (purposeId: string) => void
}

const ContentPurposeStep: React.FC<ContentPurposeStepProps> = ({ selectedPurpose, onSelect }) => {
  const [hoveredPurpose, setHoveredPurpose] = useState<string | null>(null)

  const purposes: ContentPurpose[] = [
    {
      id: "educational",
      title: "Educational",
      description: "Create textbooks, study guides, or educational resources for students and learners.",
      icon: <GraduationCap className="w-10 h-10" />,
    },
    {
      id: "training",
      title: "Training & Development",
      description: "Develop professional training materials, workbooks, or skill development guides.",
      icon: <Lightbulb className="w-10 h-10" />,
    },
    {
      id: "fiction",
      title: "Fiction",
      description: "Write engaging stories, novels, or creative fiction in various genres.",
      icon: <BookOpen className="w-10 h-10" />,
    },
    {
      id: "nonfiction",
      title: "Non-Fiction",
      description: "Create informative content like biographies, histories, or explanatory texts.",
      icon: <BookText className="w-10 h-10" />,
    },
    {
      id: "course",
      title: "Course",
      description: "Build comprehensive learning experiences with lessons, exercises, and assessments.",
      icon: <Presentation className="w-10 h-10" />,
    },
    {
      id: "blog",
      title: "Blog or Article",
      description: "Write engaging online content, articles, or blog posts on various topics.",
      icon: <FileText className="w-10 h-10" />,
    },
    // {
    //   id: "video",
    //   title: "Video Script",
    //   description: "Create scripts for educational videos, tutorials, or presentations.",
    //   icon: <Video className="w-10 h-10" />,
    // },
    // {
    //   id: "reference",
    //   title: "Reference Material",
    //   description: "Create encyclopedias, dictionaries, or comprehensive reference materials.",
    //   icon: <BookMarked className="w-10 h-10" />,
    // },
    // {
    //   id: "web",
    //   title: "Web Content",
    //   description: "Develop content for websites, landing pages, or digital platforms.",
    //   icon: <Globe className="w-10 h-10" />,
    // },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {purposes.map((purpose) => {
        const isSelected = selectedPurpose === purpose.id
        const isHovered = hoveredPurpose === purpose.id

        return (
          <div
            key={purpose.id}
            className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer group ${
              isSelected
                ? "ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-white"
                : "border border-gray-200 hover:border-purple-200 bg-white hover:shadow-md"
            }`}
            onClick={() => onSelect(purpose.id)}
            onMouseEnter={() => setHoveredPurpose(purpose.id)}
            onMouseLeave={() => setHoveredPurpose(null)}
          >
            {/* Background decoration */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-transparent opacity-0 -translate-y-16 translate-x-16 transition-all duration-500 ${
                isSelected || isHovered ? "opacity-50 -translate-y-12 translate-x-12" : ""
              }`}
            ></div>

            <div className="relative p-6 flex flex-col h-full">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-md"
                    : "bg-purple-50 text-purple-500"
                }`}
              >
                {purpose.icon}
              </div>

              <h3
                className={`text-xl font-semibold mb-2 transition-colors ${
                  isSelected ? "text-purple-800" : "text-gray-800"
                }`}
              >
                {purpose.title}
              </h3>

              <p className="text-gray-600 text-sm flex-grow">{purpose.description}</p>

              <div
                className={`mt-4 h-1 w-16 rounded-full transition-all duration-300 ${
                  isSelected ? "bg-purple-500" : "bg-gray-200 group-hover:bg-purple-200"
                }`}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ContentPurposeStep