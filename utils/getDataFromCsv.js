// utils/csv.js
import csvParser from 'csv-parser';

export async function parseCSV(csvData) {
  const data = [];
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = csvParser();

    stream.on('data', (data) => results.push(data));
    stream.on('end', () => resolve(results));
    stream.on('error', (error) => reject(error));

    stream.write(csvData);
    stream.end();
  });
}
