const Tesseract = require('tesseract.js');

const extractAadhaarData = async (imageBuffer) => {
    try {
        // Run OCR
        const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
        
        // Extract DOB using Regex
        const dobRegex = /(?:DOB|Date of Birth|DOB:|YOB:)?[^\d]*(\d{2}\/\d{2}\/\d{4}|\d{4})/i;
        const match = text.match(dobRegex);
        
        let dob = null;
        if (match && match[1]) {
            const extractedDate = match[1];
            // Handle full DOB vs just Year of Birth
            dob = extractedDate.length === 4 ? `01/01/${extractedDate}` : extractedDate;
        }

        return { rawText: text, dob: dob };
    } catch (error) {
        console.error("OCR Processing Failed:", error);
        throw new Error("Failed to extract text from image");
    }
};

module.exports = { extractAadhaarData };