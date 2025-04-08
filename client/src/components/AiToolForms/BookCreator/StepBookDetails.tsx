import { useState, useEffect } from 'react';
import { CustomSelect } from '../../../components/ui/Select';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

interface BookDetailsProps {
  onDetailsSubmit: (details: Record<string, string>) => void;
  selectedDetails?: Record<string, string>;
  bookType?: string;
}

const StepBookDetails: React.FC<BookDetailsProps> = ({ 
  onDetailsSubmit, 
  selectedDetails: initialDetails = {},
  bookType 
}) => {
  const [selectedDetails, setSelectedDetails] = useState<Record<string, string>>(initialDetails);
  const [characterNames, setCharacterNames] = useState<string[]>(
    initialDetails.characters ? initialDetails.characters.split(',') : []
  );
  const [newCharacterName, setNewCharacterName] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Determine if fiction or non-fiction based on stored title or bookType
  const [isFiction, setIsFiction] = useState(false);
  
  useEffect(() => {
    // Use provided bookType or check title keywords for fiction vs non-fiction
    const storedTitle = localStorage.getItem("selectedBookTitle") || "";
    const titleLower = storedTitle.toLowerCase();
    
    // Simple fiction detection based on common keywords
    const fictionKeywords = ['story', 'novel', 'tale', 'adventure', 'fantasy', 'mystery'];
    const isFictionBook = bookType === 'fiction' || 
      fictionKeywords.some(keyword => titleLower.includes(keyword));
      
    setIsFiction(isFictionBook);
  }, [bookType]);

  // Essential book details options
  const basicBookDetails = [
    {
      id: "mainCharacter",
      name: "Main Character Type",
      options: isFiction ? 
        ["Young Hero/Heroine", "Wise Mentor", "Anti-hero", "Ensemble Cast"] :
        ["Subject Matter Expert", "Narrator/Guide", "Reader (Second Person)", "None (Concept-focused)"]
    },
    {
      id: "setting",
      name: "Story Setting",
      options: isFiction ?
        ["Modern Day", "Historical Period", "Fantasy World", "Future/Sci-fi"] :
        ["Academic Context", "Professional Environment", "Real-world Applications", "Global Perspective"]
    },
    {
      id: "theme",
      name: "Central Theme",
      options: isFiction ?
        ["Coming of Age", "Good vs Evil", "Discovery & Adventure", "Love & Loss"] :
        ["Innovation & Progress", "Problem Solving", "Practical Application", "Expert Mastery"]
    }
  ];

  // Advanced book details options
  const advancedBookDetails = [
    {
      id: "conflict",
      name: "Main Conflict",
      options: isFiction ?
        ["Person vs Nature", "Person vs Society", "Person vs Self", "Person vs Technology", "Person vs Supernatural", "Multiple Conflicts"] :
        ["Knowledge Gap", "Practical Challenge", "Common Misconception", "Competing Theories", "Implementation Difficulty", "Learning Curve"]
    },
    {
      id: "pacing",
      name: "Story Pacing",
      options: isFiction ?
        ["Fast-paced Action", "Gradual Build-up", "Multiple Plot Lines", "Character-driven", "Mystery/Suspense", "Epic Journey"] :
        ["Progressive Learning", "Step-by-Step Guide", "Conceptual Exploration", "Quick Reference", "Deep Dive Analysis", "Mixed Approach"]
    },
    {
      id: "tone",
      name: "Book Tone",
      options: isFiction ?
        ["Lighthearted/Humorous", "Serious/Dramatic", "Dark/Gritty", "Inspirational", "Mysterious", "Whimsical"] :
        ["Conversational", "Academic/Formal", "Instructional", "Motivational", "Analytical", "Practical"]
    }
  ];

  // Handle selection changes
  const handleDetailChange = (detailId: string, value: string) => {
    const newDetails = {
      ...selectedDetails,
      [detailId]: value
    };
    setSelectedDetails(newDetails);
    
    // Include character names in submission
    if (characterNames.length > 0) {
      newDetails.characters = characterNames.join(',');
    }
    
    // Send update to parent component
    onDetailsSubmit(newDetails);
  };

  // Character management - only for fiction books
  const handleAddCharacter = () => {
    if (newCharacterName.trim()) {
      const updatedCharacters = [...characterNames, newCharacterName.trim()];
      setCharacterNames(updatedCharacters);
      setNewCharacterName('');
      
      // Update details with new character list
      const updatedDetails = {
        ...selectedDetails,
        characters: updatedCharacters.join(',')
      };
      
      setSelectedDetails(updatedDetails);
      onDetailsSubmit(updatedDetails);
    }
  };

  const handleRemoveCharacter = (index: number) => {
    const updatedCharacters = characterNames.filter((_, i) => i !== index);
    setCharacterNames(updatedCharacters);
    
    // Update details with new character list
    const updatedDetails = {
      ...selectedDetails,
      characters: updatedCharacters.join(',')
    };
    
    setSelectedDetails(updatedDetails);
    onDetailsSubmit(updatedDetails);
  };

  // Calculate progress stats
  const allFields = [...basicBookDetails, ...advancedBookDetails];
  const completedFields = Object.keys(selectedDetails).filter(key => 
    key !== 'characters' && selectedDetails[key]
  ).length;
  
  // Only require ANY THREE fields, not all basic fields
  const minimumRequired = 3;
  const hasMinimumFields = completedFields >= minimumRequired;
  const progressPercentage = (completedFields / allFields.length) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Header section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Customize Your Book Details
          </h2>
          <p className="text-gray-600">
            Select at least <span className="font-medium text-primary">three options</span> to help us create the perfect {isFiction ? 'story' : 'book'} for you.
          </p>
        </div>

        {/* Essential Details Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm mr-2">1</span>
            Essential Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {basicBookDetails.map(detail => {
              const isSelected = !!selectedDetails[detail.id];
              
              return (
                <div 
                  key={detail.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    isSelected ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm'
                  }`}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {detail.name}
                  </label>
                  <CustomSelect
                    value={selectedDetails[detail.id] || ''}
                    options={detail.options}
                    placeholder={`Select ${detail.name}`}
                    onChange={(value) => handleDetailChange(detail.id, value)}
                    isSelected={isSelected}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Character Names Section - Only for fiction books */}
        {isFiction && (
          <div className="mb-8 p-4 rounded-lg border border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm mr-2">2</span>
              Character Names <span className="ml-2 text-sm text-gray-500">(Optional)</span>
            </h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCharacterName}
                onChange={(e) => setNewCharacterName(e.target.value)}
                placeholder="Enter character name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCharacterName.trim()) {
                    e.preventDefault(); 
                    handleAddCharacter();
                  }
                }}
              />
              <button
                onClick={handleAddCharacter}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                disabled={!newCharacterName.trim()}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
            
            {characterNames.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Your Characters:</h4>
                <div className="flex flex-wrap gap-2">
                  {characterNames.map((name, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full"
                    >
                      <span className="text-gray-800">{name}</span>
                      <button
                        onClick={() => handleRemoveCharacter(index)}
                        className="text-gray-400 hover:text-gray-700"
                        aria-label={`Remove ${name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Options Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm mr-2">3</span>
            Advanced Options <span className="ml-2 text-sm text-gray-500">(Optional)</span>
          </h3>
          
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className={`w-full flex items-center justify-between p-4 border ${
              showAdvancedOptions 
                ? 'border-primary/30 bg-primary/5 rounded-t-lg' 
                : 'border-gray-200 bg-gray-50 rounded-lg hover:border-primary/20'
            } transition-all duration-200`}
          >
            <div>
              <p className="text-sm text-gray-600 mt-1">Fine-tune your book with additional details</p>
            </div>
            <div className="text-primary">
              {showAdvancedOptions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>
          
          {/* Advanced Options Content */}
          {showAdvancedOptions && (
            <div className="border border-t-0 border-primary/30 bg-white p-4 rounded-b-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                {advancedBookDetails.map(detail => {
                  const isSelected = !!selectedDetails[detail.id];
                  
                  return (
                    <div 
                      key={detail.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        isSelected ? 'border-primary/40 bg-primary/5' : 'border-gray-200 hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {detail.name}
                      </label>
                      <CustomSelect
                        value={selectedDetails[detail.id] || ''}
                        options={detail.options}
                        placeholder={`Select ${detail.name}`}
                        onChange={(value) => handleDetailChange(detail.id, value)}
                        isSelected={isSelected}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-800">Your Progress</h4>
            <div className="text-sm font-medium text-gray-600">
              {completedFields} of {minimumRequired} required selections 
              {completedFields >= minimumRequired && <span className="text-green-600 ml-1">✓</span>}
            </div>
          </div>
          
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hasMinimumFields ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, (completedFields / minimumRequired) * 100)}%` }}
            />
          </div>
          
          {hasMinimumFields ? (
            <p className="text-green-600 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              You're ready to continue! Feel free to add more details.
            </p>
          ) : (
            <p className="text-amber-600 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Please select at least {minimumRequired} options to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepBookDetails;