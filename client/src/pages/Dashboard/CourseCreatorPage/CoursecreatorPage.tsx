import GettingStarted from "../../../components/dashboard/GettingStarted";
import Table from "../../../components/ui/Table";
import { useEffect, useState } from "react";

import apiService from "../../../utilities/service/api";
import { addItem, deleteItem, downloadItem, editItem } from "../../../utilities/shared/tableUtils";
import { useLocation, useNavigate } from "react-router";

const CoursecreatorPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  
 // Handle highlight from URL
 useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const highlight = searchParams.get('highlight');
  
  if (highlight) {
    setHighlightedId(highlight);
    
    // Remove highlight parameter from URL without triggering navigation
    searchParams.delete('highlight');
    const newUrl = `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
    
    // Clear highlight after animation
    const timer = setTimeout(() => {
      setHighlightedId(null);
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [location.search]);
  
  const handleCourses = (item: any) => {
    setCourses(item);
  };

  try {
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await apiService.get(
            "course-creator/getCourses/course",
            {}
          );
          const formattedCourses = response?.data?.map((course: any) => {
            const formatDate = (dateString: string) => {
              const options: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "short",
                day: "2-digit",
              };
              return new Date(dateString).toLocaleDateString(undefined, options);
            };

            return {
              ID: course.course_id,
              "Course Title": course.course_title,
              Created: formatDate(course.createdAt),
              Updated: formatDate(course.updatedAt),
              Content: course.content,
              type:course.type,
            };
          });

          setCourses(formattedCourses);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);
  } catch (error) {
    console.log(error);
  }


  return (
    <>
      <GettingStarted
        button={false}
        title="Create a course with our AI"
        description="What do you want your course to be about? (don't worry, you can always change the content or name of your course later!)"
      />

      {loading ? (
        <div className="flex justify-center items-center w-full py-4">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-10 h-10 animate-spin"></div>
          <p className="ml-4">Loading...</p>
        </div>
      ) : (
        <div className="flex items-center py-8 w-full">
        <Table
          data={courses}
          headers={["ID", "Course Name", "Created", "Updated","type"]}
          isAdd={true}
          addItem={addItem}
          deleteItem={deleteItem}
          downloadItem={(row: any) => downloadItem(row, setLoading)}
          editItem={editItem}
          setData={handleCourses}
          highlightedId={highlightedId}
          pre={""}
        />
      </div>
      )}

     
    </>
  );
};

export default CoursecreatorPage;
