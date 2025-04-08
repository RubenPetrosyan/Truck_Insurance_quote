const { google } = require('googleapis');

export default async function handler(req, res) {
  const { dot } = req.query;

  if (!dot) {
    return res.status(400).json({ error: 'Missing dot query parameter' });
  }

  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  } catch (error) {
    console.error("Error parsing service account credentials:", error);
    return res.status(500).json({ error: 'Service account credentials not set properly' });
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Replace with your actual spreadsheet ID
  const spreadsheetId = '1_HsGOVbbsDPb30eCExyN5gedVFq3dLrU0ItmV5wasfc';
  const range = 'Sheet1!A:Z'; // Adjust the range if needed

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const rows = result.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No data found.' });
    }

    // Assume the first row contains headers
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = row[index] || '';
      });
      return rowObject;
    });

    // Use the DOT column as the unique identifier
    const rowData = data.find(row => row.DOT === dot);
    if (!rowData) {
      return res.status(404).json({ error: `No data found for DOT: ${dot}` });
    }

    return res.status(200).json({ row: rowData });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    return res.status(500).json({ error: 'Error fetching data from Google Sheets' });
  }
}
