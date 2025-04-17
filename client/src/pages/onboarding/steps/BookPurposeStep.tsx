"use client"


import { BookOpen, GraduationCap, Lightbulb, BookText, Palette, BookMarked, Video, FileText, Globe, Presentation, BookCopy, MonitorPlay, Blocks, FileQuestion } from "lucide-react"
import { useState } from "react"

interface ContentPurposeStepProps {
  selectedPurpose: string
  onSelect: (purposeId: string, categoryId: string) => void
}

const ContentPurposeStep: React.FC<ContentPurposeStepProps> = ({ selectedPurpose, onSelect }) => {
  const [hoveredPurpose, setHoveredPurpose] = useState<string | null>(null)

  const categories = [
    {
      id: "book",
      title: "Book",
      icon: <BookOpen className="w-8 h-8 mb-1" />,
      purposes: [
        {
          id: "educational_book",
          title: "Educational Book",
          description: "Create textbooks, study guides, or educational resources for students and learners.",
          icon: <GraduationCap className="w-10 h-10" />,
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
          id: "training_book",
          title: "Training Manual",
          description: "Develop professional training materials, workbooks, or skill development guides.",
          icon: <BookCopy className="w-10 h-10" />,
        },
      ]
    },
    {
      id: "course",
      title: "Course",
      icon: <Presentation className="w-8 h-8 mb-1" />,
      purposes: [
        {
          id: "educational_course",
          title: "Educational Course",
          description: "Build comprehensive learning experiences with lessons, exercises, and assessments.",
          icon: <Presentation className="w-10 h-10" />,
        },
        {
          id: "interactive_course",
          title: "Interactive Course",
          description: "Create engaging courses with interactive elements, quizzes, and activities.",
          icon: <Blocks className="w-10 h-10" />,
        },
        {
          id: "training_course",
          title: "Skills Training",
          description: "Develop professional training courses focused on practical skill development with exercises.",
          icon: <MonitorPlay className="w-10 h-10" />,
        },
        {
          id: "quick_guide",
          title: "Quick Guide",
          description: "Create short-form content like tutorials, how-to guides, or quick reference materials.",
          icon: <FileQuestion className="w-10 h-10" />,
        },
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {categories?.map((category) => (
        <div key={category.id} className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="text-purple-500">
              {category.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{category.title}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {category.purposes.map((purpose) => {
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
                  onClick={() => onSelect(purpose.id, category.id)}
                  onMouseEnter={() => setHoveredPurpose(purpose.id)}
                  onMouseLeave={() => setHoveredPurpose(null)}
                >
                  {/* Background decoration */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-transparent opacity-0 -translate-y-16 translate-x-16 transition-all duration-500 ${
                      isSelected || isHovered ? "opacity-50 -translate-y-12 translate-x-12" : ""
                    }`}
                  ></div>

                  <div className="relative p-5 flex flex-col h-full">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                        isSelected
                          ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-md"
                          : "bg-purple-50 text-purple-500"
                      }`}
                    >
                      {purpose.icon}
                    </div>

                    <h3
                      className={`text-lg font-semibold mb-2 transition-colors ${
                        isSelected ? "text-purple-800" : "text-gray-800"
                      }`}
                    >
                      {purpose.title}
                    </h3>

                    <p className="text-gray-600 text-sm flex-grow">{purpose.description}</p>

                    <div
                      className={`mt-3 h-1 w-14 rounded-full transition-all duration-300 ${
                        isSelected ? "bg-purple-500" : "bg-gray-200 group-hover:bg-purple-200"
                      }`}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContentPurposeStep