import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShareItem } from "../../utilities/shared/tableUtils";

interface TableProps {
  headers: string[];
  data: { [key: string]: string | number }[];
  isAdd: Boolean,
  addItem: CallableFunction,
  deleteItem: CallableFunction,
  downloadItem: CallableFunction,
  editItem: CallableFunction,
  setData: any
  highlightedId?: string | null,
  pre: any
}

const Table = ({ headers, data, addItem, isAdd, deleteItem, downloadItem, editItem, setData, highlightedId, pre }: TableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [optionsIndex, setOptionsIndex] = useState<number | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, right: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navigate = useNavigate();

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOptionsIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Position the popover correctly
  const showOptions = (index: number) => {
    if (optionsIndex === index) {
      setOptionsIndex(null);
      return;
    }
    
    const button = buttonRefs.current[index];
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const isNearRightEdge = window.innerWidth - rect.right < 150;
    
    setPopoverPosition({
      top: rect.bottom + window.scrollY,
      right: isNearRightEdge ? window.innerWidth - rect.right : window.innerWidth - rect.left - 150
    });
    
    setOptionsIndex(index);
  };

  // Filter the data based on the search term
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <section className="w-full">
      <div className="w-full">
        {/* Main Content */}
        <div className="bg-white relative shadow-md sm:rounded-lg overflow-hidden w-full p-2">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div className="w-full md:w-1/2">
              <form className="flex items-center">
                <label htmlFor="simple-search" className="sr-only">
                  Search
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="simple-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2"
                    placeholder="Search"
                    required
                  />
                </div>
              </form>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              {
                isAdd &&
                <button
                  type="button"
                  className="flex items-center justify-center text-black border-black border bg-primary-700 hover:bg-primary-800 focus:border-primary focus:shadow-2xl focus:scale-105 focus:bg-primary focus:text-white font-medium rounded-lg text-sm px-4 py-2"
                  onClick={() => addItem(navigate)}
                >
                  <svg
                    className="h-3.5 w-3.5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    />
                  </svg>
                  Add
                </button>
              }
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} scope="col" className="px-4 py-3">
                      {header}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((item, index) => (
                  <tr key={index} className={`bg-white border-b hover:bg-gray-50 transition-all duration-300
                     ${item.ID == highlightedId
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-purple-500 shadow-lg animate-highlight'
                      : 'bg-white border-gray-200'
                    }`}>
                    {Object.keys(item).map((key, idx) => (
                      idx !== 4 &&
                      <td key={idx} className="px-4 py-3 whitespace-normal break-words">
                        {item[key]}
                      </td>
                    ))}
                    <td className="px-4 py-3 relative">
                      <div className="flex items-center justify-end">
                        <button
                          ref={el => buttonRefs.current[index] = el}
                          className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none"
                          type="button"
                          aria-haspopup="true"
                          aria-expanded={optionsIndex === index ? "true" : "false"}
                          onClick={() => showOptions(index)}
                        >
                          <svg
                            className="w-5 h-5"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fixed position popover that follows the button */}
          {optionsIndex !== null && (
            <div
              ref={popoverRef}
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg"
              style={{
                top: `${popoverPosition.top}px`,
                right: `${popoverPosition.right}px`,
              }}
              role="menu"
            >
              <ul className="py-1">
                <li>
                  <button
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => {
                      downloadItem(filteredData[optionsIndex]);
                      setOptionsIndex(null);
                    }}
                  >
                    Download
                  </button>
                </li>
                <li>
                  <button
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => {
                      ShareItem(navigate, filteredData[optionsIndex]);
                      setOptionsIndex(null);
                    }}
                  >
                    Share
                  </button>
                </li>
                <li>
                  <button
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => {
                      editItem(navigate, filteredData[optionsIndex], pre);
                      setOptionsIndex(null);
                    }}
                  >
                    Edit
                  </button>
                </li>
                <li>
                  <button
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => {
                      deleteItem(filteredData[optionsIndex], setData);
                      setOptionsIndex(null);
                    }}
                  >
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          )}

          <nav
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
            aria-label="Table navigation"
          >
            <span className="text-sm font-normal text-gray-500">
              Showing
              <span className="font-semibold text-gray-900">
                {" " + data.length + " "}
              </span>
              of
              <span className="font-semibold text-gray-900">
                {" " + data.length}
              </span>
            </span>
            <ul className="inline-flex items-stretch -space-x-px">
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                >
                  1
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default Table;