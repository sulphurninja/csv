// pages/api/loadData.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // Open SQLite database
    const db = await open({
      filename: 'data.db',
      driver: sqlite3.Database,
    });

    // Path to the CSV file
    const csvFilePath = path.join(process.cwd(), 'public', 'maindata.csv');

    // Read CSV file
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');

    // Parse CSV data
    const { data: csvRows, meta: { fields } } = Papa.parse(csvData, { header: true });

    // Create table if not exists
    const columns = fields.map(field => `"${field}" TEXT`).join(', ');
    await db.exec(`CREATE TABLE IF NOT EXISTS MainData (${columns})`);

    // Insert data into table
    await Promise.all(
      csvRows.map(async (row) => {
        const values = fields.map(field => row[field]);
        await db.run(`INSERT INTO MainData (${fields.map(field => `"${field}"`).join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, values);
      })
    );

    // Close the database connection
    await db.close();

    res.status(200).json({ message: 'CSV data loaded successfully into SQLite table.' });
  } catch (error) {
    console.error('Error loading CSV data into SQLite table:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
