import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Open the SQLite database connection
      const db = await open({
        filename: 'data.db',
        driver: sqlite3.Database,
      });

      // Construct the query to delete rows with all blank values
      const columns = Object.keys(req.body);
      const conditions = columns.map(column => `${column} = ''`).join(' AND ');
      await db.run(`DELETE FROM MainData WHERE ${conditions}`);

      res.status(200).json({ success: true, message: 'Rows with all blank values successfully deleted from the database.' });
    } catch (error) {
      console.error('Error deleting rows with all blank values from the database:', error);
      res.status(500).json({ success: false, message: 'Failed to delete rows with all blank values from the database.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
