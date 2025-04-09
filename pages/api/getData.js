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

    // Use the first row as headers; trim each header.
    const headers = rows[0].map(header => header.trim());
    console.log('Headers found:', headers);

    // Map rows to objects, trimming each cell.
    const dataObjects = rows.slice(1).map((row, rowIndex) => {
      const rowObj = {};
      headers.forEach((header, colIndex) => {
        const cellValue = (row[colIndex] || '').toString().trim();
        rowObj[header] = cellValue;
        console.log(`Row ${rowIndex + 2} - Header "${header}": [${cellValue}]`);
      });
      return rowObj;
    });

    // Normalize the DOT value for comparison.
    const targetDot = dot.toString().trim().toLowerCase();
    console.log('Searching for DOT:', targetDot);

    // Check if header "DOT" exists
    if (!headers.includes('DOT')) {
      console.warn('Header "DOT" not found. Headers:', headers);
    }

    // Find a row where the DOT value (normalized) matches.
    const foundRow = dataObjects.find((row) => {
      return (row.DOT || '').toLowerCase() === targetDot;
    });

    if (foundRow) {
      console.log('Found row:', foundRow);
    } else {
      console.log(`No match found for DOT: ${targetDot}`);
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
