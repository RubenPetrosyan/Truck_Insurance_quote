import { google } from 'googleapis';

export default async function handler(req, res) {
  const { dot } = req.query;
  if (!dot) return res.status(400).json({ error: 'Missing DOT' });

  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  } catch (e) {
    return res.status(500).json({ error: 'Invalid credentials JSON' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const spreadsheetId = '1_HsGOVbbsDPb30eCExyN5gedVFq3dLrU0ItmV5wasfc';
    const range = 'Sheet1!A:Z'; // update if your actual sheet tab is different

    const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = data.values || [];
    if (rows.length < 2)
      return res.status(404).json({ error: 'No data', row: null });

    const headers = rows[0].map(h => h.trim());
    const parsed = rows.slice(1).map(r => {
      let obj = {};
      headers.forEach((h, i) => {
        obj[h] = (r[i] || '').trim();
      });
      return obj;
    });

    const match = parsed.find(r => r.DOT === dot.trim());
    if (!match)
      return res.status(404).json({ error: 'DOT not found', row: null });

    res.status(200).json({ row: match });
  } catch (err) {
    res.status(500).json({ error: err.message, row: null });
  }
}
