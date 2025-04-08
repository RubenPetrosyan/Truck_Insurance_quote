import { google } from 'googleapis';

export default async function handler(req, res) {
  const { dot } = req.query;
  console.log("Incoming dot query:", dot);

  if (!dot) {
    return res.status(400).json({ error: 'Missing DOT query parameter.' });
  }

  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  } catch (err) {
    console.error("❌ Failed to parse service account credentials:", err.message);
    return res.status(500).json({ error: 'Invalid service account credentials format.' });
  }

  let authClient;
  try {
    authClient = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  } catch (err) {
    console.error("❌ GoogleAuth setup error:", err.message);
    return res.status(500).json({ error: 'Failed to initialize Google Auth.' });
  }

  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const spreadsheetId = '1_HsGOVbbsDPb30eCExyN5gedVFq3dLrU0ItmV5wasfc';
  const range = 'Sheet1!A:Z';

  try {
    const result = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = result.data.values;

    if (!rows || rows.length < 2) {
      console.warn("⚠️ No data rows found.");
      return res.status(404).json({ error: 'No data found in the spreadsheet.' });
    }

    const headers = rows[0];
    const dataRows = rows.slice(1).map((row) => {
      const rowObj = {};
      headers.forEach((header, idx) => {
        rowObj[header] = row[idx] || '';
      });
      return rowObj;
    });

    const match = dataRows.find(row => row.DOT === dot);
    console.log("✅ Match found:", match);

    if (!match) {
      return res.status(404).json({ error: `No data found for DOT: ${dot}` });
    }

    return res.status(200).json({ row: match });
  } catch (err) {
    console.error("❌ Error fetching data from Google Sheets:", err.message);
    return res.status(500).json({ error: 'Error accessing Google Sheets API.' });
  }
}
