import { PDFDocument, StandardFonts, rgb, PDFPage } from "pdf-lib";
import { marked } from "marked";
import apiService from "../service/api";

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

// First update the processCoverPage function
const processCoverPage = async (pdfDoc: PDFDocument, chapter: string) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(chapter, 'text/html');
    // Update selector to match the actual class we're using
    const coverImage = doc.querySelector('.book-cover-image');
    
    if (coverImage) {
      const imgSrc = coverImage.getAttribute('src')?.replace(/&amp;/g, '&');
      if (imgSrc) {
        const imageData = await fetchImage(imgSrc);
        if (imageData) {
          let image;
          if (imageData.type.includes('png')) {
            image = await pdfDoc.embedPng(imageData.buffer);
          } else if (imageData.type.includes('jpeg') || imageData.type.includes('jpg')) {
            image = await pdfDoc.embedJpg(imageData.buffer);
          }

          if (image) {
            // Create the first page for cover
            const page = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
            const { width: pageWidth, height: pageHeight } = page.getSize();
            
            // Calculate dimensions for full-page cover
            const imgDims = image.scale(1);
            let scaledWidth = pageWidth * 0.95;
            let scaledHeight = (scaledWidth / imgDims.width) * imgDims.height;

            if (scaledHeight > pageHeight * 0.95) {
              scaledHeight = pageHeight * 0.95;
              scaledWidth = (scaledHeight / imgDims.height) * imgDims.width;
            }

            // Center the image
            const x = (pageWidth - scaledWidth) / 2;
            const y = (pageHeight - scaledHeight) / 2;

            // Draw only the image
            page.drawImage(image, {
              x,
              y,
              width: scaledWidth,
              height: scaledHeight
            });

            return true;
          }
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error processing cover page:', error);
    return false;
  }
};

// Config object with enhanced styling options
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

console.log(chapters[0], "see the cover image")
    // Process cover first, before any other pages
    const hasCover = chapters[0] && chapters[0].includes('book-cover-image');
    if (hasCover) {
      const coverProcessed = await processCoverPage(pdfDoc, chapters[0]);
      if (coverProcessed) {
        chapters = chapters.slice(1); // Remove cover chapter from further processing
      }
    }
    let page = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
    const { height } = page.getSize();
    // Now add title page as second page
    if (!hasCover || chapters.length > 0) { // Ensure title page isn't added unnecessarily
     

      const titleText = row["Course Title"];
      const titleFontSize = 16;
      const titleWidth = timesBoldFont.widthOfTextAtSize(titleText, titleFontSize);

      page.drawText(titleText, {
        x: (pdfConfig.pageWidth - titleWidth) / 2,
        y: height - 200,
        size: titleFontSize,
        font: timesBoldFont,
        color: rgb(0.2, 0.2, 0.2),
      });

      const dateText = new Date().toLocaleDateString();
      const dateWidth = timesRomanFont.widthOfTextAtSize(dateText, 12);
      page.drawText(dateText, {
        x: (pdfConfig.pageWidth - dateWidth) / 2,
        y: height - 250,
        size: 12,
        font: timesItalicFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

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

      
  // // Check if this is the cover chapter
  // if (i === 0 && chapters[i].includes('book-cover-image')) {
  //   const coverProcessed = await processCoverPage(pdfDoc, chapters[i]);
  //   if (coverProcessed) {
  //     continue; // Skip normal chapter processing for cover
  //   }
  // }
  
      
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

    // Add page numbers
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const pageNum = `${i + 1}`;
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
    
    // toast.success("PDF downloaded successfully");

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

export const editItem = (navigate:any,link:any) =>{
  // navigate(link)
  console.log(link)
  navigate('edit/'+link.ID)
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