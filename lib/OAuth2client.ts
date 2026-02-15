import fs from "fs";
import { google } from "googleapis";
import readline from "readline";

const TOKEN_PATH = "token.json"; // stores OAuth token

// Load credentials
// const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
const credentials = JSON.parse(process.env.GOOGLE_OAUTH_CREDENTIALS || "{}");
const { client_secret, client_id } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost:3000");

// Function to get a new token interactively
async function getNewToken(oAuth2Client: any) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive"],
  });

  console.log("Authorize this app by visiting this URL:/n", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code: string = await new Promise((resolve) => {
    rl.question("Enter the code from that page here: ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  const tokenResponse = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokenResponse.tokens);

  // Store the token to disk for later
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenResponse.tokens, null, 2));
  console.log("✅ Token stored to", TOKEN_PATH);
}

// Initialize authentication

const GET_NEW_TOKEN = process.env.GOOGLE_GET_NEW_TOKEN === "true" || process.env.ENV !== "production";

export async function getDriveClient() {
  if (!GET_NEW_TOKEN) {
    const token = JSON.parse(process.env.GOOGLE_OAUTH_REFRESH_TOKEN || "{}");
    oAuth2Client.setCredentials(token);
  } else {
    await getNewToken(oAuth2Client);
  }
  return google.drive({ version: "v3", auth: oAuth2Client });
}
