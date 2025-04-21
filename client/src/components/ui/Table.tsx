import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShareItem } from "../../utilities/shared/tableUtils";
import { 
  Search, 
  PlusCircle, 
  Edit, 
  Download, 
  Share2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  CalendarDays,
  Clock,
  FileText
} from "lucide-react";

interface TableProps {
  headers: string[];
  data: { [key: string]: string | number }[];
  isAdd: Boolean;
  addItem: CallableFunction;
  deleteItem: CallableFunction;
  downloadItem: CallableFunction;
  editItem: CallableFunction;
  setData: any;
  highlightedId?: string | null;
  pre: any;
  // New pagination props
  totalItems?: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

const Table = ({ 
  headers, 
  data, 
  addItem, 
  isAdd, 
  deleteItem, 
  downloadItem, 
  editItem, 
  setData, 
  highlightedId, 
  pre,
  // Pagination props with defaults
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange
}: TableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // For client-side search/filter
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle row click to edit
  const handleRowClick = (item: any) => {
    editItem(navigate, item, pre);
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };
  
  // Get relevant fields to display
  const getRelevantField = (item: any, fieldType: 'title' | 'created' | 'updated' | 'type') => {
    switch (fieldType) {
      case 'title':
        return item['Course Title'] || item['Book Title'] || item['Title'] || item['Name'] || item['Description'] || '';
      case 'created':
        return item['Created'] || item['CreatedAt'] || item['Date Created'] || '';
      case 'updated':
        return item['Updated'] || item['UpdatedAt'] || item['Last Modified'] || '';
      case 'type':
        return item['type'] || item['Type'] || item['Content Type'] || '';
      default:
        return '';
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <section className="w-full">
      <div className="w-full">
        {/* Main Content */}
        <div className="bg-white relative shadow-sm sm:rounded-lg overflow-hidden w-full p-2">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 p-2"
                  placeholder="Search content..."
                />
              </div>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              {isAdd && (
                <button
                  type="button"
                  className="flex items-center justify-center text-white bg-gradient-to-tl from-purple-600 to-purple-700 font-medium rounded-md text-sm px-4 py-2 transition-all duration-200 shadow-sm"
                  onClick={() => addItem(navigate)}
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Create New
                </button>
              )}
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Title</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Created</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors
                        ${item.ID == highlightedId ? 'bg-gray-50 border-l-4 border-l-purple-500' : ''}
                      `}
                    >
                      {/* Table row content remains the same */}
                      {/* Title */}
                      <td 
                        className="px-4 py-3 font-medium text-gray-900 cursor-pointer"
                        onClick={() => handleRowClick(item)}
                      >
                        <div className="flex items-center space-x-2">
                          <FileText size={16} className="text-gray-500 flex-shrink-0" />
                          <span className="hover:text-gray-700 transition-colors line-clamp-1">
                            {getRelevantField(item, 'title')}
                          </span>
                        </div>
                      </td>
                      
                      {/* Created Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-gray-500">
                          <CalendarDays size={14} className="mr-1.5 text-gray-400" />
                          {getRelevantField(item, 'created')}
                        </div>
                      </td>
                      
                      {/* Updated Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-gray-500">
                          <Clock size={14} className="mr-1.5 text-gray-400" />
                          {getRelevantField(item, 'updated')}
                        </div>
                      </td>
                      
                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {getRelevantField(item, 'type')}
                        </span>
                      </td>
                      
                      {/* Action buttons - always visible */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRowClick(item)}
                            className="p-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 shadow-sm transition-colors"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => downloadItem(item)}
                            className="p-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 shadow-sm transition-colors"
                            title="Download"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => ShareItem(navigate, item)}
                            className="p-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 shadow-sm transition-colors"
                            title="Share"
                          >
                            <Share2 size={15} />
                          </button>
                          <button
                            onClick={() => deleteItem(item, setData)}
                            className="p-1.5 text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-red-500 rounded border border-gray-200 shadow-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Search size={28} className="text-gray-300 mb-2" />
                        <p>No content found. Try a different search or create a new item.</p>
                        {isAdd && (
                          <button
                            className="mt-4 flex items-center justify-center text-white bg-gradient-to-tl from-purple-600 to-purple-700 font-medium rounded-md text-sm px-4 py-2 transition-all duration-200 shadow-sm"
                            onClick={() => addItem(navigate)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1.5" />
                            Create New
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          <nav
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4 border-t border-gray-200"
            aria-label="Table navigation"
          >
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{data.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - 
                <span className="font-medium text-gray-700">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                <span className="font-medium text-gray-700">{totalItems}</span> items
              </span>
              
              {onItemsPerPageChange && (
  <div className="flex items-center space-x-2">
    <label className="text-sm text-gray-500">Items per page:</label>
    <select 
      className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1 pr-8 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
      value={itemsPerPage}
      onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
      style={{ minWidth: '70px' }}
    >
      {[5, 10, 25, 50].map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
   
  </div>
)}
            </div>
            
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center h-8 px-3 text-gray-500 bg-white rounded-l-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ChevronLeft size={16} />
                </button>
              </li>
              
              {getPageNumbers().map((page, index) => (
                <li key={index}>
                  {page === '...' ? (
                    <span className="flex items-center justify-center h-8 px-3 text-gray-500 bg-white border border-gray-300">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`flex items-center justify-center h-8 px-3 border border-gray-300 
                        ${currentPage === page 
                          ? 'text-white bg-purple-600 hover:bg-purple-700' 
                          : 'text-gray-500 bg-white hover:bg-gray-50'}`
                      }
                    >
                      {page}
                    </button>
                  )}
                </li>
              ))}
              
              <li>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center h-8 px-3 text-gray-500 bg-white rounded-r-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default Table;