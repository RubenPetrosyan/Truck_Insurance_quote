// pages/api/getData.js
import { google } from 'googleapis';

async function getSheetData(dot) {
  // Parse Service Account credentials from the environment variable.
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

  // Create a GoogleAuth instance with read-only scope.
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Ensure your spreadsheetId is set in the environment variables.
  const spreadsheetId = process.env.SPREADSHEET_ID;
  // Adjust this range to match your sheet name and columns.
  const range = 'Sheet1!A:Z';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return null;
    }

    // Assume first row holds headers.
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Map each row to an object using the headers.
    const dataObjects = dataRows.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    // Search for a row where the DOT matches exactly.
    return dataObjects.find((row) => row.DOT === dot) || null;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return null;
  }
}

export default async function handler(req, res) {
  const { dot } = req.query;

  if (!dot) {
    res.status(400).json({ error: 'DOT query parameter is missing', row: null });
    return;
  }

  const foundRow = await getSheetData(dot);

  if (!foundRow) {
    res.status(404).json({ error: 'DOT number not found', row: null });
  } else {
    res.status(200).json({ row: foundRow });
  }
}
