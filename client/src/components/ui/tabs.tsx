import { useEffect, useState } from "react";
import Table from "./Table";
import apiService from "../../utilities/service/api";

const Tabs = () => {
  const [courses,setCourses] = useState([]);
  const [books,setBooks] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [tab,setTab] = useState('course')
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
            headers={["Name", "Description", "Created At", "Updated At"]}
            data={courses}
            isAdd={false}
            addItem={()=>{}}
            deleteItem={()=>{}}
            downloadItem={()=>{}}
            setData={handleCourses}
            editItem={()=>{}}

          />
        </>
      ) : (
        <>
          {" "}
          <Table
            headers={["Name", "Description", "Created At", "Updated At"]}
            data={books}
            isAdd={false}
            addItem={()=>{}}
            deleteItem={()=>{}}
            downloadItem={()=>{}}
            setData={handleBooks}
            editItem={()=>{}}
          />
        </>
      )}
    </>
  );
};

export default Tabs;
