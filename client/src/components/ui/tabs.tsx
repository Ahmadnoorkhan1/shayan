import { useEffect, useState } from "react";
import Table from "./Table";
import apiService from "../../utilities/service/api";
import { addItem, deleteItem, downloadItem, editItem } from "../../utilities/shared/tableUtils";

const Tabs = () => {
  const [courses,setCourses] = useState([]);
  const [books,setBooks] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [tab,setTab] = useState('course')
  const [loading, setLoading] = useState(false);

  try {
    useEffect(() => {
      const fetchData = async () => {
        const response = await await apiService.get(
          "course-creator/getCourses/"+tab,
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
            type:course.type
          };
        });
        tab==='course' ? setCourses(formattedCourses) : setBooks(formattedCourses);
      };
      fetchData();
    }, [tab]);
  } catch (error) {
    console.log(error);
  }

  const handleCourses = (item:any) =>{
    setCourses(item)
  }
  const handleBooks = (item:any) =>{
    setCourses(item)
  }


  return (
    <>
      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 pt-6 ">
        <li className="me-2">
          <a
            onClick={() => {setShowBook(false); setTab('course');}}
            aria-current="page"
            className={
              !showBook
                ? "inline-block p-4 rounded-t-lg text-primary bg-gray-100 cursor-pointer  "
                : "inline-block p-4 rounded-t-lg text-gray-500 bg-gray-50 cursor-pointer "
            }
          >
            Course
          </a>
        </li>
        <li className="me-2">
          <a
            onClick={() => {setShowBook(true); setTab('book');}}
            className={
              showBook
                ? "inline-block p-4 rounded-t-lg cursor-pointer text-primary bg-gray-100  "
                : " inline-block p-4 rounded-t-lg cursor-pointer text-gray-500 bg-gray-50  "
            }
          >
            Books
          </a>
        </li>
      </ul>
      {!showBook ? (
        <>
          <Table
            headers={["Name", "Description", "Created At", "Updated At","Type"]}
            data={courses}
            isAdd={false}
            addItem={addItem}
            deleteItem={deleteItem}
            setData={handleCourses}
            downloadItem={(row: any) => downloadItem(row, setLoading)}
            editItem={editItem}
            pre={"course-creator"}
          />
        </>
      ) : (
        <>
          {" "}
          <Table
            headers={["Name", "Description", "Created At", "Updated At","Type"]}
            data={books}
            isAdd={false}
            addItem={addItem}
            deleteItem={deleteItem}
            setData={handleBooks}
            downloadItem={(row: any) => downloadItem(row, setLoading)}
            editItem={editItem}
            pre={"book-creator"}
          />
        </>
      )}
    </>
  );
};

export default Tabs;
