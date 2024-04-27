// pages/api/update-csv.js

import Papa from 'papaparse';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      // Assuming the CSV file is stored in a folder named "data" in the root directory
      const csvFilePath = '../leads/public/proprietors.csv';

      // Retrieve data from the request body
      const { data } = req.body;

      // Convert data to CSV format
      const csvData = Papa.unparse(data);

      // Write the updated CSV data to the file
      require('fs').writeFileSync(csvFilePath, csvData);

      res.status(200).json({ message: 'CSV file updated successfully' });
    } catch (error) {
      console.error('Error updating CSV file:', error.message);
      res.status(500).json({ error: 'Failed to update CSV file' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
