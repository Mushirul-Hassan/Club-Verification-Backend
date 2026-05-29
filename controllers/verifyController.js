const { extractAadhaarData } = require('../services/ocrService');
const { calculateAge, checkClubEligibility } = require('../utils/ageUtil');

const processVerification = async (req, res) => {
    try {
        //  Validate files
        if (!req.files || !req.files['aadhaarImage'] || !req.files['selfieImage']) {
            return res.status(400).json({ error: "Both Aadhaar and Selfie images are required." });
        }

        const aadhaarFile = req.files['aadhaarImage'][0];
        const selfieFile = req.files['selfieImage'][0];

        //  Delegate OCR processing to the service
        const { rawText, dob, name } = await extractAadhaarData(aadhaarFile.buffer);
        
        //  Delegate math to the utility
        const age = calculateAge(dob);

        //  Determine Club Admission Status
        const admissionStatus = checkClubEligibility(age);

        //  Format Base64 strings
        const aadhaarBase64 = `data:${aadhaarFile.mimetype};base64,${aadhaarFile.buffer.toString('base64')}`;
        const selfieBase64 = `data:${selfieFile.mimetype};base64,${selfieFile.buffer.toString('base64')}`;

        //  Send Response
        return res.status(200).json({
            success: true,
            admission: {
                isAllowed: admissionStatus.eligible,   // true if 18+, false if underage or failed OCR
                status: admissionStatus.status,       // "ALLOWED", "DENIED", or "REQUIRES_MANUAL_OVERRIDE"
                reason: admissionStatus.status === "DENIED" ? "Underage" : (admissionStatus.status === "ALLOWED" ? "Verified 18+" : "OCR could not determine DOB")
            },
            extractedData: {
                rawTextFound: rawText.substring(0, 50) + "...", 
                name: name || "Not Found",
                dob: dob,
                calculatedAge: age
            },
            images: {
                aadhaar: aadhaarBase64,
                selfie: selfieBase64
            }
        });

    } catch (error) {
        return res.status(500).json({ error: "Internal server error during verification." });
    }
};

module.exports = { processVerification };