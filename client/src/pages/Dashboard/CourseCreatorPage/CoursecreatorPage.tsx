import GettingStarted from "../../../components/dashboard/GettingStarted";
import Table from "../../../components/ui/Table";
import { useEffect, useState } from "react";


import apiService from "../../../utilities/service/api";
import { addItem, deleteItem, downloadItem, editItem } from "../../../utilities/shared/tableUtils";
const CoursecreatorPage = () => {
  const [courses, setCourses] = useState([]);

  const handleCourses = (item:any) =>{
    setCourses(item)
  }

  try {
    useEffect(() => {
      const fetchData = async () => {
        const response = await await apiService.get(
          "course-creator/getCourses/course",
          {}
        );
        const formattedCourses = response.data.map((course: any) => {
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
          };
        });
        setCourses(formattedCourses);
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
        title="Create a book with our AI"
        description=" What do you want your book to be about?
(don't worry, you can always change the content or name of your book later!)"
      />
      <div className="flex items-center py-8 w-full ">
        <Table
          data={courses}
          headers={["ID", "Course Name", "Created", "Updated"]}
          isAdd={true}
          addItem={addItem}
          deleteItem={deleteItem}
          downloadItem={downloadItem}
          editItem={editItem}
          setData={handleCourses}
        />
      </div>
    </>
  );
};

export default CoursecreatorPage;
