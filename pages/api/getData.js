// pages/api/getData.js
import { google } from 'googleapis';

async function getSheetData(dot) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = 'Sheet1!A:Z';
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.error('No rows found in the sheet.');
      return null;
    }

    // Process headers – trim extra spaces.
    const headers = rows[0].map(header => header.trim());
    console.log('Headers:', headers);

    // Build an array of row objects.
    const dataObjects = rows.slice(1).map((row, rowIndex) => {
      const rowObj = {};
      headers.forEach((header, colIndex) => {
        const cellValue = (row[colIndex] || '').toString().trim();
        rowObj[header] = cellValue;
        console.log(`Row ${rowIndex + 2} - Header "${header}": [${cellValue}]`);
      });
      return rowObj;
    });
    console.log('Data objects:', dataObjects);

    // Normalize the query DOT by trimming.
    const targetDotString = dot.toString().trim();
    const targetDotNumber = Number(targetDotString);
    console.log('Target DOT as string:', `[${targetDotString}]`);
    console.log('Target DOT as number:', targetDotNumber);

    // First try to find a row by numeric comparison.
    let foundRow = dataObjects.find(row => Number(row.DOT) === targetDotNumber);

    // If numeric comparison doesn't work, fallback to exact string compare.
    if (!foundRow) {
      foundRow = dataObjects.find(row => row.DOT.trim() === targetDotString);
    }

    // Log comparisons for all rows.
    dataObjects.forEach((row, index) => {
      const sheetDot = row.DOT.trim();
      console.log(`Row ${index + 2} DOT: [${sheetDot}]`);
    });

    if (foundRow) {
      console.log('Match found:', foundRow);
    } else {
      console.log('No match found for DOT:', targetDotString);
    }
    return foundRow || null;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return null;
  }
}

export default async function handler(req, res) {
  const { dot } = req.query;
  if (!dot) {
    return res.status(400).json({ error: 'DOT query parameter is missing', row: null });
  }

  const foundRow = await getSheetData(dot);
  if (foundRow) {
    return res.status(200).json({ row: foundRow });
  } else {
    return res.status(404).json({ error: 'DOT number not found', row: null });
  }
}
