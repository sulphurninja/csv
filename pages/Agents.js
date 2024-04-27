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
                const response = await fetch('/agents.csv');
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
            const response = await fetch('/api/update-csv', {
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


    //    const downloadCsv = () => {
    //     // Extract specific fields from all filtered and sorted data
    //     const selectedData = removeDuplicates(data)
    //         .filter(row => {
    //             if (!searchTerm) return true;
    //             return Object.values(row).some(value =>
    //                 value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    //             );
    //         })
    //         .sort((a, b) => {
    //             if (!sortConfig) return 0;
    //             const aValue = a[sortConfig.key];
    //             const bValue = b[sortConfig.key];
    //             if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    //             if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    //             return 0;
    //         })
    //         .map(row => ({
    //             'Agent Name': row['Agent Name'],
    //             'Agent Address': row['Agent Address'],
    //             'Agent Code': row['Agent Code'],
    //             'Scraped Date': row['scraped_date'],
    //             'PhoneNumber': row['PhoneNumber'] || '',
    //             'Lead': row['Lead'] || '',
    //             'Notes': row['Notes'] || ''
    //         }));

    //     // Convert selectedData to CSV format
    //     const csvData = Papa.unparse(selectedData);

    //     // Create a Blob and initiate download
    //     const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    //     const link = document.createElement('a');
    //     if (link.download !== undefined) {
    //         const url = URL.createObjectURL(blob);
    //         link.setAttribute('href', url);
    //         link.setAttribute('download', 'selected_agents.csv');
    //         link.style.visibility = 'hidden';
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //     }
    // };
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
                <div className='flex mb-4 justify-center'>
                    <h1 className={`${inter.className}  font-bold text-center text-xl px-4 text-black mt-2 -300 rounded-md p-1 w-fit`}>Agent Data</h1>

                </div>
                <div className="flex justify-between mb-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="border  border-gray-300 rounded-xl px-3 py-2 mr-2 focus:outline-none "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button onClick={() => setSearchTerm('')} className="bg-black hover:bg-slate-900 -400  rounded -500 text-white">
                            Clear
                        </Button>
                    </div>

                    <select
                        className="border border-gray-300 rounded-xl px-3 py-2 ml-2 focus:outline-none focus:border-blue-500"
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
                                {Object.keys(data[0] || {}).map((header, index) => (
                                    <th
                                        key={index}
                                        className="py-1 text-sm px-4 font-semibold text-left cursor-pointer"
                                        onClick={() => requestSort(header)}
                                    >
                                        {header}
                                    </th>
                                ))}
                                <th>Save</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((row, rowIndex) => (
                                <tr key={rowIndex} className={isLatest(row) ? 'bg-yellow-200 ' : 'bg-[#FFFEFE]  text-black'}>

                                    {Object.keys(row).map((column, columnIndex) => (
                                        <td key={columnIndex} className={`${inter.className} py-1 px-4 text-xs border border-slate-400 `}>
                                            {column === 'PhoneNumber' || column === 'Lead' || column === 'Notes' ? (
                                                <input
                                                    type="text"
                                                    value={row[column]}
                                                    onChange={(e) => handleInputChange(e, rowIndex, column)}
                                                />
                                            ) : (
                                                row[column]
                                            )}
                                        </td>
                                    ))}
                                    <td>
                                        <Button className='bg-black rounded text-white mx-4' onClick={() => updateRow(rowIndex)}>Save</Button>
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
                    {/* <Button onClick={downloadCsv} className="bg-blue-500 text-white">
                        Download CSV
                    </Button> */}
                </div>
            </div>
        </main>
    );
}