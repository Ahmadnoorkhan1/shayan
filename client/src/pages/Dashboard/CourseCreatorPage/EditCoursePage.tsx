// language: tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import apiService from "../../../utilities/service/api";
import ChapterGallery from "./ChapterGallery";

const EditCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");

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

  

  return (
    <div className="flex flex-col sm:flex-row p-4 space-y-6 sm:space-y-0 sm:space-x-6">
      <div className="flex-1 p-6 bg-white rounded-lg shadow-md ">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Chapter</h2>
        <RichTextEditor
          initialContent={selectedChapter}
       
        />
      </div>
      <ChapterGallery chapters={chapters} onSelectChapter={setSelectedChapter} />
    </div>
  );
};

export default EditCoursePage;