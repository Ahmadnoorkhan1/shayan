/**
 * Utility functions for content comparison and handling changes
 */

/**
 * Compares two HTML strings to determine if there are significant content changes
 * Uses multiple strategies to minimize false positives from formatting differences
 * 
 * @param originalContent The original HTML content
 * @param newContent The new HTML content to compare against
 * @param options Optional configuration options
 * @returns boolean - true if significant changes are detected
 */
export const hasSignificantContentChanges = (
  originalContent: string, 
  newContent: string,
  options = { 
    similarityThreshold: 0.95,  // Content similarity threshold (0-1)
    ignoreFormatting: true,     // Whether to ignore pure formatting changes
    compareTextOnly: true       // Whether to compare text content only
  }
): boolean => {
  // Quick equality check
  if (originalContent === newContent) return false;
  
  // Skip comparison if either content is empty/null
  if (!originalContent || !newContent) return originalContent !== newContent;

  // Phase 1: Normalize HTML to reduce false positives from formatting variations
  if (options.ignoreFormatting) {
    const normalizedOriginal = normalizeHtml(originalContent);
    const normalizedNew = normalizeHtml(newContent);
    
    if (normalizedOriginal === normalizedNew) return false;
  }
  
  // Phase 2: Compare just text content
  if (options.compareTextOnly) {
    try {
      const originalText = extractTextContent(originalContent).trim();
      const newText = extractTextContent(newContent).trim();
      
      // Quick check for identical text
      if (originalText === newText) return false;
      
      // Size difference check - if lengths differ dramatically, it's a significant change
      const lengthDifference = Math.abs(originalText.length - newText.length);
      const lengthRatio = Math.min(originalText.length, newText.length) / 
                          Math.max(originalText.length, newText.length);
                          
      // If length difference is more than 10% of the longer text, consider it significant
      if (lengthRatio < 0.9) return true;
      
      // Calculate semantic similarity
      const similarity = calculateContentSimilarity(originalText, newText);
      console.log("Content similarity:", similarity.toFixed(2));
      
      return similarity < options.similarityThreshold;
    } catch (e) {
      console.error("Error comparing text content:", e);
    }
  }
  
  // Default: consider different strings as changed
  return true;
};

/**
 * Normalizes HTML content for comparison by removing common formatting variations
 */
const normalizeHtml = (html: string): string => {
  if (!html) return '';
  
  return html
    .replace(/\s+/g, ' ')                   // Normalize whitespace
    .replace(/>\s+</g, '><')                // Remove whitespace between tags
    .replace(/\s+>/g, '>')                  // Remove whitespace before closing brackets
    .replace(/<\s+/g, '<')                  // Remove whitespace after opening brackets
    .replace(/\s+\/>/g, '/>')               // Remove whitespace in self-closing tags
    .replace(/\s+=/g, '=')                  // Remove whitespace before attributes
    .replace(/=\s+/g, '=')                  // Remove whitespace after attributes
    .replace(/style="[^"]*"/g, '')          // Remove inline styles which often change
    .replace(/class="[^"]*"/g, '')          // Remove classes which don't affect content
    .replace(/data-[^=]+=["'][^"']*["']/g, '') // Remove data attributes
    .trim();                                // Trim leading/trailing whitespace
};

/**
 * Extracts plain text content from HTML string
 */
const extractTextContent = (html: string): string => {
  if (!html) return '';
  
  // Use DOM parser for accurate text extraction
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove scripts and styles that shouldn't be part of text content
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(node => node.remove());
  
  return tempDiv.textContent || '';
};

/**
 * Calculates similarity between two text strings
 * Uses an optimized version of Levenshtein distance
 */
const calculateContentSimilarity = (s1: string, s2: string): number => {
  // Handle empty strings
  if (!s1 && !s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  
  // Quick check for equality
  if (s1 === s2) return 1.0;
  
  // For very long strings, use a faster approach - compare word frequency
  if (s1.length > 1000 || s2.length > 1000) {
    return calculateWordFrequencySimilarity(s1, s2);
  }
  
  // For shorter strings, use Levenshtein distance
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  // Calculate edit distance
  const editDistance = levenshteinDistance(shorter, longer);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Calculate similarity based on word frequency
 */
const calculateWordFrequencySimilarity = (s1: string, s2: string): number => {
  // Tokenize into words and get frequency map
  const words1 = getWordFrequency(s1);
  const words2 = getWordFrequency(s2);
  
  // Calculate Jaccard similarity coefficient
  const intersection = new Set([...Object.keys(words1)].filter(word => words2[word] > 0));
  const union = new Set([...Object.keys(words1), ...Object.keys(words2)]);
  
  if (union.size === 0) return 1.0;
  return intersection.size / union.size;
};

/**
 * Get word frequency map from text
 */
const getWordFrequency = (text: string): Record<string, number> => {
  const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  const frequency: Record<string, number> = {};
  
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return frequency;
};

/**
 * Calculates Levenshtein distance between two strings
 * This is an optimized version for better performance
 */
const levenshteinDistance = (s1: string, s2: string): number => {
  // Create a matrix
  const matrix: number[][] = [];
  
  // Initialize the matrix
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1.charAt(i - 1) === s2.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  // Return the bottom right value
  return matrix[s1.length][s2.length];
};

