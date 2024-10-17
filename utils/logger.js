import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the log file where user details will be stored
const logFilePath = path.join(__dirname, '../logs/user_data_log.json');

// Function to log user data to the log file
export const logUserDetails = (userData) => {
    const logEntry = {
        ...userData,
        timestamp: new Date().toISOString() // Add a timestamp
    };

    // Check if the log file exists; if not, create it with an empty array
    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, JSON.stringify([]));
    }

    // Read the current contents of the log file
    let existingLogs;
    try {
        const fileContents = fs.readFileSync(logFilePath, 'utf-8');
        existingLogs = fileContents ? JSON.parse(fileContents) : [];
    } catch (error) {
        console.error('Error reading or parsing log file:', error);
        existingLogs = [];
    }

    // Append the new log entry
    existingLogs.push(logEntry);

    // Write the updated log file
    fs.writeFileSync(logFilePath, JSON.stringify(existingLogs, null, 2)); // Pretty print JSON
};
