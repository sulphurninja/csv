import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { DM_Sans } from 'next/font/google';

const inter = DM_Sans({ subsets: ['latin'] });

export default function Agents() {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/proprietors.csv');
                const reader = response.body.getReader();
                const result = await reader.read();
                const decoder = new TextDecoder('utf-8');
                const csv = decoder.decode(result.value);
                const parsedData = Papa.parse(csv, { header: true }).data;
                setData(parsedData);
            } catch (error) {
                console.error('Error fetching or parsing CSV file:', error.message);
            }
        };

        fetchData();
    }, []);



    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data
        .filter((row) => {
            if (!searchTerm) return true;
            return Object.values(row).some((value) =>
                value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        })
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        })
        .slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(
        data.filter((row) => {
            if (!searchTerm) return true;
            return Object.values(row).some((value) =>
                value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        }).length / itemsPerPage
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };



    const handleInputChange = (e, rowIndex, columnName) => {
        const newData = [...data];
        newData[rowIndex][columnName] = e.target.value;
        setData(newData);

    };

    // Inside your React component

    const saveDataToCSV = async (data) => {
        try {
            // Make a PUT request to the API route with the updated data
            const response = await fetch('/api/update-csv-pro', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data }),
            });

            if (response.ok) {
                console.log('CSV file updated successfully.');
            } else {
                console.error('Failed to update CSV file:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating CSV file:', error.message);
        }
    };

    const updateRow = (rowIndex) => {
        saveDataToCSV(data); // Save data to CSV after updating
    };

    const maxScrapedDate = Math.max(
        ...data
            .filter((row) => row.Scraped_Date) // Filter out rows where scraped_date is undefined
            .map((row) => {
                const dateParts = row.Scraped_Date.split('/').map(Number);
                console.log('dateParts:', dateParts); // Add this line for debugging
                const [day, month, year] = dateParts;
                return new Date(year, month - 1, day).getTime();
            })
    );

    // Check if the row's scraped_date matches the maximum scraped_date
    const isLatest = (row) => {
        if (!row.Scraped_Date) return false; // Handle cases where scraped_date is undefined
        const dateParts = row.Scraped_Date.split('/').map(Number);
        const rowDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).getTime();
        return rowDate === maxScrapedDate;
    };


    return (
        <main>
            <Navbar />
            <div class="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <div className="container mx-auto mt-12 p-4">
            <div className='flex justify-center'>
            <h1 className='font-bold text-center text-md px-4 bg-black text-white mt-2 -300 rounded-md p-1 w-fit'>Proprietors</h1>

            </div>
                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="border  border-gray-300 rounded px-3 py-2 mr-2 focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={() => setSearchTerm('')} className="bg-black -500 text-white">
                        Clear
                    </Button>
                    <select
                        className="border border-gray-300 rounded px-3 py-2 ml-2 focus:outline-none focus:border-blue-500"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-800 text-white">
                                <th className="py-1 text-sm px-4 font-semibold text-left cursor-pointer" onClick={() => requestSort('Agent Name')}>
                                    Proprietor Name
                                </th>
                                <th className="py-1 text-sm px-4 font-semibold text-left cursor-pointer" onClick={() => requestSort('Agent Address')}>
                                    Address
                                </th>
                                <th className="py-1 text-sm px-4 font-semibold text-left cursor-pointer" onClick={() => requestSort('Agent Code')}>
                                    Code
                                </th>
                                <th className="py-1 text-sm px-4 font-semibold  cursor-pointer" onClick={() => requestSort('scraped_date')}>
                                    Scraped_Date
                                </th>
                                <th className="py-1 text-sm px-4 font-semibold text-left cursor-pointer">
                                    PhoneNumber
                                </th>
                                <th className="py-1 text-sm px-4 font-semibold text-left cursor-pointer">
                                    Lead
                                </th>
                                <th className="py-1 text-sm px-4 font-semibold text-left cursor-pointer">
                                    Notes
                                </th>
                                <th className="py-1 text-sm px-4 font-semibold text-left cursor-pointer">
                                    Save
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((row, rowIndex) => (
                                <tr key={rowIndex} className={isLatest(row) ? 'bg-yellow-200' : (rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white')}>
                                    {Object.keys(row).map((column, columnIndex) => (
                                        <td key={columnIndex} className={`${inter.className} py-1 px-4 text-xs border border-slate-400 `}>
                                            {column === 'PhoneNumber' || column === 'Lead' || column === 'Notes' ? (
                                                <input
                                                    type="text"
                                                    className='py-2 px-2'
                                                    value={row[column]}
                                                    onChange={(e) => handleInputChange(e, rowIndex, column)}
                                                />
                                            ) : (
                                                row[column]
                                            )}
                                        </td>
                                    ))}
                                    <td>
                                        <Button className='bg-black text-white mx-4 rounded' onClick={() => updateRow(rowIndex)}>Save</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <div className="flex gap-4">
                        <Button onClick={() => paginate(1)} disabled={currentPage === 1}>
                            First
                        </Button>
                        <Button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                            Prev
                        </Button>
                        <Button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                            Next
                        </Button>
                        <Button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>
                            Last
                        </Button>
                    </div>
                    <div>
                        Page{' '}
                        <strong>
                            {currentPage} of {totalPages}
                        </strong>
                    </div>

                </div>
            </div>
        </main>
    );
}
