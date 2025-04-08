import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' });

  const { DOT, ...updates } = req.body;
  if (!DOT) return res.status(400).json({ error: 'Missing DOT identifier.' });

  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  } catch (err) {
    return res.status(500).json({ error: 'Credentials format error.' });
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const spreadsheetId = '1_HsGOVbbsDPb30eCExyN5gedVFq3dLrU0ItmV5wasfc';
  const range = 'Sheet1!A:Z';

  // Fetch all rows to locate the matching row index by DOT
  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = data.values;
  if (!rows || rows.length < 2)
    return res.status(404).json({ error: 'No data found.' });

  const headers = rows[0];
  const dotIndex = headers.indexOf('DOT');
  const rowIndex = rows.findIndex(row => row[dotIndex] === DOT);
  if (rowIndex === -1)
    return res.status(404).json({ error: 'Client not found.' });

  // Update row data based on headers mapping
  const updatedRow = rows[rowIndex].slice();
  headers.forEach((header, i) => {
    if (updates[header] !== undefined) {
      updatedRow[i] = updates[header];
    }
  });

  const updateRange = `Sheet1!A${rowIndex+1}:Z${rowIndex+1}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: updateRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [updatedRow] },
  });

  return res.status(200).json({ message: 'Client updated successfully.' });
}