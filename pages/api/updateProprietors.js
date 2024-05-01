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

            // Create or update Proprietors table with additional columns
            await db.run(`CREATE TABLE IF NOT EXISTS Proprietors (
        ProprietorCode TEXT,
        ProprietorName TEXT,
        ProprietorAddress TEXT,
        PhoneNumber TEXT,
        Lead TEXT,
        Notes TEXT,
        scraped_date TEXT,
        PRIMARY KEY (ProprietorName)
      )`);

            // Merge data from MainData into Proprietors table
            await db.run(`
        INSERT OR REPLACE INTO Proprietors (
         ProprietorCode, 
         ProprietorName, 
         ProprietorAddress, 
          PhoneNumber, 
          Lead, 
          Notes, 
          scraped_date
        )
        SELECT 
          "Proprietor Code", 
          "Proprietor Name", 
          "Proprietor Address", 
          null, 
          null, 
          null, 
          scraped_date
        FROM MainData
        UNION
        SELECT 
          "Opponent Code" AS ProprietorCode,
          "Opponent Name" AS ProprietorName, 
          "Opponent Address" AS ProprietorAddress, 
          null, 
          null, 
          null, 
          scraped_date
        FROM MainData
        WHERE NOT EXISTS (
          SELECT 1 FROM Proprietors WHERE Proprietors.ProprietorName = "Opponent Name"
        )
      `);

            res.status(200).json({ success: true, message: 'Proprietor table updated successfully.' });
        } catch (error) {
            console.error('Error updating Proprietors table:', error);
            res.status(500).json({ success: false, message: 'Failed to update Proprietor table.' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}
