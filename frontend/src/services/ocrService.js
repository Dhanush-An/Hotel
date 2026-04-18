import Tesseract from 'tesseract.js';

/**
 * Verhoeff Algorithm for Aadhar Checksum Validation
 */
const verhoeffTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];
const pTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];
const invTable = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

const validateAadhar = (aadhar) => {
    if (aadhar.length !== 12) return false;
    let c = 0;
    const reversed = aadhar.split('').reverse().map(Number);
    for (let i = 0; i < reversed.length; i++) {
        c = verhoeffTable[c][pTable[i % 8][reversed[i]]];
    }
    return c === 0;
};

/**
 * Simple image preprocessing to improve OCR accuracy
 */
const preprocessImage = async (imageSrc, threshold = 128) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const val = avg > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = val;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
  });
};

/**
 * Corrects common OCR misreads of digits
 */
const correctDigits = (str) => {
  return str.replace(/O/g, '0')
            .replace(/[IBILl]/g, '1')
            .replace(/S/g, '5')
            .replace(/B/g, '8')
            .replace(/G/g, '6')
            .replace(/Z/g, '2')
            .replace(/T/g, '7')
            .replace(/#/g, '');
};

/**
 * Extracts Aadhar details from text using regex
 */
export const extractAadharDetails = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  let details = { name: '', dob: '', documentNo: '' };

  // 1. Extract Aadhar Number (Comprehensive Search)
  // Look for 12 digits, potentially with spaces, or 8 digits (some cards show part)
  const rawCandidates = text.match(/([0-9OBISLTGZ]{4}\s?[0-9OBISLTGZ]{4}\s?[0-9OBISLTGZ]{4}|[0-9OBISLTGZ]{12})/gi);
  if (rawCandidates) {
    for (const cand of rawCandidates) {
      const corrected = correctDigits(cand.toUpperCase().replace(/\s/g, ''));
      if (corrected.length === 12 && validateAadhar(corrected)) {
        details.documentNo = corrected;
        break;
      }
    }
  }

  // 2. Extract DOB (Support / - . and Year only)
  const dobRegex = /(?:DOB|Birth|Birth:?|Year of Birth):?\s*(\d{2}[:\-\/\.\s]\d{2}[:\-\/\.\s]\d{4}|\d{4})/i;
  const dobMatch = text.match(dobRegex);
  if (dobMatch) {
    let rawDob = dobMatch[1].replace(/[:\-\. ]/g, '/');
    if (rawDob.length === 10) {
      const parts = rawDob.split('/');
      const [d, m, y] = parts;
      if (parseInt(y) > 1900 && parseInt(y) < new Date().getFullYear()) {
        details.dob = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    } else if (rawDob.length === 4) {
      details.dob = `${rawDob}-01-01`;
    }
  }

  // 3. Extract Name (Multi-Strategy)
  const excludeKeywords = [
    'GOVERNMENT', 'INDIA', 'AADHAAR', 'FATHER', 'HUSBAND', 'MALE', 'FEMALE', 
    'UNIQUE', 'IDENTIFICATION', 'ENROLMENT', 'AUTHORITY', 'HOD', 'EEE', 'DEPT',
    'COLLEGE', 'UNIVERSITY', 'OFFICE', 'ADDRESS', 'VIDVID', 'PHONE', 'HELP', 'WWW'
  ];
  
  // Strategy A: Explicit line above DOB
  const dobLineIdx = lines.findIndex(l => /DOB|Birth|Year/i.test(l));
  if (dobLineIdx > 0) {
     const potential = lines[dobLineIdx-1].replace(/[^A-Za-z ]/g, '').trim();
     if (potential.length > 5 && potential.split(' ').length >= 2 && !excludeKeywords.some(k => potential.toUpperCase().includes(k))) {
        details.name = potential.toUpperCase();
     }
  }

  // Strategy B: General scan if A failed
  if (!details.name) {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].replace(/[^A-Za-z ]/g, '').trim();
        if (line.length < 5) continue;
        const words = line.split(/\s+/);
        if (words.length < 2 || words.length > 5) continue;
        const upLine = line.toUpperCase();
        if (excludeKeywords.some(k => upLine.includes(k))) continue;
        if (/^[A-Z ]+$/.test(upLine)) {
          details.name = upLine;
          break; 
        }
    }
  }

  return details;
};

/**
 * Main OCR function
 */
export const performOCR = async (imageSrc, isAddress = false) => {
  let finalResult = { name: '', dob: '', documentNo: '', address: '' };

  try {
    // Stage 1: Try with standard preprocessing
    const pImg = await preprocessImage(imageSrc, 128);
    const { data: { text: text1 } } = await Tesseract.recognize(pImg, 'eng+hin');
    let res = isAddress ? { address: text1 } : extractAadharDetails(text1);
    
    // Stage 2: Fallback to original if data missing
    if (!isAddress && (!res.documentNo || !res.name)) {
       const { data: { text: text2 } } = await Tesseract.recognize(imageSrc, 'eng+hin');
       const res2 = extractAadharDetails(text2);
       // Merge results, prioritizing original image for missing fields
       res.documentNo = res.documentNo || res2.documentNo;
       res.name = res.name || res2.name;
       res.dob = res.dob || res2.dob;
    }

    if (isAddress) {
      const addressMatch = res.address.match(/(?:Address|Add):?\s*([\s\S]+?)(?:\d{6}|$)/i);
      if (addressMatch) {
         finalResult.address = addressMatch[1].replace(/\n/g, ' ').trim();
      } else {
         const lines = res.address.split('\n');
         finalResult.address = lines.slice(-5).join(' ').trim();
      }
    } else {
      finalResult = res;
    }

    return finalResult;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};
