import { useLocation, useNavigate } from "react-router";
import GettingStarted from "../../../components/dashboard/GettingStarted";
import Table from "../../../components/ui/Table";
import { useEffect, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { marked } from "marked";
import apiService from "../../../utilities/service/api";
import { downloadItem, editItem } from "../../../utilities/shared/tableUtils";

const BookcreatorPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const location = useLocation();
  const handleBooks = (item: any) => {
    setBooks(item);
  };
 
 // Handle highlight from URL
 useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const highlight = searchParams.get('highlight');
  
  if (highlight) {
    setHighlightedId(highlight);
    
    // Remove highlight parameter from URL without triggering navigation
    searchParams.delete('highlight');
    const newUrl = `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
    
    // Clear highlight after animation
    const timer = setTimeout(() => {
      setHighlightedId(null);
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [location.search]);

  const navigate = useNavigate();
  try {
    useEffect(() => {
      const fetchData = async () => {
        const response = await await apiService.get(
          "course-creator/getCourses/book",
          {}
        );
        const formattedBooks = response.data.map((course: any) => {
          const formatDate = (dateString: string) => {
            const options: Intl.DateTimeFormatOptions = {
              year: "numeric",
              month: "short",
              day: "2-digit",
            };
            return new Date(dateString).toLocaleDateString(undefined, options);
          };

          return {
            ID: course.course_id,
            "Course Title": course.course_title,
            Created: formatDate(course.createdAt),
            Updated: formatDate(course.updatedAt),
            Content: course.content,
          };
        });
        setBooks(formattedBooks);
      };
      fetchData();
    }, []);
  } catch (error) {
    console.log(error);
  }

  const addItem = () => {
    navigate("add");
  };

  const deleteItem = async (item: any) => {
    const bookId = item["ID"];
    const type = "book"; // or "book", determine dynamically if needed

    try {
      const response = await apiService.post(
        `course-creator/deleteCourse/${bookId}/${type}`,
        {}
      );

      if (response.success) {
        setBooks((prevBook) =>
          prevBook.filter((book) => book["ID"] !== bookId)
        );
        console.log(`Course ${bookId} deleted successfully.`);
      } else {
        console.error("Failed to delete course:", response.message);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  // Function to replace unsupported characters
  const replaceSpecialChars = (text: string) => {
    return text
      .replace(/≤/g, "<=")
      .replace(/≥/g, ">=")
      .replace(/±/g, "+-")
      .replace(/×/g, "x")
      .replace(/÷/g, "/");
  };

  // const downloadItem = async (item: any) => {
  //   const courseTitle: string = item["Course Title"];
  //   const chapters: string[] = item["Content"];

  //   // Create a new PDF document
  //   const pdfDoc = await PDFDocument.create();
  //   const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  //   const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  //   const pageWidth = 595;
  //   const pageHeight = 842;
  //   const margin = 50;
  //   const lineSpacing = 16;
  //   const maxWidth = pageWidth - 2 * margin;

  //   // Add Title Page
  //   // Add Title Page
  //   let page = pdfDoc.addPage([pageWidth, pageHeight]);
  //   const { height } = page.getSize();

  //   const titleText = replaceSpecialChars(courseTitle);
  //   let titleFontSize = 24; // Default font size
  //   let titleWidth = timesBoldFont.widthOfTextAtSize(titleText, titleFontSize);

  //   // Reduce font size if the title is too wide
  //   while (titleWidth > maxWidth && titleFontSize > 10) {
  //     titleFontSize -= 2;
  //     titleWidth = timesBoldFont.widthOfTextAtSize(titleText, titleFontSize);
  //   }

  //   // Center the title with the adjusted font size
  //   page.drawText(titleText, {
  //     x: (pageWidth - titleWidth) / 2,
  //     y: height / 2,
  //     size: titleFontSize,
  //     font: timesBoldFont,
  //     color: rgb(0, 0, 0),
  //   });

  //   // Process each chapter and add content to new pages
  //   for (const chapter of chapters) {
  //     const chapterHtml: any = marked.parse(chapter); // Convert Markdown to HTML
  //     const parser = new DOMParser();
  //     const doc = parser.parseFromString(chapterHtml, "text/html");

  //     page = pdfDoc.addPage([pageWidth, pageHeight]); // New page for each chapter
  //     let textY = height - margin; // Start position

  //     doc.body.childNodes.forEach((node) => {
  //       let font = timesRomanFont;
  //       let fontSize = 12;
  //       let text = "";

  //       if (node.nodeName === "H1") {
  //         font = timesBoldFont;
  //         fontSize = 20;
  //         text = node.textContent || "";
  //         textY -= 10;
  //       } else if (node.nodeName === "H2") {
  //         font = timesBoldFont;
  //         fontSize = 16;
  //         text = node.textContent || "";
  //       } else if (node.nodeName === "H3") {
  //         font = timesBoldFont;
  //         fontSize = 14;
  //         text = node.textContent || "";
  //       } else if (node.nodeName === "P") {
  //         font = timesRomanFont;
  //         fontSize = 12;
  //         text = node.textContent || "";
  //         textY -= 5;
  //       } else if (node.nodeName === "UL") {
  //         textY -= 5;
  //         node.childNodes.forEach((li) => {
  //           if (li.nodeName === "LI") {
  //             text = "• " + li.textContent;
  //             textY -= 2;
  //           }
  //         });
  //       }

  //       // ** Apply character replacement before rendering text **
  //       text = replaceSpecialChars(text);

  //       // ** Fix Newline Issue: Wrap Text Properly **
  //       if (text) {
  //         const lines = text.split("\n");
  //         lines.forEach((line) => {
  //           const words = line.split(" ");
  //           let currentLine = "";

  //           words.forEach((word) => {
  //             const newLine = currentLine + " " + word;
  //             if (font.widthOfTextAtSize(newLine, fontSize) > maxWidth) {
  //               page.drawText(currentLine.trim(), {
  //                 x: margin,
  //                 y: textY,
  //                 size: fontSize,
  //                 font,
  //                 color: rgb(0, 0, 0),
  //               });
  //               textY -= lineSpacing;

  //               if (textY < margin) {
  //                 page = pdfDoc.addPage([pageWidth, pageHeight]);
  //                 textY = height - margin;
  //               }

  //               currentLine = word;
  //             } else {
  //               currentLine = newLine;
  //             }
  //           });

  //           if (currentLine) {
  //             page.drawText(currentLine.trim(), {
  //               x: margin,
  //               y: textY,
  //               size: fontSize,
  //               font,
  //               color: rgb(0, 0, 0),
  //             });
  //             textY -= lineSpacing;
  //           }
  //         });

  //         textY -= lineSpacing;
  //       }
  //     });
  //   }

  //   // Save the PDF and trigger download
  //   const pdfBytes = await pdfDoc.save();
  //   const blob = new Blob([pdfBytes], { type: "application/pdf" });
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   const title = courseTitle.replace(/["'“”‘’]/g, "");
  //   link.download = `${title}.pdf`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  return (
    <>
      <GettingStarted
        button={false}
        title="Create a book with our AI"
        description=" What do you want your book to be about?
(don't worry, you can always change the content or name of your book later!)"
      />
      <div className="flex items-center py-8 w-full ">
        {/* <Stepper /> */}

        {loading ? (
        <div className="flex justify-center items-center w-full py-4">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-10 h-10 animate-spin"></div>
          <p className="ml-4">Loading...</p>
        </div>
      ) : (
        <Table
        data={books}
        headers={["ID", "Course Name", "Created", "Updated"]}
        isAdd={true}
        addItem={addItem}
        deleteItem={deleteItem}
        downloadItem={(row: any) => downloadItem(row, setLoading)}
        editItem={editItem}
        highlightedId={highlightedId}
        setData={handleBooks}
        pre={""}
      />
      )}
       
      </div>
    </>
  );
};

export default BookcreatorPage;
