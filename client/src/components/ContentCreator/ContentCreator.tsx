import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Stepper from "../ui/ToolSteps";
import apiService from "../../utilities/service/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react"; // Import Loader icon
import { showLoader, hideLoader } from "../../utilities/components/Loader";

export type ContentType = 'book' | 'course' | 'easyCourse';

export interface ContentStep {
  label: string;
  icon: boolean;
}

export interface ContentDetails {
  [key: string]: string;
}

interface ContentCreatorProps {
  contentType: ContentType;
  steps: ContentStep[];
  stepComponents: React.ReactNode[];
  apiEndpoints: {
    titles: string;
    summary: string;
    chapters: string;
    content: string;
    saveContent: string;
  };
  requirementFields?: any[];
  redirectPath: string;
  storageKeys: {
    titles: string;
    selectedTitle: string;
    chapterTitles: string;
    summary: string;
    numChapters: string;
  };
  onTitleSelect?: (title: string) => Promise<boolean>;
  skipSummaryStep?: boolean;
  initialFetch?: boolean;
  autoProgressOnSelect?: boolean; // New prop to control auto-progression
}

const ContentCreator: React.FC<ContentCreatorProps> = ({
  contentType,
  steps,
  stepComponents,
  apiEndpoints,
  requirementFields = [],
  redirectPath,
  storageKeys,
  onTitleSelect,
  skipSummaryStep,
  initialFetch,
  autoProgressOnSelect = false, // Default to false for backward compatibility
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepOneForm, setStepOneForm] = useState({});
  const [chaptersData, setChaptersData] = useState<any>([]);
  const [saveButton, setSaveButton] = useState(false);
  const [chapterFetchCount, setChapterFetchCount] = useState(0);
  const [contentDetails, setContentDetails] = useState<ContentDetails>({});
  const [canContinue, setCanContinue] = useState(false);
  const [chapterTitles, setChapterTitles] = useState<string[]>([]);
  
  // New loading state variables
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingChapters, setIsGeneratingChapters] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [initialTitleFetching, setInitialTitleFetching] = useState(false);
  
  const navigate = useNavigate();


  useEffect(() => {
    // check if content_generation_stopped is true in localstorage mak it false at initial load
    const contentGenerationStopped = localStorage.getItem("content_generation_stopped");
    if (contentGenerationStopped) {
      localStorage.setItem("content_generation_stopped", "false");
    }
  }
  , []);

  useEffect(() => {
    // Register event listener for Enter key when component mounts
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        const nextButton = document.querySelector('.next-step-button') as HTMLButtonElement;
        if (nextButton && !nextButton.disabled) {
          nextButton.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Effect for initial title fetching for EasyCourseCreator
  useEffect(() => {
    if (initialFetch && contentType === 'easyCourse') {
      // Force a fetch of titles for EasyCourseCreator
      const fetchInitialTitles = async () => {
        try {
          setInitialTitleFetching(true);
          showLoader(); // Show global loader
          localStorage.setItem('loadingMessage', 'Preparing content suggestions...');
          
          const numberOfChapters = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
          localStorage.setItem(storageKeys.numChapters, numberOfChapters.toString());
          
          const response = await apiService.post(
            apiEndpoints.titles,
            {
              prompt: {
                chapterCount: numberOfChapters,
              },
            },
            { timeout: 30000 }
          );
          
          if (response?.success) {
            const generatedTitles = response.data;
            if (Array.isArray(generatedTitles)) {
              localStorage.setItem(storageKeys.titles, JSON.stringify(generatedTitles));
            }
          }
        } catch (error) {
          console.error("Error fetching initial titles:", error);
          toast.error("Failed to load initial suggestions. Please try refreshing.");
        } finally {
          setInitialTitleFetching(false);
          hideLoader(); // Hide global loader
        }
      };
      
      fetchInitialTitles();
    }
  }, [initialFetch, contentType, apiEndpoints.titles, storageKeys.numChapters, storageKeys.titles]);

  // Add this effect to handle the auto-progression specifically for EasyCourseCreator
  useEffect(() => {
    // If it's the easy course creator and we should auto-progress, ensure next step navigation happens on title selection
    if (contentType === 'easyCourse' && autoProgressOnSelect && currentStep === 0) {
      // Listen for storage changes to detect when a title is selected
      const handleStorageChange = () => {
        const selectedTitle = localStorage.getItem(storageKeys.selectedTitle);
        if (selectedTitle) {
          // When a title is selected, trigger the title selection handler
          if (onTitleSelect) {
            onTitleSelect(selectedTitle).then(success => {
              if (success) {
                setCurrentStep(1);
              }
            });
          }
        }
      };
      
      // Add a custom event listener for our own storage updates
      window.addEventListener('storage-easy-course', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage-easy-course', handleStorageChange);
      };
    }
  }, [contentType, autoProgressOnSelect, currentStep, onTitleSelect, storageKeys.selectedTitle]);

  const handleForm = (data: any) => {
    setStepOneForm(data);
  };

  // This function has been modified to handle special title selection for EasyCourseCreator
  const handleChildStepChange = async (titleSelected?: string) => {
    // Special handling for EasyCourseCreator
    if (contentType === 'easyCourse' && currentStep === 0 && titleSelected) {
      // If a title was provided and we're on the title selection step
      if (onTitleSelect) {
        try {
          showLoader();
          localStorage.setItem('loadingMessage', 'Preparing your course...');
          localStorage.setItem('loaderType', 'spinner');
          
          // Store the title
          localStorage.setItem(storageKeys.selectedTitle, titleSelected);
          
          // Call the custom handler and only proceed if it returns true
          const success = await onTitleSelect(titleSelected);
          if (success) {
            // Generate content right away
            if (skipSummaryStep) {
              setCurrentStep(1); // Move to the final step first so UI updates
              fetchChaptersWithRateLimit(
                titleSelected,
                "", // No summary for easyCourse
                JSON.parse(localStorage.getItem(storageKeys.chapterTitles) || "[]")
              );
            }
          }
        } catch (error) {
          console.error("Error processing title selection:", error);
          toast.error("Failed to process selection. Please try again.");
          hideLoader();
        }
      } else {
        // Fallback to standard progression
        setCurrentStep(1);
      }
    } else {
      // Standard behavior for other content types
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleStep1 = async () => {
    try {
      setIsGeneratingTitles(true);
      showLoader();
      localStorage.setItem('loadingMessage', `Generating ${contentType === 'book' ? 'book' : 'course'} titles...`);
      localStorage.setItem('loaderType', 'bar');
      
      const response: any = await apiService.post(
        apiEndpoints.titles,
        {
          prompt: stepOneForm,
        },
        {}
      );
      
      if (response.success) {
        localStorage.setItem(storageKeys.titles, JSON.stringify(response.data));
        setCurrentStep((prev) => prev + 1);
        // toast.success(`${response.data.length} titles generated successfully!`);
      } else {
        toast.error(response.message || "Failed to generate titles");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate titles. Please try again.");
    } finally {
      setIsGeneratingTitles(false);
      hideLoader();
    }
  };

  const generateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      showLoader();
      localStorage.setItem('loadingMessage', `Creating ${contentType === 'book' ? 'book' : 'course'} outline...`);
      localStorage.setItem('loaderType', 'spinner');
      
      const getTitle = localStorage.getItem(storageKeys.selectedTitle) || "";
      
      const response: any = await apiService.post(
        apiEndpoints.summary,
        {
          prompt: getTitle,
          contentDetails: contentDetails,
        },
        { timeout: 30000 }
      );
      
      if (response.success) {
        localStorage.setItem(storageKeys.summary, response.data);
        setCurrentStep(prev => prev + 1);
        toast.success("Outline created successfully!");
      } else {
        toast.error(response.message || "Failed to generate summary");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to create outline. Please try again.");
    } finally {
      setIsGeneratingSummary(false);
      hideLoader();
    }
  };

  const generateCompleteContent = async () => {
    try {
      setIsGeneratingChapters(true);
      showLoader();
      localStorage.setItem('loadingMessage', `Preparing chapter structure...`);
      localStorage.setItem('loaderType', 'spinner');
      
      const getTitle = localStorage.getItem(storageKeys.selectedTitle) || "";
      const savedSummary = localStorage.getItem(storageKeys.summary) || "";
      
      // Generate a random number of chapters between 10-20 if not set already
      const numberOfChapters = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
      localStorage.setItem(storageKeys.numChapters, numberOfChapters.toString());
      
      const response: any = await apiService.post(
        apiEndpoints.chapters,
        {
          prompt: {
            title: getTitle,
            summary: savedSummary,
            numberOfChapters,
            contentDetails,
          },
        },
        null
      );
      
      if (response?.success) {
        const generatedChapterTitles = response.data;
        setChapterTitles(generatedChapterTitles);
        localStorage.setItem(storageKeys.chapterTitles, JSON.stringify(generatedChapterTitles));
        setCurrentStep((prev) => prev + 1);
        
        // Now fetch the actual chapters
        fetchChaptersWithRateLimit(getTitle, savedSummary, generatedChapterTitles);
      } else {
        hideLoader(); // Hide loader on error
        toast.error(response?.message || "Failed to generate chapters");
        setIsGeneratingChapters(false);
      }
    } catch (error) {
      console.error("Error generating chapters:", error);
      toast.error("Failed to generate chapters");
      setIsGeneratingChapters(false);
      hideLoader();
    }
  };

  const fetchChaptersWithRateLimit = async (title: string, summary: string, chapters: string[]) => {
    const MAX_RETRIES = 5;
  
    // Initialize with empty strings for all chapters
    setChaptersData(new Array(chapters.length).fill(""));
    
    // Reset the flag when starting generation
    localStorage.setItem('content_generation_stopped', 'false');
    
    // Set up loading UX
    showLoader();
    localStorage.setItem('loaderType', 'bar');
    localStorage.setItem('loadingProgress', '0');
    localStorage.setItem('loadingMessage', `Generating chapter content (0/${chapters.length})...`);
    
    // Reset generation progress
    setGenerationProgress(0);
    
    for (let index = 0; index < chapters.length; index++) {
      // Check if generation has been stopped
      if (localStorage.getItem('content_generation_stopped') === 'true') {
        console.log(`[${contentType}] Content generation stopped, halting chapter generation`);
        break; // Exit the loop if generation has been stopped
      }
      
      // Update progress indicators
      const progressPercent = Math.round((index / chapters.length) * 100);
      setGenerationProgress(progressPercent);
      localStorage.setItem('loadingProgress', progressPercent.toString());
      localStorage.setItem('loadingMessage', `Generating chapter ${index + 1} of ${chapters.length}...`);
      
      const chapter = chapters[index];
      let attempts = 0;
      let success = false;
  
      while (attempts < MAX_RETRIES && !success) {
        // Check again if generation has been stopped
        if (localStorage.getItem('content_generation_stopped') === 'true') {
          console.log(`[${contentType}] Content generation stopped during retry attempt`);
          break; // Exit the retry loop if generation has been stopped
        }
        
        try {
          const chapterPayload = {
            prompt: {
              chapterNo: index + 1,
              chapter,
              title: title,
              summary: summary,
            },
          };
  
          console.log(`[${contentType}] Fetching Chapter ${index + 1} (Attempt ${attempts + 1})...`);
  
          const chapterResponse = await apiService.post(
            apiEndpoints.content,
            chapterPayload,
            { timeout: 600000 }
          );
  
          if (chapterResponse.success) {
            // Check one more time before updating state
            if (localStorage.getItem('content_generation_stopped') === 'true') {
              console.log(`[${contentType}] Content generation stopped after successful API call`);
              break;
            }
            
            setChaptersData((prev: any) => {
              const newData = [...prev];
              newData[index] = chapterResponse.data;
              return newData;
            });
            
            setChapterFetchCount((prev) => prev + 1);
            
            // Update progress indicators after successful fetch
            const newProgress = Math.round(((index + 1) / chapters.length) * 100);
            setGenerationProgress(newProgress);
            localStorage.setItem('loadingProgress', newProgress.toString());
            localStorage.setItem('loadingMessage', `Generated ${index + 1} of ${chapters.length} chapters`);
            
            success = true;
          } else {
            throw new Error(chapterResponse.message);
          }
        } catch (error) {
          // If generation was stopped, don't log errors or increment attempts
          if (localStorage.getItem('content_generation_stopped') === 'true') {
            console.log(`[${contentType}] Ignoring error since generation was stopped`);
            break;
          }
          
          console.error(`[${contentType}] Error fetching Chapter ${index + 1}:`, error);
          attempts++;
        }
      }
  
      // Only show error if generation wasn't manually stopped
      if (!success && localStorage.getItem('content_generation_stopped') !== 'true') {
        toast.error(`Chapter ${index + 1} could not be fetched.`);
      }
      
      // If generation was stopped, exit the main loop
      if (localStorage.getItem('content_generation_stopped') === 'true') {
        break;
      }
    }
  
    // Complete the generation process
    if (localStorage.getItem('content_generation_stopped') !== 'true') {
      setGenerationProgress(100);
      localStorage.setItem('loadingProgress', '100');
      localStorage.setItem('loadingMessage', 'All chapters generated successfully!');
      
      // Short delay to show 100% before hiding the loader
      setTimeout(() => {
        hideLoader();
        toast.success("All chapters generated successfully!");
        setSaveButton(true);
        setIsGeneratingChapters(false);
        
        // Auto-save the content after a brief delay
        setTimeout(() => {
          saveCompleteContent();
        }, 1500);
      }, 1000);
    } else {
      // If generation was stopped manually
      hideLoader();
      setIsGeneratingChapters(false);
    }
  };

  const saveCompleteContent = async () => {
    try {
      setIsSavingContent(true);
      showLoader();
      localStorage.setItem('loadingMessage', `Saving your ${contentType === 'book' ? 'book' : 'course'}...`);
      localStorage.setItem('loaderType', 'spinner');
      
      const title = localStorage.getItem(storageKeys.selectedTitle);
      
      // Format the content data based on content type
      const contentData = contentType === 'book' ? 
        JSON.stringify(chaptersData) : chaptersData;
      
      const body = {
        creator_id: 1, // user._id,
        course_title: title,
        content: contentData,
        type: contentType === 'easyCourse' ? 'course' : contentType
      };
      
      const response = await apiService.post(apiEndpoints.saveContent, body, {});
      
      if (response.success) {
        // toast.success(`${contentType === 'book' ? 'Book' : 'Course'} saved successfully!`);
        navigate(`${redirectPath}?highlight=${response.data.course_id}`);
      } else {
        toast.error(response.message || "Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setIsSavingContent(false);
      hideLoader();
    }
  };

  const handleContentDetailsChange = (details: ContentDetails) => {
    setContentDetails(details);
    // Check if all required fields are filled based on the minRequired property
    const requirements = Array.isArray(requirementFields) 
      ? { fields: requirementFields, minRequired: requirementFields.length } 
      : requirementFields as { fields: string[], minRequired: number };
    
    if (requirements.fields.length > 0) {
      // Count how many required fields are filled
      const filledFieldsCount = requirements.fields.filter(field => details[field]).length;
      
      // Enable button if we have at least minRequired fields filled
      const hasMinimumFields = filledFieldsCount >= requirements.minRequired;
      setCanContinue(hasMinimumFields);
      
      console.log(`Field validation: ${filledFieldsCount}/${requirements.minRequired} fields filled. Can continue: ${hasMinimumFields}`);
    } else {
      // No specific requirements, enable button if any details are provided
      setCanContinue(Object.keys(details).length > 0);
    }
  };

  // Handle title selection from within a child component
  const handleTitleSelected = async (title: string) => {
    if (contentType === 'easyCourse' && autoProgressOnSelect) {
      // Call the custom handler
      handleChildStepChange(title);
    }
  };

  const renderForm = () => {
    // Get the component reference for the current step
    const StepComponent = stepComponents[currentStep];
    
    if (!StepComponent) return null;
    
    // Create props based on the current step
    const props: any = {};
    
    // Step 0 - Topic input or title selection
    if (currentStep === 0) {
      props.handleForm = handleForm;
      
      // For EasyCourseCreator, add special handling to auto-progress on title selection
      if (contentType === 'easyCourse') {
        props.handleStepChange = async (title: string) => {
          if (title && onTitleSelect) {
            const success = await onTitleSelect(title);
            if (success) {
              // This will transition to the content view step
              setCurrentStep(1);
            }
          }
        };
        
        props.autoProgress = autoProgressOnSelect;
      } else {
        props.handleStepChange = handleChildStepChange;
      }
    }
    // Step 1 - Title selection
    else if (currentStep === 1 && contentType !== 'easyCourse') {
      props.handleStepChange = handleChildStepChange;
    }
    // Step 2 - Details input (Book only)
    else if (currentStep === 2 && contentType === 'book') {
      props.selectedDetails = contentDetails;
      props.onDetailsSubmit = handleContentDetailsChange;
    }
    // Step for content display (final step)
    else if (currentStep === (contentType === 'book' ? 4 : (contentType === 'course' ? 4 : 1))) {
      props.chaptersContent = chaptersData;
      props.chapterFetchCount = chapterFetchCount;
      // Pass save and back handlers
      props.onSave = saveCompleteContent;
      props.onBack = () => setCurrentStep(prev => prev - 1);
    }
    
    // Create element from component reference with props
    return React.createElement(StepComponent as any, props);
  };

  // Update the renderButtons function to use our custom back confirmation:
const renderButtons = () => {
  return (
    <div className="pt-16 pb-4 flex gap-8">
      {currentStep > 0 && (
        <button
          onClick={() => {
            // For content view steps with confirmation
            if (currentStep === (contentType === 'book' ? 4 : (contentType === 'course' ? 4 : 1))) {
              // Access the global confirmation function if it exists
              if ((window as any).__showContentViewerBackConfirm) {
                (window as any).__showContentViewerBackConfirm();
              } else {
                // Fallback if the function isn't available
                setCurrentStep(prev => prev - 1);
              }
            } else {
              // Normal back button behavior for other steps
              setCurrentStep(prev => prev - 1);
            }
          }}
          className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white bg-primary bg-opacity-5 transition duration-300 ease-out border-2 border-primary rounded-full shadow-md group"
        >
          <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 translate-x-full bg-primary group-hover:translate-x-0 ease">
            <svg
              className="w-6 h-6 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </span>
          <span className="absolute flex items-center justify-center w-full h-full text-primary transition-all duration-300 transform group-hover:translate-x-full ease">
            Back
          </span>
          <span className="relative invisible">Back</span>
        </button>
      )}
      
      {renderNextButton()}
    </div>
  );
};

  const renderNextButton = () => {
    // For EasyCourseCreator, don't show Next button on the first step if autoProgressOnSelect is true
    if (contentType === 'easyCourse') {
      switch (currentStep) {
        case 0:
          // Only show the Next button if auto-progression is disabled
          return autoProgressOnSelect ? null : (
            <NextButton 
              handleClick={() => handleChildStepChange(localStorage.getItem(storageKeys.selectedTitle) || '')} 
              title="Next" 
              disabled={!localStorage.getItem(storageKeys.selectedTitle) || initialTitleFetching} 
              isLoading={initialTitleFetching}
            />
          );
        case 1:
          return <>{saveButton && <NextButton 
            handleClick={saveCompleteContent} 
            title="Save" 
            isLoading={isSavingContent}
            disabled={isSavingContent}
          />}</>;
        default:
          return null;
      }
    }
    
    // For Book Creator
    if (contentType === 'book') {
      switch (currentStep) {
        case 0:
          return <NextButton 
            handleClick={handleStep1} 
            title="Next" 
            isLoading={isGeneratingTitles}
            disabled={isGeneratingTitles}
          />;
        case 1:
          return null; // Title step doesn't need a button
        case 2: // Book Details step
          return (
            <NextButton 
              handleClick={generateSummary} 
              title="Next" 
              disabled={!canContinue || isGeneratingSummary}
              isLoading={isGeneratingSummary}
            />
          );
        case 3: // Summary step
          return <NextButton 
            handleClick={generateCompleteContent} 
            title="Next" 
            isLoading={isGeneratingChapters}
            disabled={isGeneratingChapters}
          />;
        case 4: // Content view step
          return <>{saveButton && <NextButton 
            handleClick={saveCompleteContent} 
            title="Save" 
            isLoading={isSavingContent}
            disabled={isSavingContent || isGeneratingChapters}
          />}</>;
        default:
          return null;
      }
    }
    // For Course Creator
    else if (contentType === 'course') {
      switch (currentStep) {
        case 0:
          return <NextButton 
            handleClick={handleStep1} 
            title="Next" 
            isLoading={isGeneratingTitles}
            disabled={isGeneratingTitles}
          />;
        case 1:
          return null; // Title step doesn't need a button
        case 2: // Third step
          return <NextButton 
            handleClick={generateSummary} 
            title="Next" 
            isLoading={isGeneratingSummary}
            disabled={isGeneratingSummary}
          />;
        case 3: // Summary step
          return <NextButton 
            handleClick={generateCompleteContent} 
            title="Next" 
            isLoading={isGeneratingChapters}
            disabled={isGeneratingChapters}
          />;
        case 4: // Content view step
          return <>{saveButton && <NextButton 
            handleClick={saveCompleteContent} 
            title="Save" 
            isLoading={isSavingContent}
            disabled={isSavingContent || isGeneratingChapters}
          />}</>;
        default:
          return null;
      }
    }
  };

  // Render loading indicators for specific steps
  const renderLoadingIndicator = () => {
    if (isGeneratingChapters && currentStep === (contentType === 'book' ? 4 : (contentType === 'course' ? 4 : 1))) {
      return (
        <div className="w-full max-w-md mt-4">
          <div className="flex justify-between text-sm font-medium mb-1">
            <span>Creating chapters ({chapterFetchCount}/{chapterTitles.length})</span>
            <span>{generationProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary/80 h-2 rounded-full transition-all duration-500"
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex items-center p-2 w-full">
      <Stepper
        renderForm={renderForm}
        renderButtons={renderButtons}
        currentStep={currentStep}
        steps={steps}
        // loadingIndicator={renderLoadingIndicator()}
      />
    </div>
  );
};

interface ButtonProps {
  handleClick: CallableFunction;
  title: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export const NextButton: React.FC<ButtonProps> = ({ handleClick, title, disabled, isLoading }) => {
  return (
    <button
      onClick={() => !disabled && !isLoading && handleClick()}
      disabled={disabled || isLoading}
      className={`next-step-button relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white 
        transition duration-300 ease-out border-2 rounded-full shadow-md group
        ${(disabled || isLoading) ? 
          'bg-gray-200 border-gray-300 cursor-not-allowed' : 
          'bg-primary bg-opacity-5 border-primary hover:bg-primary'
        }`}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin h-5 w-5 text-primary" />
          <span className="text-primary">Processing...</span>
        </div>
      ) : (
        <>
          <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-primary group-hover:translate-x-0 ease">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </span>
          <span className="absolute flex items-center justify-center w-full h-full text-primary transition-all duration-300 transform group-hover:translate-x-full ease">
            {title || "Next"}
          </span>
          <span className="relative invisible">{title || "Next"}</span>
        </>
      )}
    </button>
  );
};

export default ContentCreator;