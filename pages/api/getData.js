// pages/api/getData.js
import { google } from 'googleapis';

async function getSheetData(dot) {
  try {
    // Parse Service Account credentials from the environment variable.
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

    // Create GoogleAuth instance with read-only scope.
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get spreadsheet ID from environment variable and adjust range if needed.
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = 'Sheet1!A:Z';

    // Fetch the data from the sheet.
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.error('No rows found in the sheet.');
      return null;
    }

    // Use the first row as headers.
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Map rows to objects, trimming values.
    const dataObjects = dataRows.map((row) => {
      const rowObj = {};
      headers.forEach((header, index) => {
        rowObj[header] = (row[index] || '').toString().trim();
      });
      return rowObj;
    });

    // Debug log: see all rows fetched.
    console.log('Data objects retrieved:', dataObjects);

    // Trim the query dot and search for an exact match.
    const targetDot = dot.toString().trim();
    const foundRow = dataObjects.find((row) => row.DOT === targetDot);

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
