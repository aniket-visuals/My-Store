/**
 * Google Sheets Integration Service
 * Manages communicating with the Google Sheets API client-side.
 */

export interface SignupRow {
  name: string;
  email: string;
  date: string;
  provider: string;
}

/**
 * Creates a new spreadsheet titled "Editors Hub Signups" on Google Drive
 */
export async function createSpreadsheet(accessToken: string, title: string = "Editors Hub Signups"): Promise<{ id: string; url: string }> {
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title,
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || "Failed to create Google Spreadsheet");
  }

  const data = await response.json();
  const id = data.spreadsheetId;
  const url = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${id}/edit`;

  // Initialize the sheet with headers
  await initializeSheetHeaders(accessToken, id);

  return { id, url };
}

/**
 * Writes the header row to the Google Sheet if it's empty or newly created
 */
export async function initializeSheetHeaders(accessToken: string, spreadsheetId: string): Promise<void> {
  const headers = [["Name", "Email", "Signup Date", "Auth Provider"]];
  const range = "Sheet1!A1:D1";

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: headers,
      }),
    }
  );
}

/**
 * Appends a new user registration to the active spreadsheet
 */
export async function appendSignupRow(
  accessToken: string,
  spreadsheetId: string,
  signup: SignupRow
): Promise<any> {
  const range = "Sheet1!A:D";
  const row = [[signup.name, signup.email, signup.date, signup.provider]];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: row,
      }),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || "Failed to append signup row to Google Sheet");
  }

  return await response.json();
}
