import React, { useState, useEffect } from 'react';
import { Pencil, Plus, Trash, ArrowUp, ArrowDown, Save, BookOpen, GripVertical, AlertCircle, CheckCircle2, MoveVertical, ListPlus, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// Updated interface to support key points
interface Chapter {
  chapterNo: number;
  title: string;
  keyPoints: string[];
}

interface ChapterManagementStepProps {
  chapterTitles: any[]; // Accept either string[] or Chapter[]
  onUpdate: (updatedChapters: any[]) => void;
}

const ChapterManagementStep: React.FC<ChapterManagementStepProps> = ({ 
  chapterTitles, 
  onUpdate 
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState<number | null>(null);
  const [firstRender, setFirstRender] = useState(true);
  const [dragHint, setDragHint] = useState(true);
  
  // Key points editing
  const [editingKeyPoints, setEditingKeyPoints] = useState<number | null>(null);
  const [keyPointsValues, setKeyPointsValues] = useState<string[]>([]);
  const [newKeyPoint, setNewKeyPoint] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      } 
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 } 
    }
  };

  // Process input data to ensure consistent chapter format
  useEffect(() => {
    // Check if we're dealing with the new format (objects with keyPoints) or old format (strings)
    if (Array.isArray(chapterTitles) && chapterTitles.length > 0) {
      if (typeof chapterTitles[0] === 'string') {
        // Convert old format to new format
        const convertedChapters = (chapterTitles as string[]).map((title, index) => ({
          chapterNo: index + 1,
          title,
          keyPoints: ['Key point 1', 'Key point 2', 'Key point 3']
        }));
        setChapters(convertedChapters);
      } else {
        // Already in new format
        setChapters(chapterTitles as Chapter[]);
      }
    } else {
      // Default chapters if none provided
      setChapters([
        { chapterNo: 1, title: 'Introduction', keyPoints: ['What to expect', 'Main themes', 'Chapter overview'] },
        { chapterNo: 2, title: 'Main Content', keyPoints: ['First key concept', 'Supporting evidence', 'Examples'] },
        { chapterNo: 3, title: 'Conclusion', keyPoints: ['Summary of findings', 'Final thoughts', 'Next steps'] }
      ]);
    }
    
    // Hide first render flag after a delay
    const timer = setTimeout(() => {
      setFirstRender(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [chapterTitles]);

  // Title editing functions
  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(chapters[index].title);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    
    const newChapters = [...chapters];
    newChapters[editingIndex] = {
      ...newChapters[editingIndex],
      title: editValue.trim() || `Chapter ${editingIndex + 1}`
    };
    
    setChapters(newChapters);
    showSuccessFeedbackFor(editingIndex);
    setEditingIndex(null);
    onUpdate(newChapters);
  };

  // Key points editing functions
  const startEditingKeyPoints = (index: number) => {
    setEditingKeyPoints(index);
    setKeyPointsValues([...chapters[index].keyPoints]);
  };

  const saveKeyPoints = () => {
    if (editingKeyPoints === null) return;
    
    const newChapters = [...chapters];

    // Filter out empty key points
    const filteredKeyPoints = keyPointsValues.filter(kp => kp.trim() !== '');
    
    newChapters[editingKeyPoints] = {
      ...newChapters[editingKeyPoints],
      keyPoints: filteredKeyPoints.length > 0 ? filteredKeyPoints : ['Key point']
    };
    
    setChapters(newChapters);
    showSuccessFeedbackFor(editingKeyPoints);
    setEditingKeyPoints(null);
    onUpdate(newChapters);
  };

  const updateKeyPoint = (index: number, value: string) => {
    const newKeyPoints = [...keyPointsValues];
    newKeyPoints[index] = value;
    setKeyPointsValues(newKeyPoints);
  };

  const addKeyPoint = () => {
    if (!newKeyPoint.trim()) return;
    
    const updatedKeyPoints = [...keyPointsValues, newKeyPoint.trim()];
    setKeyPointsValues(updatedKeyPoints);
    setNewKeyPoint('');
  };

  const removeKeyPoint = (index: number) => {
    if (keyPointsValues.length <= 1) return;
    
    const updatedKeyPoints = keyPointsValues.filter((_, i) => i !== index);
    setKeyPointsValues(updatedKeyPoints);
  };

  const showSuccessFeedbackFor = (index: number) => {
    setShowSuccessFeedback(index);
    setTimeout(() => {
      setShowSuccessFeedback(null);
    }, 1500);
  };

  const addNewChapter = () => {
    const newChapterNumber = chapters.length + 1;
    const newChapter: Chapter = {
      chapterNo: newChapterNumber,
      title: `Chapter ${newChapterNumber}`,
      keyPoints: ['Key point 1', 'Key point 2', 'Key point 3']
    };
    
    const newChapters = [...chapters, newChapter];
    setChapters(newChapters);
    onUpdate(newChapters);
    
    // Scroll to the new chapter after a short delay
    setTimeout(() => {
      const elements = document.getElementsByClassName('chapter-item');
      const lastElement = elements[elements.length - 1];
      lastElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const askForDelete = (index: number) => {
    setConfirmDelete(index);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const confirmDeleteChapter = (index: number) => {
    if (chapters.length <= 3) {
      // Show mini tooltip animation instead of alert
      setConfirmDelete(null);
      return;
    }
    
    const newChapters = chapters.filter((_, i) => i !== index).map((ch, i) => ({
      ...ch,
      chapterNo: i + 1
    }));
    
    setChapters(newChapters);
    setConfirmDelete(null);
    onUpdate(newChapters);
  };

  const moveChapter = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === chapters.length - 1)
    ) {
      return;
    }
    
    const newChapters = [...chapters];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newChapters[index], newChapters[newIndex]] = [newChapters[newIndex], newChapters[index]];
    
    // Update chapter numbers
    newChapters.forEach((ch, i) => {
      ch.chapterNo = i + 1;
    });
    
    setChapters(newChapters);
    onUpdate(newChapters);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update chapter numbers
    items.forEach((item, index) => {
      item.chapterNo = index + 1;
    });
    
    setDragHint(false);
    setChapters(items);
    onUpdate(items);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-lg mb-6 border border-purple-100"
      >
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="text-purple-600 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-800">Organize Your Book Chapters</h3>
        </div>
        <p className="text-gray-600 mb-3 text-sm">
          Customize your chapter structure before content generation. Edit titles, key points, or reorder chapters.
        </p>
        
        {dragHint && (
          <motion.div 
            className="flex items-center gap-2 mt-2 bg-blue-50 p-2 rounded-md text-blue-700 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <MoveVertical size={16} className="animate-bounce" />
            <span>Pro tip: Drag and drop chapters to quickly reorder them</span>
          </motion.div>
        )}
      </motion.div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="chapters">
          {(provided) => (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <AnimatePresence>
                {chapters.map((chapter, index) => (
                  <Draggable key={`chapter-${index}`} draggableId={`chapter-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <motion.div
                        className={`chapter-item bg-white border rounded-lg shadow-sm 
                          transition-all duration-200 overflow-hidden relative
                          ${editingIndex === index || editingKeyPoints === index ? 'border-purple-400 shadow-md' : 
                             snapshot.isDragging ? 'border-blue-300 shadow-lg' : 
                             'border-gray-200 hover:border-purple-200'}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        variants={itemVariants}
                        layout
                      >
                        {/* Chapter header with title */}
                        <div className="flex items-center">
                          {/* Drag handle */}
                          <div 
                            className="h-full flex items-center px-3 py-3 cursor-grab active:cursor-grabbing"
                            {...provided.dragHandleProps}
                          >
                            <GripVertical size={18} className="text-gray-400 hover:text-gray-600" />
                          </div>
                          
                          {/* Left accent bar */}
                          <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-purple-400 to-blue-500 opacity-70"></div>
                          
                          <div className="flex-grow pl-3 py-3">
                            {editingIndex === index ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={saveEdit}
                                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                className="w-full px-2 py-1.5 border-b-2 border-purple-400 focus:outline-none rounded-none bg-transparent focus:bg-purple-50/30"
                                autoFocus
                              />
                            ) : (
                              <div className="flex items-center">
                                <span className="text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 
                                                text-purple-800 px-2.5 py-1 rounded-md mr-3">
                                  CH {chapter.chapterNo}
                                </span>
                                <span className="text-gray-700 font-medium">{chapter.title}</span>
                                
                                {/* Success feedback animation */}
                                {showSuccessFeedback === index && (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="ml-2 text-green-500 flex items-center"
                                  >
                                    <CheckCircle2 size={16} />
                                    <span className="ml-1 text-xs">Saved</span>
                                  </motion.span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1 pr-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => moveChapter(index, 'up')}
                              disabled={index === 0}
                              className={`p-1.5 rounded-md transition-colors duration-200 ${
                                index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
                              }`}
                              title="Move up"
                            >
                              <ArrowUp size={16} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => moveChapter(index, 'down')}
                              disabled={index === chapters.length - 1}
                              className={`p-1.5 rounded-md transition-colors duration-200 ${
                                index === chapters.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
                              }`}
                              title="Move down"
                            >
                              <ArrowDown size={16} />
                            </motion.button>
                            
                            {editingIndex !== index ? (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => startEditing(index)}
                                className="p-1.5 rounded-md text-purple-600 hover:bg-purple-50"
                                title="Edit chapter title"
                              >
                                <Pencil size={16} />
                              </motion.button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={saveEdit}
                                className="p-1.5 rounded-md text-green-600 hover:bg-green-50"
                                title="Save changes"
                              >
                                <Save size={16} />
                              </motion.button>
                            )}
                            
                            {editingKeyPoints !== index && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => startEditingKeyPoints(index)}
                                className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50"
                                title="Edit key points"
                              >
                                <List size={16} />
                              </motion.button>
                            )}
                            
                            {confirmDelete === index ? (
                              <div className="flex items-center space-x-1 bg-red-50 rounded-md px-1 py-0.5">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => confirmDeleteChapter(index)}
                                  className="p-1 rounded-md text-white bg-red-500 hover:bg-red-600"
                                  title="Confirm delete"
                                >
                                  <Trash size={14} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={cancelDelete}
                                  className="p-1 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300"
                                  title="Cancel"
                                >
                                  <motion.span className="text-xs font-bold">✕</motion.span>
                                </motion.button>
                              </div>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => askForDelete(index)}
                                className={`p-1.5 rounded-md ${chapters.length <= 3 ? 'text-red-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                                title={chapters.length <= 3 ? "Minimum 3 chapters required" : "Delete chapter"}
                              >
                                <Trash size={16} />
                                {chapters.length <= 3 && confirmDelete === index && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -bottom-8 right-0 text-xs bg-red-50 text-red-700 p-1 rounded whitespace-nowrap"
                                  >
                                    Minimum 3 chapters required
                                  </motion.div>
                                )}
                              </motion.button>
                            )}
                          </div>
                        </div>
                        
                        {/* Key points section */}
                        <AnimatePresence>
                          {editingKeyPoints === index ? (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-4 pb-4 border-t border-gray-100"
                            >
                              <div className="pt-3 pb-2">
                                <h4 className="text-sm font-medium text-gray-700">Edit Key Points</h4>
                                <p className="text-xs text-gray-500">Add or edit points that summarize this chapter</p>
                              </div>
                              
                              <div className="space-y-2">
                                {keyPointsValues.map((keyPoint, kpIndex) => (
                                  <div key={`kp-${kpIndex}`} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={keyPoint}
                                      onChange={(e) => updateKeyPoint(kpIndex, e.target.value)}
                                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                      placeholder={`Key point ${kpIndex + 1}`}
                                    />
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => removeKeyPoint(kpIndex)}
                                      disabled={keyPointsValues.length <= 1}
                                      className={`p-1 rounded-md ${keyPointsValues.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                                      title={keyPointsValues.length <= 1 ? "At least one key point required" : "Remove key point"}
                                    >
                                      <Trash size={14} />
                                    </motion.button>
                                  </div>
                                ))}
                                
                                <div className="flex items-center gap-2 pt-1">
                                  <input
                                    type="text"
                                    value={newKeyPoint}
                                    onChange={(e) => setNewKeyPoint(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addKeyPoint()}
                                    className="w-full px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none bg-gray-50"
                                    placeholder="Add new key point..."
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addKeyPoint}
                                    disabled={!newKeyPoint.trim()}
                                    className={`p-1 rounded-md ${!newKeyPoint.trim() ? 'text-gray-300 cursor-not-allowed' : 'text-green-500 hover:bg-green-50'}`}
                                    title="Add key point"
                                  >
                                    <Plus size={16} />
                                  </motion.button>
                                </div>
                              </div>
                              
                              <div className="flex justify-end mt-3">
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={saveKeyPoints}
                                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                  Save Key Points
                                </motion.button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="px-4 pb-4"
                            >
                              {/* Display key points */}
                              {chapter.keyPoints && chapter.keyPoints.length > 0 && (
                                <div className="ml-8 mt-1 mb-2">
                                  <div className="flex items-center text-xs text-gray-500 mb-1">
                                    <List size={12} className="mr-1" />
                                    <span>Key Points:</span>
                                  </div>
                                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                                    {chapter.keyPoints.map((point, pIndex) => (
                                      <li key={pIndex} className="text-xs text-gray-600">
                                        {point}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* First render animation hint */}
                        {firstRender && index === 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.8, duration: 0.3 }}
                            className="absolute -right-3 -top-3"
                          >
                            <motion.div 
                              animate={{ 
                                rotate: [0, 10, 0, 10, 0],
                                scale: [1, 1.1, 1, 1.1, 1],
                              }}
                              transition={{ repeat: 2, duration: 1.5 }}
                              className="bg-purple-600 text-white text-xs py-1 px-2 rounded-full"
                            >
                              Drag me!
                            </motion.div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </motion.div>
          )}
        </Droppable>
      </DragDropContext>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={addNewChapter}
        className="mt-6 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        <Plus size={18} className="animate-pulse" />
        Add New Chapter
      </motion.button>
      
      {/* Chapter count indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-sm text-gray-500 flex items-center justify-center"
      >
        <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1">
          {chapters.length < 5 ? (
            <BookOpen size={14} className="text-purple-500" />
          ) : chapters.length < 10 ? (
            <BookOpen size={14} className="text-blue-500" />
          ) : (
            <BookOpen size={14} className="text-green-500" />
          )}
          <span>{chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ChapterManagementStep;