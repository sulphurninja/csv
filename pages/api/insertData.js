// pages/api/insertData.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { newEntries } = req.body;

        try {
            // Open the SQLite database connection
            const db = await open({
                filename: './data.db',
                driver: sqlite3.Database,
            });

            // Begin a transaction
            await db.exec('BEGIN');

            // Insert unique entries into the MainData table
            // Insert unique entries into the MainData table
            for (const entry of newEntries) {
                // Filter out blank entries
                const nonEmptyValues = Object.values(entry).filter(value => value !== '');

                // Check if the entry has any non-empty values
                if (nonEmptyValues.length > 0) {
                    const columns = Object.keys(entry);
                    const values = Object.values(entry);
                    const placeholders = Array(nonEmptyValues.length).fill('?').join(',');

                    // Construct the SQL query dynamically
                    const query = `INSERT INTO MainData (${columns.map(column => `"${column}"`).join(', ')}) VALUES (${placeholders})`;


                    // Execute the query with non-empty values
                    await db.run(query, nonEmptyValues);
                }
            }


            // Commit the transaction
            await db.exec('COMMIT');

            res.status(200).json({ success: true, message: 'Entries successfully appended to the database.' });
        } catch (error) {
            console.error('Error appending entries to the database:', error);
            res.status(500).json({ success: false, message: 'Failed to append entries to the database.' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}
