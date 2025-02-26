// language: tsx
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import apiService from "../../../utilities/service/api";
import ChapterGallery from "./ChapterGallery";
import { Book, ImageIcon } from "lucide-react";
import ImageGenerator from "../../../components/ui/ImageGenerator";
import { Button } from "../../../components/ui/button";

const EditCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  // const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [showImageGenerator, setShowImageGenerator] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null); // Add this ref

    const [AIImage, setAiIMage] = useState<string | null>(null);
    const handleAIImageSelect = (imageUrl: string) => {
      console.log(imageUrl, " Image URL");
      setAiIMage(imageUrl);
      setShowImageGenerator(false);
      // insertImage(imageUrl);
    }


    console.log(AIImage , " AI Image");

  const [selectedChapter, setSelectedChapter] = useState<string>("");
  
  const handleSectionSelect = (sectionContent: string) => {
    setSelectedChapter(sectionContent);
  };


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Hardcoding type as "course"
        const response: any = await apiService.get(
          `/course-creator/getCourseById/${id}/course`,
          {}
        );
        setCourseData(response.data);
      } catch (err: any) {
        setError(err.message || "Error fetching course data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  // Parse chapters from the course content (if exists)
  let chapters: string[] = [];
  if (courseData?.content) {
    try {
      chapters = JSON.parse(courseData.content);
    } catch (e) {
      console.error("Error parsing course content", e);
    }
  }

  const handleChapterSelect = (chapterContent: string) => {

    console.log(chapterContent, "Chapter Content");
    setSelectedChapter(chapterContent);
  };

  

  return (
    <div className="flex flex-col sm:flex-row p-4 space-y-6 sm:space-y-0 sm:space-x-6">
      <div className="flex-1 p-6 bg-white rounded-lg shadow-md ">
     

      <div className="flex items-center justify-between mb-4">
  {/* Title on the left */}
  <div className="flex items-center gap-2">
    <Book className="w-5 h-5 text-purple-500" />
    <h2 className="text-xl font-bold text-purple-800">Edit Chapter</h2>
  </div>

  {/* AI Image button on the right */}
  <div className="relative">
    <Button 
    color="destructive"
    variant="soft"
    size="sm"
      ref={buttonRef}
      onClick={() => setShowImageGenerator(!showImageGenerator)} 
      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2"
      title={showImageGenerator ? 'Hide AI Image Generator' : 'Generate AI Image'}
    >
      <ImageIcon className="w-5 h-5 text-gray-600" />
      <span className="text-sm text-gray-700">AI Image</span>
    </Button>

    {showImageGenerator && (
    <div className="image-generator-popover">
    <div className="relative">
      <div 
        className="absolute w-3 h-3 bg-white transform rotate-45 right-4 top-0 -translate-y-1/2 border-l border-t border-purple-100"
      ></div>
      <ImageGenerator onImageSelect={handleAIImageSelect} />
    </div>
  </div>
    )}
  </div>
</div>
      <RichTextEditor
          initialContent={selectedChapter}
          imageUrl={AIImage}  // Pass the AIImage URL here

       
        />
      </div>
      <ChapterGallery 
        chapters={chapters} 
        onSelectChapter={handleChapterSelect}
        onSelectSection={handleSectionSelect}
      />    </div>
  );
};

export default EditCoursePage;