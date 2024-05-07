import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { DM_Sans } from 'next/font/google';
import Papa from 'papaparse'
import Pagination from '@/components/Pagination';

const inter = DM_Sans({ subsets: ['latin'] });

export default function Home() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getData');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const parsed = Papa.parse(text, { header: true }).data;

        // Filter out entries from parsed data that already exist in the current data
        const uniqueEntries = parsed.filter(newEntry => {
          // Filter out entries with empty Opposition Number or missing values
          if (!newEntry["Opposition Number"] || Object.values(newEntry).some(value => !value)) {
            return false;
          }
          // Check if the Opposition Number already exists in the current data
          return !data.some(existingEntry => existingEntry["Opposition Number"] === newEntry["Opposition Number"]);
        });

        // Send unique entries to the server for insertion
        try {
          const response = await fetch('/api/insertData', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newEntries: uniqueEntries }),
          });
          if (response.ok) {
            console.log('Entries appended to the database successfully.');

            // Call the API endpoint to update the Agents table
            await fetch('/api/updateAgents', {
              method: 'POST', // Specify the method as POST
            })
            // Call the API endpoint to update the Agents table
            await fetch('/api/updateProprietors', {
              method: 'POST', // Specify the method as POST
            })
          } else {
            console.error('Failed to append entries to the database.');
          }
        } catch (error) {
          console.error('Error appending entries to the database:', error.message);
        }
      };
      reader.readAsText(file);
    }
  };


// Pagination logic
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = data
  .filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()));
  })
  .sort((a, b) => {
    // Define a custom sorting function to prioritize the latest scraped date
    const customSort = () => {
      // Check if the "scraped_date" exists in both rows
      if (a.scraped_date && b.scraped_date) {
        // Convert dates to the appropriate format and compare them
        const dateA = new Date(a.scraped_date.trim().split('/').reverse().join('-'));
        const dateB = new Date(b.scraped_date.trim().split('/').reverse().join('-'));
        // Sort in descending order based on dates
        return dateB - dateA;
      }
      // If either of the dates is missing, retain the current order
      return 0;
    };

    // Apply the custom sorting function
    const customSortResult = customSort();

    // If custom sorting yields a result, return it; otherwise, resort to regular sorting
    return customSortResult !== 0 ? customSortResult : (
      sortConfig && sortConfig.key ?
        // If there is a sorting configuration (based on column header), apply regular sorting
        (a[sortConfig.key] < b[sortConfig.key] ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1) :
        0
    );
  })
  .slice(indexOfFirstItem, indexOfLastItem);


  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };


  const downloadCSV = async () => {
    try {
      const response = await fetch('/maindata.csv');
      const csvData = await response.text();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'maindata.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Your browser does not support downloading CSV files.');
      }
    } catch (error) {
      console.error('Error downloading CSV file:', error.message);
      alert('Failed to download CSV file.');
    }
  };

  // Function to determine if a row has the latest scraped date
  const isLatestScrapedDate = (row, data) => {
    // Filter out rows with null scraped_date or where scraped_date is not defined
    const validDates = data.filter(item => item.scraped_date && item.scraped_date.trim() !== '');

    // If there are no valid dates, return false
    if (validDates.length === 0) return false;

    // Find the maximum date among valid dates
    const maxDate = Math.max(...validDates.map(item => new Date(item.scraped_date.trim().split('/').reverse().join('-')).getTime()));

    // If row's scraped_date is not defined or null, return false
    if (!row.scraped_date || row.scraped_date.trim() === '') return false;

    // Convert the row's scraped_date to Date and compare with maxDate
    return new Date(row.scraped_date.trim().split('/').reverse().join('-')).getTime() === maxDate;
};





  return (
    <main>
      <Navbar />
      <div class="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="container mx-auto mt-12 p-4">
        <div className='flex mb-4 justify-center'>
          <h1 className={`${inter.className}  font-bold text-center text-xl px-4 text-black mt-2 -300 rounded-md p-1 w-fit`}>Main Data ({data.length})</h1>
        </div>
        <div className="flex justify-between mb-4">
          <div>
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-xl px-3 py-2 mr-2 focus:outline-none"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button className="bg-black hover:bg-slate-900 -400  rounded -500 text-white">
              Clear
            </Button>

          </div>

          <div className='flex gap-2 '>
            <div className="flex gap-2">
              <select
                className="border border-gray-300 rounded-xl px-3 py-2 ml-2 focus:outline-none focus:border-blue-500"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={500}>500 per page</option>
                <option value={1000}>1000 per page</option>
              </select>
              {/* Add sorting UI here */}
            </div>
            <div className="">
              <div
                className="border bg-white flex mt-auto gap-2 text-black rounded border-black  hover:bg-[#1D6B40] hover:text-white    px-4 py-2 cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <img src='/excel.png' className='h-6' />
                Upload CSV File
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="">
              <tr className="bg-black -800 text-white">
                {Object.keys(data[0] || {}).map((header, index) => (
                  <th
                    key={index}
                    className="py-1 text-sm px-4 font-semibold text-left cursor-pointer"
                    onClick={() => requestSort(header)}
                  >
                    {header}
                    {sortConfig && sortConfig.key === header && (
                      <span>{sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, rowIndex) => (
                <tr key={rowIndex} className={`text-black ${isLatestScrapedDate(row, data) ? 'bg-yellow-200' : 'bg-[#FFFEFE]'}`}>
                  {Object.values(row).map((value, valueIndex) => (
                    <td key={valueIndex} className={`${inter.className} py-1 px-4 text-xs border border-slate-400`}>
                      {value && value.toString()} {/* Ensure value is not null or undefined before calling toString() */}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
          <Button className='bg-slate-950 hover:bg-slate-700 text-white ' onClick={downloadCSV} >Download CSV</Button>
        </div>
      </div>
    </main>
  );
}
