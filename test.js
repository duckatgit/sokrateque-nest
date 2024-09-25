'On the electrodynamics of moving bodies by Albert Einstein';
'Reconstruction of the Apollo 11 Moon Landing Final Descent Trajectory - NASA';
async function listFilesWithPagination(userId, offset) {
  try {
    const token = await this.userService.getDriveTokens(userId);
    this.oAuth2Client.setCredentials(token);
    const drive = google.drive({ version: 'v3', auth: this.oAuth2Client });

    // Calculate the page size (number of files per page)
    const pageSize = 50;
    const pageToken = offset > 1 ? (offset - 1) * pageSize : undefined;

    // Request files with pagination
    const response = await drive.files.list({
      pageSize,
      pageToken,
      fields:
        'nextPageToken, files(webContentLink, webViewLink, thumbnailLink, id, name, mimeType)',
    });

    const files = response.data.files;
    return files;
  } catch (error) {
    console.error('Error listing files:', error.message);
    return error;
  }
}

// Example usage:
const userId = 'your_user_id'; // Replace with actual user ID
const offset = 2; // Change the offset as needed (1 for the first 50, 2 for the next 50, and so on)
const fileList = await listFilesWithPagination(userId, offset);
console.log(fileList);
