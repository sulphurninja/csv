import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Retrieve new entries from the request body
      const { newEntries } = req.body;

      // Ensure new entries exist and is an array
      if (!newEntries || !Array.isArray(newEntries)) {
        return res.status(400).json({ error: 'Invalid new entries format' });
      }

      // Convert new entries to CSV format without headers
      const csvData = Papa.unparse(newEntries, { header: false });

      // Append new entries to the CSV file
      await appendToCSV(csvData);

      res.status(200).json({ message: 'CSV file updated successfully' });
    } catch (error) {
      console.error('Error appending new entries to CSV file:', error);
      res.status(500).json({ error: 'Failed to update CSV file' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

async function appendToCSV(csvData) {
    const csvFilePath = path.resolve('public', 'maindata.csv');
  
    return new Promise((resolve, reject) => {
      // Check if the file exists
      fs.stat(csvFilePath, (err, stats) => {
        if (err) {
          // File doesn't exist, write data without headers
          fs.writeFile(csvFilePath, csvData + '\n', (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          // File exists, append data excluding the first line (headers)
          const lines = csvData.trim(); // Remove any leading/trailing whitespace
          fs.appendFile(csvFilePath, lines + '\n', (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }
  