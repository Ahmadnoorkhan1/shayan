import { useState, useEffect } from 'react';
import { CustomSelect } from '../../../components/ui/Select';

interface BookDetailsProps {
  onDetailsSubmit: (details: Record<string, string>) => void;
  selectedDetails?: Record<string, string>;
  bookType?: string; // Optional book type hint
}

const StepBookDetails: React.FC<BookDetailsProps> = ({ 
  onDetailsSubmit, 
  selectedDetails: initialDetails = {},
  bookType 
}) => {
  const [selectedDetails, setSelectedDetails] = useState<Record<string, string>>(initialDetails);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const [characterNames, setCharacterNames] = useState<string[]>(
    initialDetails.characters ? initialDetails.characters.split(',') : []
  );
  const [newCharacterName, setNewCharacterName] = useState<string>('');

  // Detect book type from title or use provided type
  useEffect(() => {
    const storedTitle = localStorage.getItem("selectedBookTitle") || "";
    const detectedType = detectBookType(storedTitle);
    console.log("Detected book type:", detectedType);
  }, []);

  const detectBookType = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (/learn|study|guide|course|education|teach|tutorial/.test(lowerTitle)) return 'educational';
    if (/tech|code|program|software|data|digital|computer|ai|ml/.test(lowerTitle)) return 'technical';
    if (/story|tale|adventure|fantasy|mystery|romance|fiction|novel/.test(lowerTitle)) return 'fiction';
    if (/grow|improve|success|motivation|inspiration|self-help|development/.test(lowerTitle)) return 'selfHelp';
    return 'general';
  };

  // Enhanced options with versatile choices for different book types
  const bookDetails = [
    {
      id: "mainCharacter",
      name: "Main Character Type",
      options: [
        // Fiction options
        "Young Hero/Heroine",
        "Wise Mentor",
        "Anti-hero",
        "Ensemble Cast",
        "Historical Figure",
        "Mythical Being",
        // Non-fiction options
        "Subject Matter Expert",
        "Narrator/Guide",
        "Case Study Subject",
        "Reader (Second Person)",
        "Biographical Subject",
        "None (Concept-focused)"
      ]
    },
    {
      id: "setting",
      name: "Story Setting",
      options: [
        // Fiction settings
        "Modern Day",
        "Historical Period",
        "Fantasy World",
        "Future/Sci-fi",
        "Multiple Timelines",
        "Urban Environment",
        // Non-fiction settings
        "Academic Context",
        "Professional Environment",
        "Educational Setting",
        "Real-world Applications",
        "Theoretical Framework",
        "Global Perspective"
      ]
    },
    {
      id: "conflict",
      name: "Main Conflict",
      options: [
        // Fiction conflicts
        "Person vs Nature",
        "Person vs Society",
        "Person vs Self",
        "Person vs Technology",
        "Person vs Supernatural",
        "Multiple Conflicts",
        // Non-fiction conflicts/challenges
        "Knowledge Gap",
        "Practical Challenge",
        "Common Misconception",
        "Competing Theories",
        "Implementation Difficulty",
        "Learning Curve"
      ]
    },
    {
      id: "pacing",
      name: "Story Pacing",
      options: [
        // Fiction pacing
        "Fast-paced Action",
        "Gradual Build-up",
        "Multiple Plot Lines",
        "Character-driven",
        "Mystery/Suspense",
        "Epic Journey",
        // Non-fiction pacing
        "Progressive Learning",
        "Step-by-Step Guide",
        "Conceptual Exploration",
        "Quick Reference",
        "Deep Dive Analysis",
        "Mixed Approach"
      ]
    },
    {
      id: "theme",
      name: "Central Theme",
      options: [
        // Fiction themes
        "Coming of Age",
        "Good vs Evil",
        "Love & Loss",
        "Power & Corruption",
        "Redemption",
        "Discovery & Adventure",
        // Non-fiction themes
        "Innovation & Progress",
        "Problem Solving",
        "Knowledge Acquisition",
        "Practical Application",
        "Expert Mastery",
        "Paradigm Shift"
      ]
    }
  ];

  const handleDetailChange = (detailId: string, value: string) => {
    const newDetails = {
      ...selectedDetails,
      [detailId]: value
    };
    setSelectedDetails(newDetails);
    
    // Check if all fields are filled
    const allFieldsFilled = bookDetails.every(detail => newDetails[detail.id]);
    
    // Include character names in submission
    if (characterNames.length > 0) {
      newDetails.characters = characterNames.join(',');
    }
    
    if (allFieldsFilled) {
      onDetailsSubmit(newDetails);
    }
  };

  const handleAddCharacter = () => {
    if (newCharacterName.trim()) {
      const updatedCharacters = [...characterNames, newCharacterName.trim()];
      setCharacterNames(updatedCharacters);
      setNewCharacterName('');
      
      // Update details with new character list
      const updatedDetails = {
        ...selectedDetails,
        characters: updatedCharacters.join(',')
      } as any;
      
      setSelectedDetails(updatedDetails);
      
      // Check if all fields are filled to trigger submission
      const allFieldsFilled = bookDetails.every(detail => updatedDetails[detail.id]);
      if (allFieldsFilled) {
        onDetailsSubmit(updatedDetails);
      }
    }
  };

  const handleRemoveCharacter = (index: number) => {
    const updatedCharacters = characterNames.filter((_, i) => i !== index);
    setCharacterNames(updatedCharacters);
    
    // Update details with new character list
    const updatedDetails = {
      ...selectedDetails,
      characters: updatedCharacters.join(',')
    } as any;
    
    setSelectedDetails(updatedDetails);
    
    // Check if all fields are filled to trigger submission
    const allFieldsFilled = bookDetails.every((detail:any) => updatedDetails[detail.id] as any);
    if (allFieldsFilled) {
      onDetailsSubmit(updatedDetails);
    }
  };

  // Calculate remaining selections
  const remainingSelections = bookDetails.length - Object.keys(selectedDetails).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-purple-500 mb-4">Book Details</h2>
        <p className="text-purple-500 mb-6">
          Select all book details to proceed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bookDetails?.map(detail => {
            const isSelected = !!selectedDetails[detail.id];
            
            return (
              <div 
                key={detail.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  isSelected ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {detail.name}
                  {!selectedDetails[detail.id] && 
                    <span className="text-red-400 ml-1">*</span>
                  }
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

        {/* Character Names Section */}
        <div className="mt-8 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Character Names</h3>
          <p className="text-sm text-gray-600 mb-4">Add character names for your book (optional)</p>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              placeholder="Enter character name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={handleAddCharacter}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!newCharacterName.trim()}
            >
              Add Character
            </button>
          </div>
          
          {characterNames.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Characters:</h4>
              <div className="flex flex-wrap gap-2">
                {characterNames.map((name, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full"
                  >
                    <span className="text-purple-800">{name}</span>
                    <button
                      onClick={() => handleRemoveCharacter(index)}
                      className="text-purple-400 hover:text-purple-700"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${(Object.keys(selectedDetails).length / bookDetails.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">
              {remainingSelections > 0 ? (
                <span>{remainingSelections} selection{remainingSelections > 1 ? 's' : ''} remaining</span>
              ) : (
                <span className="text-green-600">All details completed!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepBookDetails;