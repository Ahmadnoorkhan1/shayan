// import { DOMParser } from '@types/jsdom';
// import { Delta } from 'quill';

interface QuizContent {
  editorContent: string;
  sharedContent: string;
}

interface QuillEditor {
  getContents: () => Delta;
  setContents: (delta: Delta) => void;
  root: HTMLElement;
  getSelection: () => { index: number; length: number } | null;
  setSelection: (index: number, length: number) => void;
}

interface Delta {
  ops: Operation[];
}


interface Operation {
  insert?: string | { image: string } | any;
  attributes?: Record<string, any>;
}
/**
 * Extract quiz content from HTML
 */
export const extractQuizContent = (html: string): QuizContent | null => {
  const editorQuizRegex = /<h2>Exercises<\/h2>([\s\S]*?)(?=<!-- SHARED_QUIZ_START -->|$)/;
  const sharedQuizRegex = /<!-- SHARED_QUIZ_START -->([\s\S]*?)<!-- SHARED_QUIZ_END -->/;
  if (!html || typeof html !== 'string') {
    return null;
  }
  
  const editorMatch = html.match(editorQuizRegex);
  const sharedMatch = html.match(sharedQuizRegex);
  
  if (!editorMatch && !sharedMatch) return null;
  
  return {
    editorContent: editorMatch ? editorMatch[1].trim() : '',
    sharedContent: sharedMatch ? sharedMatch[1].trim() : ''
  };
};

/**
 * Handle chapter selection and content extraction
 */
// Update processChapterSelection to ensure quiz content is handled correctly
export const processChapterSelection = (
  chapterContent: string, 
  index: number
) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(chapterContent, 'text/html');
  
  // Special handling for cover pages
// Check if this is a cover chapter
const isCover = typeof html === 'string' && (
  html.includes('data-cover="true"') || 
  html.includes('book-cover-image')
);
  
  if (isCover) {
    const coverImg = doc.querySelector('.book-cover-image');
    const imgSrc = coverImg?.getAttribute('src') || '';
    
    return {
      isCover: true,
      content: `<div style="text-align: center; padding: 20px;">
        <img src="${imgSrc}" style="max-width: 100%; max-height: 400px; margin: 0 auto;" />
      </div>`,
      title: 'Cover',
      index,
      quizContent: null // Explicitly set null for cover pages
    };
  }

  // Extract quiz content first  
  const quizContent = extractQuizContent(chapterContent);
  
  // Remove quiz sections from editor content
  const cleanDoc = parser.parseFromString(chapterContent, 'text/html');
  
  const quizSections = cleanDoc.querySelectorAll('h2');
  quizSections.forEach(section => {
    if (section.textContent?.trim() === 'Exercises') {
      let currentNode = section as any;
      while (currentNode) {
        const nextNode = currentNode.nextElementSibling;
        currentNode.remove();
        if (!nextNode || nextNode.tagName === 'H2') break;
        currentNode = nextNode;
      }
    }
  });

  // Extract title and clean content
  const titleElement = cleanDoc.querySelector('h1');
  const title = titleElement?.textContent || `Chapter ${index + 1}`;
  
  if (titleElement) {
    titleElement.remove();
  }

  return {
    isCover: false,
    content: cleanDoc.body.innerHTML,
    title,
    index,
    quizContent // Will be null if no quiz content was found
  };
};

/**
 * Update editor content and save changes
 */
export const handleContentUpdate = (
  content: string, 
  title: string, 
  hasQuiz = false,
  existingContent?: string
): string => {
  // Extract existing quiz content if present
  let editorQuizContent = '';
  let sharedQuizContent = '';

  if (hasQuiz && existingContent) {
    // Match editor quiz section
    const editorMatch = existingContent.match(
      /<h2>Exercises<\/h2>([\s\S]*?)(?=<!-- SHARED_QUIZ_START -->|$)/
    );
    if (editorMatch) {
      editorQuizContent = editorMatch[0];
    }

    // Match shared quiz section with markers
    const sharedMatch = existingContent.match(
      /<!-- SHARED_QUIZ_START -->([\s\S]*?)<!-- SHARED_QUIZ_END -->/
    );
    if (sharedMatch) {
      sharedQuizContent = sharedMatch[0];
    }
  }

  // Clean up the main content by removing any existing quiz sections
  let cleanContent = content;
  if (hasQuiz) {
    cleanContent = content
      .replace(/<h2>Exercises<\/h2>[\s\S]*?(?=<h2>|$)/, '')
      .replace(/<!-- SHARED_QUIZ_START -->[\s\S]*?<!-- SHARED_QUIZ_END -->/, '');
  }

  // Build updated content
  let updatedContent = `<h1>${title}</h1>${cleanContent}`;

  // Check if content needs HTML structure
  const hasHtmlStructure = cleanContent.includes('<h1>') || cleanContent.includes('<h2>');
  if (!hasHtmlStructure) {
    updatedContent = `<h1>${title}</h1>\n<h2>Section 1</h2>\n${cleanContent}`;
  }

  // Preserve quiz content if it exists
  if (editorQuizContent && sharedQuizContent) {
    updatedContent = `${updatedContent}${editorQuizContent}${sharedQuizContent}`;
  }

  // Additional validation to ensure quiz structure remains intact
  if (hasQuiz) {
    const verifyEditorQuiz = updatedContent.includes('<h2>Exercises</h2>');
    const verifySharedQuiz = updatedContent.includes('<!-- SHARED_QUIZ_START -->') && 
                            updatedContent.includes('<!-- SHARED_QUIZ_END -->');
    
    if (!verifyEditorQuiz || !verifySharedQuiz) {
      console.error('Quiz structure validation failed');
      // Restore quiz content if structure was lost
      if (editorQuizContent && sharedQuizContent) {
        updatedContent = `${updatedContent}${editorQuizContent}${sharedQuizContent}`;
      }
    }
  }

  // Clean up JSON stringify artifacts
  return updatedContent
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\s*(<!-- SHARED_QUIZ_START -->)\s*/g, '\n$1\n')  // Clean quiz markers spacing
    .replace(/\s*(<!-- SHARED_QUIZ_END -->)\s*/g, '\n$1\n')
    .trim();
};

/**
 * Handle image editing in editor delta
 */
export const updateEditorImage = (
  delta: Delta,
  currentImage: string,
  newImageUrl: string
): Delta => {
  const updatedDelta: Delta = { ops: [] };
  let imageFound = false;

  delta.ops.forEach((op: Operation) => {
    if (!imageFound && op.insert?.image === currentImage) {
      updatedDelta.ops.push({
        insert: { image: newImageUrl }
      });
      imageFound = true;
    } else {
      updatedDelta.ops.push(op);
    }
  });

  return updatedDelta;
};

/**
 * Generate cover content
 */
export const generateCoverContent = (imageUrl: string): string => {
  return `
    <div data-cover="true">
      <img 
        src="${imageUrl}" 
        alt="Cover Image" 
        class="book-cover-image"
        style="display: block; width: 100%; max-height: 600px; object-fit: contain;"
        data-cover="true"
      >
    </div>`;
};

/**
 * Check if chapter is a cover
 */
export const isCoverChapter = (html: string): boolean => {
  return html.includes('data-cover="true"') || html.includes('book-cover-image');
};

/**
 * Extract chapter title for dialogs
 */
export const extractChapterTitle = (html: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    if (isCoverChapter(html)) return 'Cover';
    
    const titleElement = doc.querySelector('h1');
    return titleElement?.textContent || 'this chapter';
  } catch (e) {
    return 'this chapter';
  }
};

/**
 * Format quiz content for saving
 */
export const formatQuizContent = (
  editorQuizHTML: string, 
  sharedQuizHTML: string, 
  title: string,
  content: string
): string => {
  const sharedQuizMarker = `
  <!-- SHARED_QUIZ_START -->
  ${sharedQuizHTML}
  <!-- SHARED_QUIZ_END -->
  `;
  
  return `<h1>${title}</h1>${content}${editorQuizHTML}${sharedQuizMarker}`;
};