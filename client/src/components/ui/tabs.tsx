import { useEffect, useState } from "react";
import Table from "./Table";
import apiService from "../../utilities/service/api";
import {
  addItem,
  deleteItem,
  downloadItem,
  editItem,
} from "../../utilities/shared/tableUtils";
import { useNavigate } from "react-router";
import { CircleFadingPlus } from "lucide-react";

const Tabs = () => {
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [tab, setTab] = useState("course");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);

  // Fetch data with pagination
  // Replace the fetch data function in the useEffect with this implementation:

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Add pagination params to API request
        const response = await apiService.get(
          `course-creator/getCourses/${tab}?page=${currentPage}&limit=${itemsPerPage}`
        );

        if (response.success) {
          // Format the response data from response.data array

          if (response.data.length === 0) {
            navigate("/create");
            return;
          }

          const formattedCourses = response.data.map((course: any) => {
            const formatDate = (dateString: string) => {
              const options: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "short",
                day: "2-digit",
              };
              return new Date(dateString).toLocaleDateString(
                undefined,
                options
              );
            };

            return {
              ID: course.course_id,
              "Course Title": course.course_title,
              Created: formatDate(course.createdAt),
              Updated: formatDate(course.updatedAt),
              Content: course.content,
              type: course.type,
            };
          });

          // Update state with formatted data and total count
          if (tab === "course") {
            setCourses(formattedCourses);
          } else {
            setBooks(formattedCourses);
          }

          // Set pagination info from the response
          if (response.pagination) {
            setTotalItems(response.pagination.totalItems);
            // Only update itemsPerPage if it differs from current state to avoid loops
            if (response.pagination.itemsPerPage !== itemsPerPage) {
              setItemsPerPage(response.pagination.itemsPerPage);
            }
            // Update current page if it differs from what we expect (defensive)
            if (response.pagination.currentPage !== currentPage) {
              setCurrentPage(response.pagination.currentPage);
            }
          }
        } else {
          console.error("API returned error:", response.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tab, currentPage, itemsPerPage]);

  // Handle tab change
  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setShowBook(newTab === "book");
  };

  // Handler for data updates
  const handleContentUpdate = (item: any) => {
    if (tab === "course") {
      setCourses(item);
    } else {
      setBooks(item);
    }
  };
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/create");
  };

  return (
    <div className="py-6">
      <div className="absolute right-7 mb-0 mr-5">
        <button
          id="add-new-item"
          onClick={handleNavigate}
          className=" flex items-center justify-center text-white bg-gradient-to-tl font-medium rounded-md text-sm px-12 py-6 transition-all duration-200 shadow-sm"
        >
          <CircleFadingPlus className="mr-2" />
          Create
        </button>
      </div>
      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 pt-6">
        <li className="me-2">
          <a
            id="course-tab"
            onClick={() => handleTabChange("course")}
            aria-current="page"
            className={
              !showBook
                ? "inline-block p-4 rounded-t-lg text-primary bg-gray-100 cursor-pointer"
                : "inline-block p-4 rounded-t-lg text-gray-500 bg-gray-50 cursor-pointer"
            }
          >
            Course
          </a>
        </li>
        <li className="me-2">
          <a
            id="book-tab"
            onClick={() => handleTabChange("book")}
            className={
              showBook
                ? "inline-block p-4 rounded-t-lg cursor-pointer text-primary bg-gray-100"
                : "inline-block p-4 rounded-t-lg cursor-pointer text-gray-500 bg-gray-50"
            }
          >
            Books
          </a>
        </li>
      </ul>
      <div id="data-table">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </div>
        ) : !showBook ? (
          <Table
            headers={[
              "Name",
              "Description",
              "Created At",
              "Updated At",
              "Type",
            ]}
            data={courses}
            isAdd={false}
            addItem={addItem}
            deleteItem={deleteItem}
            setData={handleContentUpdate}
            downloadItem={(row: any) => downloadItem(row, setLoading)}
            editItem={editItem}
            pre={"course-creator"}
            // Add pagination props
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        ) : (
          <Table
            headers={[
              "Name",
              "Description",
              "Created At",
              "Updated At",
              "Type",
            ]}
            data={books}
            isAdd={false}
            addItem={addItem}
            deleteItem={deleteItem}
            setData={handleContentUpdate}
            downloadItem={(row: any) => downloadItem(row, setLoading)}
            editItem={editItem}
            pre={"book-creator"}
            // Add pagination props
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>
    </div>
  );
};

export default Tabs;
