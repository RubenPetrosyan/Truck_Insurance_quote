import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { DOT, ...updates } = req.body;
  if (!DOT) return res.status(400).json({ error: 'Missing DOT' });

  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  } catch {
    return res.status(500).json({ error: 'Invalid credentials JSON' });
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const spreadsheetId = '1_HsGOVbbsDPb30eCExyN5gedVFq3dLrU0ItmV5wasfc';
  const range = 'Sheet1!A:Z'; // change if needed

  try {
    const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = data.values || [];
    if (rows.length < 2) return res.status(404).json({ error: 'No data' });

    const headers = rows[0];
    const dotIndex = headers.indexOf('DOT');
    const rowIndex = rows.findIndex(r => (r[dotIndex] || '').trim() === DOT.trim());
    if (rowIndex < 1) return res.status(404).json({ error: 'DOT not found' });

    const updatedRow = [...rows[rowIndex]];
    headers.forEach((h, i) => {
      if (h.trim() in updates) updatedRow[i] = updates[h.trim()];
    });

    const updateRange = `Sheet1!A${rowIndex + 1}:Z${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] },
    });

    res.status(200).json({ message: 'Data updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
