const multer = require('multer');
const pdfParse = require('pdf-parse');
const { analyzeResume } = require('../utils/openai');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

exports.uploadMiddleware = upload.single('resume');

exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }
    const data = await pdfParse(req.file.buffer);
    const resumeText = data.text;
    
    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Please ensure it\'s not a scanned image.' });
    }

    const analysis = await analyzeResume(resumeText);
    res.json({ success: true, analysis, textLength: resumeText.length });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
