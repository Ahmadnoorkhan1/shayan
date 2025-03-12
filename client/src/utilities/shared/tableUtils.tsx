import { PDFDocument, StandardFonts, rgb, PDFPage } from "pdf-lib";
import { marked } from "marked";
import apiService from "../service/api";
import toast from "react-hot-toast";

// Add utility function to fetch images
const fetchImage = async (url: string): Promise<{ buffer: ArrayBuffer; type: string } | null> => {
  try {
    const cleanUrl = url
      .replace(/\\\\/g, '')
      .replace(/\\"/g, '')
      .replace(/^"|"$/g, '');

    console.log('Fetching image from:', cleanUrl);

    const response = await fetch(cleanUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || '';
    const buffer = await response.arrayBuffer();

    return {
      buffer,
      type: contentType.toLowerCase()
    };
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};




const processCoverPage = async (
  page: PDFPage,
  chapter: string,
  pdfDoc: PDFDocument,
  title: string
) => {
  console.log("...............................title", title);

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(chapter, 'text/html');
    const coverImage = doc.querySelector('.book-cover-image');
    if (!coverImage) return false;

    // Ensure we have a title
    const displayTitle = title || "Untitled Document";

    // Fetch and embed image
    const imgSrc = coverImage.getAttribute('src')?.replace(/&amp;/g, '&');
    if (!imgSrc) return false;
    const imageData = await fetchImage(imgSrc);
    if (!imageData) return false;
    let image;
    if (imageData.type.includes('png')) {
      image = await pdfDoc.embedPng(imageData.buffer);
    } else if (imageData.type.includes('jpeg') || imageData.type.includes('jpg')) {
      image = await pdfDoc.embedJpg(imageData.buffer);
    }
    if (!image) return false;

    // Fonts
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Get page dimensions
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Draw image at top third of page
    const imgDims = image.scale(1);
    const scaledWidth = pageWidth * 0.4;
    const scaledHeight = pageHeight * 0.4 * (imgDims.height / imgDims.width);
    const imageX = (pageWidth - scaledWidth) / 2;
    const imageY = pageHeight * 0.25; // Increased from 0.65 to 0.75 (higher placement)
    
    page.drawImage(image, {
      x: imageX,
      y: imageY,
      width: scaledWidth,
      height: scaledHeight
    });

    // // Draw title in middle of page (direct approach)
    console.log("Drawing title:", displayTitle);
    page.drawText(displayTitle, {
      x: 100,
      y: pageHeight * 0.4,
      size: 24,
      font: timesBoldFont,
      color: rgb(0, 0, 0),
    });

    // Draw date at bottom
    const dateText = new Date().toLocaleDateString();
    page.drawText(dateText, {
      x: (pageWidth - timesRomanFont.widthOfTextAtSize(dateText, 12)) / 2,
      y: pageHeight * 0.2,
      size: 12,
      font: timesRomanFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    return true;
  } catch (error) {
    console.error("Error processing cover page:", error);
    return false;
  }
};

const pdfConfig = {
  pageWidth: 595,
  pageHeight: 842,
  margin: 50,
  lineSpacing: 24,
  paragraphSpacing: 20,
  headerSpacing: 30,
  chapterSpacing: 50,
  imageMaxWidth: 495, // pageWidth - 2 * margin
  get maxWidth() { return this.pageWidth - (2 * this.margin); },
  fonts: {
    h1: { size: 24, spacing: 30 },
    h2: { size: 20, spacing: 25 },
    h3: { size: 18, spacing: 20 },
    p: { size: 12, spacing: 16 },
    list: { size: 12, spacing: 14, indent: 20 }
  }
};

const cleanHtmlContent = (html: string) => {
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

export const downloadItem = async (row: any, setLoading: any) => {
  if (!row?.Content) {
    console.error("No content to download");
    return;
  }

  try {
    setLoading(true);
    console.log("Original Content:", row.Content);

    // Parse and clean content
    let chapters = [];
    try {
      // Remove escaped characters and clean JSON
      const cleanedContent = row.Content
        .replace(/^"|"$/g, '')                // Remove wrapping quotes
        .replace(/\\"/g, '"')                 // Fix escaped quotes
        .replace(/\\\\/g, '\\')              // Fix double escapes
        .replace(/\\n/g, '\n')               // Convert newlines
        .replace(/\[\\"|\\"]/g, '"')         // Fix array brackets
        .replace(/"{2,}/g, '"');             // Fix multiple quotes

      console.log("Cleaned Content:", cleanedContent);

      // Parse the content
      let parsedContent;
      try {
        parsedContent = JSON.parse(cleanedContent);
      } catch (e) {
        console.log("First parse failed, trying alternative:", e);
        parsedContent = cleanedContent.split('","').map((ch:any) => 
          ch.replace(/^"|"$/g, '')
        );
      }

      chapters = Array.isArray(parsedContent) ? parsedContent : [parsedContent];
      console.log("Parsed Chapters:", chapters);

    } catch (error) {
      console.error("Content parsing error:", error);
      // toast.error("Error parsing course content");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

     // 1) Process cover first if needed
     let hasCover = false;
     const coverIndex = chapters.findIndex(ch =>
       ch.includes('book-cover-image') || ch.includes('data-cover="true"')
     );
     if (coverIndex >= 0) {
       // Create page for cover first
       console.log("=======================>",hasCover, coverIndex)
       const coverPage = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
       hasCover = await processCoverPage(coverPage, chapters[coverIndex], pdfDoc,   row["Course Title"]);
       if (hasCover) {
         chapters.splice(coverIndex, 1);
       } else {
         // Remove if no valid image was found
         pdfDoc.removePage(pdfDoc.getPageCount() - 1);
       }
     }
    
    let page: PDFPage;
    // Now add title page as second page
    // if (!hasCover || chapters.length > 0) { // Ensure title page isn't added unnecessarily
     
    // const titlePage = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
    // const { height } = titlePage.getSize();
    const height = 900;
//  console.log("==========================?aaaaahhh")
//    

    // Helper function for text wrapping
    const drawWrappedText = (text: string, font: any, fontSize: number, startX: number, startY: number, indent = 0) => {
      const words = text.trim().split(' ');
      let currentLine = '';
      let currentY = startY;

      const drawLine = (line: string, y: number) => {
        if (!line.trim()) return y;
        page.drawText(line.trim(), {
          x: startX + indent,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        return y;
      };

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (lineWidth > pdfConfig.maxWidth - indent) {
          currentY = drawLine(currentLine, currentY);
          currentY -= pdfConfig.lineSpacing;
          currentLine = word;

          if (currentY < pdfConfig.margin) {
            page = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
            currentY = height - pdfConfig.margin;
          }
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        currentY = drawLine(currentLine, currentY);
      }

      return currentY;
    };

    // Process chapters with enhanced formatting
    for (let i = 0; i < chapters.length; i++) {
      console.log(`Processing chapter ${i + 1}`);

      
 
  
      
      // New page for each chapter
      page = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
      let currentY = height - pdfConfig.margin;

      try {
        const parser = new DOMParser();
        const chapterContent = cleanHtmlContent(chapters[i]);
        const doc = parser.parseFromString(chapterContent, 'text/html');

       // Skip chapter number for cover page
    if (!chapters[i].includes('book-cover-image')) {
      const chapterNum = `Chapter ${i}`;
      page.drawText(chapterNum, {
        x: pdfConfig.margin,
        y: currentY,
        size: 14,
        font: timesBoldFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      currentY -= pdfConfig.chapterSpacing;
    }

        const elements = doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, img');
        
        for (const element of elements) {
          const tagName = element.tagName.toLowerCase();

          
// Update the image processing section in the downloadItem function
if (tagName === 'img') {
  const imgSrc = element.getAttribute('src')?.replace(/&amp;/g, '&');
  if (imgSrc) {
    try {
      console.log('Processing image:', imgSrc);
      const imageData = await fetchImage(imgSrc);
      
      if (imageData) {
        let image;
        try {
          // Determine image type and embed accordingly
          if (imageData.type.includes('png')) {
            image = await pdfDoc.embedPng(imageData.buffer);
          } else if (imageData.type.includes('jpeg') || imageData.type.includes('jpg')) {
            image = await pdfDoc.embedJpg(imageData.buffer);
          } else {
            throw new Error('Unsupported image type: ' + imageData.type);
          }

          // Rest of your image processing code...
          const maxWidth = pdfConfig.maxWidth * 0.8;
          const imgDims = image.scale(1);
          let imgWidth = imgDims.width;
          let imgHeight = imgDims.height;

          if (imgWidth > maxWidth) {
            const scale = maxWidth / imgWidth;
            imgWidth = maxWidth;
            imgHeight = imgHeight * scale;
          }

          if (currentY - imgHeight < pdfConfig.margin) {
            page = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
            currentY = height - pdfConfig.margin;
          }

          const xOffset = (pdfConfig.pageWidth - imgWidth) / 2;
          currentY -= pdfConfig.lineSpacing * 2;

          page.drawImage(image, {
            x: xOffset,
            y: currentY - imgHeight,
            width: imgWidth,
            height: imgHeight,
          });

          currentY -= (imgHeight + pdfConfig.lineSpacing * 3);
          console.log('Image added successfully');
        } catch (embedError) {
          console.error('Error embedding image:', embedError);
          // Add a placeholder or error message in the PDF
          currentY = drawWrappedText(
            '[Image could not be loaded]',
            timesItalicFont,
            10,
            pdfConfig.margin,
            currentY
          );
        }
      } else {
        console.error('Failed to load image data');
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
    continue;
  }
}
         
         
          // Handle text elements with enhanced formatting
          const text = element.textContent?.trim() || '';
          if (!text) continue;

          let font = timesRomanFont;

          switch (tagName) {
            case 'h1':
              currentY -= pdfConfig.fonts.h1.spacing;
              currentY = drawWrappedText(text, timesBoldFont, pdfConfig.fonts.h1.size, 
                pdfConfig.margin, currentY);
              currentY -= pdfConfig.headerSpacing;
              break;

            case 'h2':
              currentY -= pdfConfig.fonts.h2.spacing;
              currentY = drawWrappedText(text, timesBoldFont, pdfConfig.fonts.h2.size, 
                pdfConfig.margin, currentY);
              currentY -= pdfConfig.headerSpacing * 0.8;
              break;

            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
              currentY -= pdfConfig.fonts.h3.spacing;
              currentY = drawWrappedText(text, timesBoldFont, pdfConfig.fonts.h3.size, 
                pdfConfig.margin, currentY);
              currentY -= pdfConfig.headerSpacing * 0.6;
              break;

            case 'p':
              currentY -= pdfConfig.fonts.p.spacing;
              if (element.querySelector('strong')) {
                font = timesBoldFont;
              } else if (element.querySelector('em')) {
                font = timesItalicFont;
              }
              currentY = drawWrappedText(text, font, pdfConfig.fonts.p.size, pdfConfig.margin, currentY);
              currentY -= pdfConfig.paragraphSpacing;
              break;

            case 'ul':
            case 'ol':
              currentY -= pdfConfig.fonts.list.spacing;
              element.querySelectorAll('li').forEach((li, index) => {
                const bullet = tagName === 'ul' ? '•' : `${index + 1}.`;
                const listText = `${bullet} ${li.textContent?.trim()}`;
                currentY = drawWrappedText(listText, timesRomanFont, pdfConfig.fonts.list.size, pdfConfig.margin, currentY, pdfConfig.fonts.list.indent);
                currentY -= pdfConfig.fonts.list.spacing;
              });
              currentY -= pdfConfig.paragraphSpacing;
              break;
          }

          if (currentY < pdfConfig.margin) {
            page = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
            currentY = height - pdfConfig.margin;
          }
        }
      } catch (error) {
        console.error(`Error processing chapter ${i + 1}:`, error);
        // toast.error(`Error processing chapter ${i + 1}`);
      }
    }

    const pagesOffset = hasCover ? 2 : 1; // Skip cover and title page for numbering
    for (let i = pagesOffset; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const pageNum = `${i - pagesOffset + 1}`;
      const pageNumWidth = timesRomanFont.widthOfTextAtSize(pageNum, 10);
      page.drawText(pageNum, {
        x: (pdfConfig.pageWidth - pageNumWidth) / 2,
        y: pdfConfig.margin / 2,
        size: 10,
        font: timesRomanFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    }


    // Save and download PDF
    console.log("Generating final PDF...");
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${row["Course Title"].replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("PDF downloaded successfully");

  } catch (error) {
    console.error("PDF generation error:", error);
    // toast.error("Error generating PDF");
  } finally {
    setLoading(false);
  }
};

export const addItem = (navigate:any) => {
  navigate("add");
};

export const editItem = (navigate:any,link:any,pre:any) =>{
  // navigate(link)
  console.log(link)
  if(pre){
    navigate(pre+'/'+'edit/'+link.ID)
  }else{
    navigate('edit/'+link.ID) 
  }
}

export const deleteItem = async (item: any,setCourses:any) => {
  const courseId = item["ID"];
  const courseType = "course"; // or "book", determine dynamically if needed

  try {
    const response = await apiService.post(
      `course-creator/deleteCourse/${courseId}/${courseType}`,
      {}
    );

    if (response.success) {
      setCourses((prevCourses:any) =>
        prevCourses.filter((course:any) => course["ID"] !== courseId)
      );
      console.log(`Course ${courseId} deleted successfully.`);
    } else {
      console.error("Failed to delete course:", response.message);
    }
  } catch (error) {
    console.error("Error deleting course:", error);
  }
};



export const ShareItem = async (item: any) => {
  const courseId = item["ID"];
  // Determine courseType from the row data structure
  const courseType = item["Content"] && 
    typeof item["Content"] === "string" && 
    item["Content"].includes("book-cover-image") ? "book" : "course";

  try {
    // Call the API to get a share link
    const response = await apiService.post(
      `course-creator/shareCourse/${courseId}/${courseType}`,
      {}
    );

    if (response.success) {
      // Get the share URL from the response
      const shareUrl = response.data?.shareUrl || 
        `${window.location.origin}/shared/${courseType}/${courseId}`;
      
      // Copy link to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Show success message
      toast.success(`${courseType === 'book' ? 'Book' : 'Course'} shared successfully! Link copied to clipboard.`);
      
      // Open the shared page in a new tab
      window.open(shareUrl, '_blank');
    } else {
      toast.error(`Failed to share ${courseType}: ${response.message}`);
      console.error(`Failed to share ${courseType}:`, response.message);
    }
  } catch (error) {
    toast.error(`Error sharing ${courseType}. Please try again.`);
    console.error(`Error sharing ${courseType}:`, error);
  }
};

/**
 * Format shared content for public viewing
 * This function prepares courses/books for public sharing
 */
   export const formatSharedContent = (content: string, title: string, type: 'course' | 'book'): string => {
   try {
    // Parse the content
    let chapters = [];
    try {
      // Clean and parse the content
      const cleanedContent = content
        .replace(/^"|"$/g, '')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\[\\"|\\"]/g, '"')
        .replace(/"{2,}/g, '"');
      
      // Parse content into chapters array
      let parsedContent;
      try {
        parsedContent = JSON.parse(cleanedContent);
      } catch (e) {
        parsedContent = cleanedContent.split('","').map((ch: any) => 
          ch.replace(/^"|"$/g, '')
        );
      }
      
      chapters = Array.isArray(parsedContent) ? parsedContent : [parsedContent];
    } catch (error) {
      console.error("Content parsing error:", error);
      return `<div class="error-message">Error parsing content</div>`;
    }
    
    // Check for cover image
    const coverIndex = chapters.findIndex(ch => 
      ch.includes('book-cover-image') || ch.includes('data-cover="true"')
    );
    
    let coverHtml = '';
    if (coverIndex >= 0) {
      // Extract cover image URL
      const parser = new DOMParser();
      const doc = parser.parseFromString(chapters[coverIndex], 'text/html');
      const coverImage = doc.querySelector('.book-cover-image');
      if (coverImage) {
        const imgSrc = coverImage.getAttribute('src');
        if (imgSrc) {
          coverHtml = `
            <div class="cover-container">
              <img src="${imgSrc}" alt="${title} Cover" class="cover-image">
            </div>
          `;
        }
      }
      
      // Remove cover from chapters array
      chapters.splice(coverIndex, 1);
    }
    
    // Generate table of contents
    let tocHtml = `<div class="toc-container">
      <h2>Table of Contents</h2>
      <ul class="toc-list">`;
    
    // Process each chapter to extract titles for TOC
    const chapterTitles = chapters.map((chapter, index) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(chapter, 'text/html');
      const h1 = doc.querySelector('h1');
      return h1?.textContent || `Chapter ${index + 1}`;
    });
    
    // Generate TOC entries
    chapterTitles.forEach((title, index) => {
      tocHtml += `<li><a href="#chapter-${index + 1}" class="toc-link">${title}</a></li>`;
    });
    tocHtml += `</ul></div>`;
    
    // Process each chapter
    let chaptersHtml = '';
    chapters.forEach((chapter, index) => {
      // Process chapter content
      const processedChapter = processChapterForSharing(chapter, index);
      chaptersHtml += processedChapter;
    });
    
    // Assemble the complete HTML
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} | Shared ${type === 'book' ? 'Book' : 'Course'}</title>
     <style>
      :root {
        --primary-color: #650AAA;
        --secondary-color: #1537E9;
        --text-color: #222222;
        --background-color: #fafafa;
        --border-color: #EBEBEB;
        --highlight-color: #fff;
        --shadow-color: rgba(0, 0, 0, 0.05);
      }
      
      * {
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Montesserat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        color: var(--text-color);
        background-color: var(--background-color);
        margin: 0;
        padding: 0;
        font-size: 16px;
      }
      
      .container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem;
      }
      
      header {
        text-align: center;
        margin-bottom: 2.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid var(--primary-color);
      }
      
      .title {
        font-size: 2.5rem;
        color: var(--primary-color);
        margin-bottom: 0.75rem;
        font-weight: 700;
        font-family: 'Merriweather', serif;
        line-height: 1.2;
      }
      
      .subtitle {
        font-size: 1.2rem;
        color: #888888;
        font-weight: normal;
      }
      
      .cover-container {
        text-align: center;
        margin: 2rem 0;
      }
      
      .cover-image {
        max-width: 100%;
        max-height: 500px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }
      
      .toc-container {
        background-color: var(--highlight-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.5rem;
        margin: 2rem 0;
        box-shadow: 0 2px 8px var(--shadow-color);
      }
      
      .toc-container h2 {
        margin-top: 0;
        color: var(--primary-color);
        font-size: 1.5rem;
        font-family: 'Merriweather', serif;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.75rem;
        margin-bottom: 1.25rem;
      }
      
      .toc-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }
      
      .toc-link {
        display: block;
        padding: 0.6rem 0.5rem;
        color: var(--text-color);
        text-decoration: none;
        font-weight: 500;
        border-radius: 4px;
        transition: all 0.2s ease;
        margin-bottom: 0.25rem;
      }
      
      .toc-link:hover {
        color: var(--primary-color);
        background-color: rgba(101, 10, 170, 0.05);
        padding-left: 0.75rem;
      }
      
      .chapter {
        margin: 3rem 0;
        padding: 2rem;
        background-color: var(--highlight-color);
        border-radius: 8px;
        box-shadow: 0 2px 8px var(--shadow-color);
        border: 1px solid var(--border-color);
      }
      
      .chapter-title {
        color: var(--primary-color);
        font-family: 'Merriweather', serif;
        font-size: 2rem;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color);
        line-height: 1.3;
      }
      
      .chapter-content {
        margin-bottom: 1.5rem;
        font-size: 1rem;
        line-height: 1.7;
      }
      
      .chapter-content h2 {
        color: #333;
        font-family: 'Merriweather', serif;
        font-size: 1.5rem;
        margin: 2rem 0 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .chapter-content h3 {
        color: #444;
        font-family: 'Merriweather', serif;
        font-size: 1.3rem;
        margin: 1.75rem 0 0.75rem;
      }
      
      .chapter-content p {
        margin-bottom: 1.25rem;
        line-height: 1.75;
        color: #333;
      }
      
      .chapter-content ul,
      .chapter-content ol {
        margin-bottom: 1.25rem;
        padding-left: 1.5rem;
      }
      
      .chapter-content li {
        margin-bottom: 0.5rem;
        color: #333;
      }
      
      .chapter-content img {
        max-width: 100%;
        margin: 1.25rem auto;
        border-radius: 4px;
        display: block;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
      
      .quiz-container {
        background-color: #fcfcfc;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.75rem;
        margin: 2.5rem 0;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      }
      
      .quiz-container h2,
      .quiz-container h3 {
        color: var(--primary-color);
        font-family: 'Merriweather', serif;
        font-size: 1.5rem;
        margin-top: 0;
        margin-bottom: 1.25rem;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.5rem;
      }
      
      .quiz-question {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
      }
      
      .quiz-question:last-child {
        border-bottom: none;
      }
      
      .quiz-question p {
        font-weight: 600;
        margin-bottom: 1rem;
        font-size: 1.05rem;
        color: #333;
      }
      
      .quiz-question ul {
        list-style-type: none;
        padding: 0;
      }
      
      .quiz-question li {
        display: flex;
        align-items: center;
        margin-bottom: 0.75rem;
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      
      .quiz-question li:hover {
        background-color: rgba(101, 10, 170, 0.05);
      }
      
      .circle-marker {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #ccc;
        border-radius: 50%;
        margin-right: 10px;
        cursor: pointer;
        vertical-align: middle;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      
      .circle-marker.selected {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
      }
      
      .quiz-answer-field {
        padding: 10px 14px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 1rem;
        width: 100%;
        max-width: 400px;
        transition: border-color 0.2s ease;
        margin-top: 0.5rem;
      }
      
      .quiz-answer-field:focus {
        border-color: var(--primary-color);
        outline: none;
        box-shadow: 0 0 0 2px rgba(101, 10, 170, 0.1);
      }
      
      .quiz-submit-btn {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 500;
        font-size: 1rem;
        transition: all 0.3s ease;
        margin-top: 1.25rem;
      }
      
      .quiz-submit-btn:hover {
        background-color: #540a8c;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      .quiz-submit-btn:active {
        transform: translateY(0);
        box-shadow: none;
      }
      
      .quiz-feedback {
        margin-top: 12px;
        padding: 12px;
        border-radius: 6px;
        font-weight: 500;
        display: none;
      }
      
      .correct-feedback {
        background-color: #f0fdf4;
        color: #166534;
        border-left: 3px solid #22c55e;
      }
      
      .incorrect-feedback {
        background-color: #fef2f2;
        color: #991b1b;
        border-left: 3px solid #ef4444;
      }
      
      .quiz-results {
        margin-top: 20px;
        padding: 16px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background-color: #f9f9f9;
        display: none;
      }
      
      .quiz-results h4 {
        margin-top: 0;
        color: #333;
        font-size: 1.25rem;
        margin-bottom: 12px;
      }
      
      .quiz-score {
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .score-value {
        color: var(--primary-color);
      }
      
      footer {
        text-align: center;
        margin-top: 4rem;
        padding-top: 1.25rem;
        border-top: 1px solid var(--border-color);
        font-size: 0.9rem;
        color: #888888;
      }
      
      @media (max-width: 768px) {
        .container {
          padding: 1.25rem;
        }
        
        .title {
          font-size: 1.75rem;
        }
        
        .chapter {
          padding: 1.5rem;
        }
        
        .chapter-title {
          font-size: 1.6rem;
        }
        
        .quiz-container {
          padding: 1.25rem;
        }
      }
    </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1 class="title">${title}</h1>
            <h2 class="subtitle">Shared ${type === 'book' ? 'Book' : 'Course'}</h2>
          </header>
          
          ${coverHtml}
          ${tocHtml}
          
          <div class="chapters-container">
            ${chaptersHtml}
          </div>
          
          <footer>
            <p>© ${new Date().getFullYear()} Mini Schools Academy. All rights reserved.</p>
          </footer>
        </div>
        
       <script>
  document.addEventListener('DOMContentLoaded', function() {
    // Set up quiz interactivity
    setupQuizzes();
  });
  
  function setupQuizzes() {
    console.log('Setting up quiz interactivity');
    
    // Handle circle marker selection with improved visual feedback
    document.querySelectorAll('.circle-marker').forEach(marker => {
      marker.addEventListener('click', function() {
        // Clear other selections in the same question
        const question = this.closest('.quiz-question');
        if (question) {
          question.querySelectorAll('.circle-marker').forEach(m => {
            m.classList.remove('selected');
            m.style.backgroundColor = 'transparent';
            m.style.borderColor = '#ccc';
          });
        }
        
        // Select this one with visual feedback
        this.classList.add('selected');
        this.style.backgroundColor = '#4338ca';
        this.style.borderColor = '#4338ca';
      });
    });
    
    // Handle submit buttons
    document.querySelectorAll('.quiz-submit-btn').forEach(button => {
      button.addEventListener('click', function() {
        const quizId = this.getAttribute('data-quiz-id');
        if (quizId) {
          checkQuizAnswers(quizId);
        }
      });
    });
    
    // Hide all feedback and results containers initially
    document.querySelectorAll('.quiz-feedback, .quiz-results').forEach(el => {
      el.style.display = 'none';
    });
  }
  
  function checkQuizAnswers(quizId) {
    const quizContainer = document.getElementById(quizId);
    if (!quizContainer) return;
    
    const quizType = quizContainer.getAttribute('data-quiz-type');
    const questions = quizContainer.querySelectorAll('.quiz-question');
    let score = 0;
    
    questions.forEach(question => {
      const correctAnswer = question.getAttribute('data-correct-answer');
      const correctFeedback = question.querySelector('.correct-feedback');
      const incorrectFeedback = question.querySelector('.incorrect-feedback');
      
      if (quizType === 'multiple-choice' || quizType === 'true-false') {
        // For multiple choice and true/false
        const selectedOption = question.querySelector('.circle-marker.selected');
        
        if (selectedOption) {
          const userAnswer = selectedOption.getAttribute('data-option');
          
          if (userAnswer === correctAnswer) {
            score++;
            if (correctFeedback) correctFeedback.style.display = 'block';
            if (incorrectFeedback) incorrectFeedback.style.display = 'none';
          } else {
            if (correctFeedback) correctFeedback.style.display = 'none';
            if (incorrectFeedback) incorrectFeedback.style.display = 'block';
          }
        } else {
          if (correctFeedback) correctFeedback.style.display = 'none';
          if (incorrectFeedback) incorrectFeedback.style.display = 'block';
        }
      } 
      else if (quizType === 'fill-in-the-blank') {
        // For fill-in-the-blank
        const inputField = question.querySelector('.quiz-answer-field');
        
        if (inputField) {
          const userAnswer = inputField.value.trim().toLowerCase();
          const correctAnswerText = correctAnswer ? correctAnswer.toLowerCase() : '';
          
          if (userAnswer === correctAnswerText) {
            score++;
            if (correctFeedback) correctFeedback.style.display = 'block';
            if (incorrectFeedback) incorrectFeedback.style.display = 'none';
          } else {
            if (correctFeedback) correctFeedback.style.display = 'none';
            if (incorrectFeedback) incorrectFeedback.style.display = 'block';
          }
        }
      }
    });
    
    // Show results
    const resultsContainer = quizContainer.querySelector('.quiz-results');
    const scoreValue = quizContainer.querySelector('.score-value');
    const totalQuestions = quizContainer.querySelector('.total-questions');
    
    if (resultsContainer) resultsContainer.style.display = 'block';
    if (scoreValue) scoreValue.textContent = score.toString();
    if (totalQuestions) totalQuestions.textContent = questions.length.toString();
  }
</script>
      </body>
      </html>
    `;
    
    return htmlTemplate;
  } catch (error:any) {
    console.error('Error formatting shared content:', error);
    return `<div class="error-message">Error formatting content: ${error.message}</div>`;
  }
};

/**
 * Process a single chapter for sharing
 */
/**
 * Process a single chapter for sharing
 */
function processChapterForSharing(chapter: string, index: number): string {
  try {
    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(chapter, 'text/html');
    
    // Extract title
    const titleElement = doc.querySelector('h1');
    const title = titleElement?.textContent || `Chapter ${index + 1}`;
    
    // Remove h1 from content to avoid duplication
    if (titleElement) {
      titleElement.remove();
    }
    
    // Extract the shared quiz HTML from comment markers
    const sharedQuizRegex = /<!-- SHARED_QUIZ_START -->([\s\S]*?)<!-- SHARED_QUIZ_END -->/;
    const matches = chapter.match(sharedQuizRegex);
    let quizHtml = '';
    
    if (matches && matches[1]) {
      quizHtml = matches[1].trim();
      console.log('Found shared quiz content:', quizHtml.substring(0, 100) + '...');
    }
    
    // Get the content HTML without the quiz markers and editor quiz
    let content = doc.body.innerHTML;
    
    // First, remove the comment markers and everything between them
    content = content.replace(sharedQuizRegex, '');
    
    // Then remove any editor-specific quiz elements
    const tempDoc = parser.parseFromString(content, 'text/html');
    
    // Remove the static quiz elements that are meant for editor view only
    // Look for h2 headers with "Exercises" or structured quiz content
    const exercisesHeaders = tempDoc.querySelectorAll('h2');
    exercisesHeaders.forEach(header => {
      if (header.textContent?.trim() === 'Exercises') {
        // Found an exercises section, remove it and all content until the next h2 or end
        let currentNode = header;
        const nodesToRemove = [currentNode];
        
        // Collect nodes to remove
        currentNode = currentNode.nextElementSibling;
        while (currentNode && currentNode.tagName !== 'H2') {
          nodesToRemove.push(currentNode);
          currentNode = currentNode.nextElementSibling;
        }
        
        // Remove the collected nodes
        nodesToRemove.forEach(node => {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        });
      }
    });
    
    // Update content after removing editor quiz elements
    content = tempDoc.body.innerHTML;
    
    // If we have shared quiz HTML, append it
    if (quizHtml) {
      content += quizHtml;
    }
    
    // Format the chapter HTML
    return `
      <section id="chapter-${index + 1}" class="chapter">
        <h2 class="chapter-title">${title}</h2>
        <div class="chapter-content">
          ${sanitizeHtml(content)}
        </div>
      </section>
    `;
  } catch (error) {
    console.error(`Error processing chapter ${index + 1}:`, error);
    return `<section class="chapter error">
      <h2 class="chapter-title">Chapter ${index + 1}</h2>
      <div class="chapter-content">
        <p>Error processing this chapter.</p>
      </div>
    </section>`;
  }
}

/**
 * Sanitize HTML content for security
 */
function sanitizeHtml(html: string): string {
  try {
    // Create a new DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Process and sanitize all elements
    sanitizeNode(doc.body);
    
    // Make quiz elements interactive
    enhanceQuizElements(doc.body);
    
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return html; // Return original if sanitization fails
  }
}

/**
 * Recursively sanitize a DOM node
 */
function sanitizeNode(node: Node): void {
  // Skip if not an element
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  
  const element = node as Element;
  
  // Handle specific elements
  if (element.tagName === 'SCRIPT') {
    element.remove();
    return;
  }
  
  // Remove event handlers
  const attributes = element.attributes;
  for (let i = attributes.length - 1; i >= 0; i--) {
    const attrName = attributes[i].name;
    if (attrName.startsWith('on') || attrName === 'href' && attributes[i].value.startsWith('javascript:')) {
      element.removeAttribute(attrName);
    }
  }
  
  // Process children
  for (let i = 0; i < element.childNodes.length; i++) {
    sanitizeNode(element.childNodes[i]);
  }
}

/**
 * Enhance quiz elements for interactivity
 */
function enhanceQuizElements(rootElement: Element): void {
  // Ensure quiz containers have proper IDs
  rootElement.querySelectorAll('.quiz-container').forEach((container, index) => {
    if (!container.id) {
      container.id = `quiz-${Date.now()}-${index}`;
    }
    
    // Ensure submit buttons have the quiz ID
    const submitBtn = container.querySelector('.quiz-submit-btn');
    if (submitBtn) {
      submitBtn.setAttribute('data-quiz-id', container.id);
    }
  });
}