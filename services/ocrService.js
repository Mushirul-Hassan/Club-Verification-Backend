const Tesseract = require("tesseract.js");

const extractAadhaarData = async (imageBuffer) => {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(imageBuffer, "eng");

    let dob = null;
    let name = null;

    //  Split the raw text into an array of clean lines
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0); // Remove empty lines

    //  Loop through the lines to find the DOB
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Regex to check if THIS line contains the DOB
      const dobMatch = line.match(
        /(?:DOB|Date of Birth|DOB:|YOB:)?[^\d]*(\d{2}\/\d{2}\/\d{4}|\d{4})/i,
      );

      if (dobMatch && !dob) {
        const extractedDate = dobMatch[1];
        dob =
          extractedDate.length === 4 ? `01/01/${extractedDate}` : extractedDate;

        //  The DOB is found, Now look UP to find the name.
        if (i > 0) {
          const lineAbove1 = lines[i - 1]; // 1 line up
          const lineAbove2 = i > 1 ? lines[i - 2] : ""; // 2 lines up

         

          // Check if line 1 has at least 3 letters and isn't a random label
          if (
            /[a-zA-Z]{3,}/.test(lineAbove1) &&
            !/male|female|dob/i.test(lineAbove1)
          ) {
            name = lineAbove1;
          }
          // If line 1 was noise, fall back to line 2
          else if (/[a-zA-Z]{3,}/.test(lineAbove2)) {
            name = lineAbove2;
          }
        }
      }
    }

    return { rawText: text, dob: dob, name: name };
  } catch (error) {
    console.error("OCR Processing Failed:", error);
    throw new Error("Failed to extract text from image");
  }
};

module.exports = { extractAadhaarData };
