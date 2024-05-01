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

      // Create or update Agents table with additional columns
      await db.run(`CREATE TABLE IF NOT EXISTS Agents (
        AgentCode TEXT,
        AgentName TEXT,
        AgentAddress TEXT,
        PhoneNumber TEXT,
        Lead TEXT,
        Notes TEXT,
        scraped_date TEXT,
        PRIMARY KEY (AgentName)
      )`);

      // Merge data from MainData into Agents table
      await db.run(`
        INSERT OR REPLACE INTO Agents (
          AgentCode, 
          AgentName, 
          AgentAddress, 
          PhoneNumber, 
          Lead, 
          Notes, 
          scraped_date
        )
        SELECT 
          "Agent Code", 
          "Agent Name", 
          "Agent Address", 
          null, 
          null, 
          null, 
          scraped_date
        FROM MainData
        UNION
        SELECT 
          "Agent Code", 
          "Opponent Agent Name" AS AgentName, 
          "Opponent Agent Address" AS AgentAddress, 
          null, 
          null, 
          null, 
          scraped_date
        FROM MainData
        WHERE NOT EXISTS (
          SELECT 1 FROM Agents WHERE Agents.AgentName = "Opponent Agent Name"
        )
      `);

      res.status(200).json({ success: true, message: 'Agents table updated successfully.' });
    } catch (error) {
      console.error('Error updating Agents table:', error);
      res.status(500).json({ success: false, message: 'Failed to update Agents table.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
