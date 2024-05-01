// api/saveAgentInputs.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { agentName, phoneNumber, lead, notes } = req.body;

            // Open the SQLite database connection
            const db = await open({
                filename: './data.db',
                driver: sqlite3.Database,
            });

            // Update the values for the specified agent in the Agents table
            await db.run(`UPDATE Agents SET PhoneNumber = ?, Lead = ?, Notes = ? WHERE AgentName = ?`, [phoneNumber, lead, notes, agentName]);

            res.status(200).json({ success: true, message: 'Agent inputs saved successfully.' });
        } catch (error) {
            console.error('Error saving agent inputs:', error);
            res.status(500).json({ success: false, message: 'Failed to save agent inputs.' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}
