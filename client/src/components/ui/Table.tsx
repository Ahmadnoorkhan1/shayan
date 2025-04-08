import { useState } from "react";
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
  const navigate = useNavigate();

  // Filter the data based on the search term
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle row click to edit
  const handleRowClick = (item: any) => {
    editItem(navigate, item, pre);
  };
  
  // Get relevant fields to display
  const getRelevantField = (item: any, fieldType: 'title' | 'created' | 'updated' | 'type') => {
    switch (fieldType) {
      case 'title':
        // Look for title, name, or description fields
        return item['Course Title'] || item['Book Title'] || item['Title'] || item['Name'] || item['Description'] || '';
      
      case 'created':
        // Look for created or date fields
        return item['Created'] || item['CreatedAt'] || item['Date Created'] || '';
        
      case 'updated':
        // Look for updated fields
        return item['Updated'] || item['UpdatedAt'] || item['Last Modified'] || '';
        
      case 'type':
        // Look for type field
        return item['type'] || item['Type'] || item['Content Type'] || '';
        
      default:
        return '';
    }
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
                  className="flex items-center justify-center text-white bg-gradient-to-tl font-medium rounded-md text-sm px-4 py-2 transition-all duration-200 shadow-sm"
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
                {filteredData?.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors
                        ${item.ID == highlightedId ? 'bg-gray-50 border-l-4 border-l-gray-500' : ''}
                      `}
                    >
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
                            className="mt-4 flex items-center justify-center text-white bg-gradient-to-tl font-medium rounded-md text-sm px-4 py-2 transition-all duration-200 shadow-sm"
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

          {/* Pagination */}
          <nav
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4 border-t border-gray-200"
            aria-label="Table navigation"
          >
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{filteredData.length}</span> of{" "}
              <span className="font-medium text-gray-700">{data.length}</span> items
            </span>
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  className="flex items-center justify-center h-8 px-3 text-gray-500 bg-white rounded-l-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
              </li>
              <li>
                <button
                  className="flex items-center justify-center h-8 px-3 text-gray-700 bg-gray-100 border border-gray-300 font-medium"
                >
                  1
                </button>
              </li>
              <li>
                <button
                  className="flex items-center justify-center h-8 px-3 text-gray-500 bg-white rounded-r-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
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