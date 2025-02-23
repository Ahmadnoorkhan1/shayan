import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { marked } from "marked";
import apiService from "../service/api";

 // Function to replace unsupported characters
 const replaceSpecialChars = (text: string) => {
    return text
      .replace(/≤/g, "<=")
      .replace(/≥/g, ">=")
      .replace(/±/g, "+-")
      .replace(/×/g, "x")
      .replace(/÷/g, "/");
  };

  export const downloadItem = async (item: any) => {
    const courseTitle: string = item["Course Title"];
    const chapters: string[] = item["Content"];

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 50;
    const lineSpacing = 16;
    const maxWidth = pageWidth - 2 * margin;

    // Add Title Page
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    const { height } = page.getSize();

    let titleText = replaceSpecialChars(courseTitle);
    let titleFontSize = 24; // Default font size
    let titleWidth = timesBoldFont.widthOfTextAtSize(titleText, titleFontSize);

    // Reduce font size if the title is too wide
    while (titleWidth > maxWidth && titleFontSize > 10) {
      titleFontSize -= 2;
      titleWidth = timesBoldFont.widthOfTextAtSize(titleText, titleFontSize);
    }

    // Center the title with the adjusted font size
    page.drawText(titleText, {
      x: (pageWidth - titleWidth) / 2,
      y: height / 2,
      size: titleFontSize,
      font: timesBoldFont,
      color: rgb(0, 0, 0),
    });

    // Process each chapter and add content to new pages
    for (const chapter of chapters) {
      const chapterHtml: any = marked.parse(chapter); // Convert Markdown to HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(chapterHtml, "text/html");

      page = pdfDoc.addPage([pageWidth, pageHeight]); // New page for each chapter
      let textY = height - margin; // Start position

      doc.body.childNodes.forEach((node) => {
        let font = timesRomanFont;
        let fontSize = 12;
        let text = "";

        if (node.nodeName === "H1") {
          font = timesBoldFont;
          fontSize = 20;
          text = node.textContent || "";
          textY -= 10;
        } else if (node.nodeName === "H2") {
          font = timesBoldFont;
          fontSize = 16;
          text = node.textContent || "";
        } else if (node.nodeName === "H3") {
          font = timesBoldFont;
          fontSize = 14;
          text = node.textContent || "";
        } else if (node.nodeName === "P") {
          font = timesRomanFont;
          fontSize = 12;
          text = node.textContent || "";
          textY -= 5;
        } else if (node.nodeName === "UL") {
          textY -= 5;
          node.childNodes.forEach((li) => {
            if (li.nodeName === "LI") {
              text = "• " + li.textContent;
              textY -= 2;
            }
          });
        }

        // ** Apply character replacement before rendering text **
        text = replaceSpecialChars(text);

        // ** Fix Newline Issue: Wrap Text Properly **
        if (text) {
          const lines = text.split("\n");
          lines.forEach((line) => {
            const words = line.split(" ");
            let currentLine = "";

            words.forEach((word) => {
              const newLine = currentLine + " " + word;
              if (font.widthOfTextAtSize(newLine, fontSize) > maxWidth) {
                page.drawText(currentLine.trim(), {
                  x: margin,
                  y: textY,
                  size: fontSize,
                  font,
                  color: rgb(0, 0, 0),
                });
                textY -= lineSpacing;

                if (textY < margin) {
                  page = pdfDoc.addPage([pageWidth, pageHeight]);
                  textY = height - margin;
                }

                currentLine = word;
              } else {
                currentLine = newLine;
              }
            });

            if (currentLine) {
              page.drawText(currentLine.trim(), {
                x: margin,
                y: textY,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
              });
              textY -= lineSpacing;
            }
          });

          textY -= lineSpacing;
        }
      });
    }

    // Save the PDF and trigger download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${courseTitle}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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