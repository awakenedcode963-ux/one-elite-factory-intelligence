export async function appendToSheet(accessToken: string, spreadsheetId: string, range: string, values: any[][]) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Google Sheets API Error:', errorData);
    throw new Error('Failed to append to Google Sheets');
  }

  return await response.json();
}
