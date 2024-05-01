// pages/api/getData.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req, res) {
  try {
    // Open SQLite database
    const db = await open({
      filename: 'data.db',
      driver: sqlite3.Database,
    });

    // Query data from the database
    const data = await db.all('SELECT * FROM Proprietors');

    // Close the database connection
    await db.close();

    // Send the data as JSON response
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data from SQLite database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
