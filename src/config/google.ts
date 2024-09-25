import * as dotenv from 'dotenv';
dotenv.config();

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  // 'https://www.googleapis.com/auth/drive.metadata.readonly',
  // 'https://www.googleapis.com/auth/drive.appdata',
  // 'https://www.googleapis.com/auth/drive',
  // 'https://www.googleapis.com/auth/spreadsheets',
  // 'https://www.googleapis.com/auth/drive',
  // 'https://www.googleapis.com/auth/drive.appdata',
  // 'https://www.googleapis.com/auth/drive.metadata.readonly',
];
export const AUTH = {
  client_id: process.env.DRIVE_CLIENT_ID,
  project_id: process.env.DRIVE_PROJECT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_secret: process.env.DRIVE_CLIENT_SECRET,
  redirect_uris: [process.env.DRIVE_REDIRECT],
};
