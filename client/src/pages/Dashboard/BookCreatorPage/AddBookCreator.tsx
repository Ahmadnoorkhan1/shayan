import ContentCreator from "../../../components/ContentCreator/ContentCreator";
import StepOneBookCreator from "../../../components/AiToolForms/BookCreator/StepOneBookCreator";
import StepTwoBookCreator from "../../../components/AiToolForms/BookCreator/StepTwoBookCreator";
import StepBookDetails from "../../../components/AiToolForms/BookCreator/StepBookDetails";
import StepFourBookCreator from "../../../components/AiToolForms/BookCreator/StepFourBookCreator";
import StepFiveBookCreator from "../../../components/AiToolForms/BookCreator/StepFiveBookCreator";

const AddBookCreator = () => {
  const bookSteps = [
    { label: "Give A Topic", icon: true },
    { label: "Select Title", icon: true },
    { label: "Book Details", icon: true },
    { label: "Summary", icon: true },
    { label: "Pro Book", icon: true },
  ];

  // Instead of creating components directly, just provide references to them
  // The ContentCreator will create instances with appropriate props
  const bookComponents = [
    StepOneBookCreator,
    StepTwoBookCreator,
    StepBookDetails,
    StepFourBookCreator,
    StepFiveBookCreator
  ];

  const bookApiEndpoints = {
    titles: "/book-creator/step-1",
    summary: "/book-creator/step-3",
    chapters: "/book-creator/step-5",
    content: "/book-creator/getBookChapter",
    saveContent: "course-creator/addCourse/book"
  };

  const bookStorageKeys = {
    titles: "book_titles",
    selectedTitle: "selectedBookTitle",
    chapterTitles: "book_chapter_titles",
    summary: "book_summary",
    numChapters: "number_of_bookchapters"
  };

  // These are the required fields for book detail validation
  const requiredBookFields = {
    minRequired: 3, // Only require any 3 fields
    fields: ["mainCharacter", "setting", "theme", "conflict", "pacing", "tone"] // All possible fields
  };
  
  return (
    <ContentCreator
      contentType="book"
      steps={bookSteps}
      stepComponents={bookComponents as any}
      apiEndpoints={bookApiEndpoints}
      requirementFields={requiredBookFields}
      redirectPath="/dashboard/book-creator"
      storageKeys={bookStorageKeys}
    />
  );
};

export default AddBookCreator;