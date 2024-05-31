import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { DM_Sans } from 'next/font/google';
import Papa from 'papaparse'
import Pagination from '@/components/Pagination';
import { Toaster, toast } from 'sonner';

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
                const response = await fetch('/api/getProprietorData');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);


    const handleInputChange = (proprietorName, key, value) => {
        // Find the index of the agent with the specified name
        const proprietorIndex = data.findIndex(proprietor => proprietor["ProprietorName"] === proprietorName);
        if (proprietorIndex !== -1) {
            // Update the corresponding value in the data state
            const newData = [...data];
            newData[proprietorIndex][key] = value;
            setData(newData);
        }
    };


    const parseDate = (dateString) => {
        const [day, month, year] = dateString.includes('/')
            ? dateString.split('/')
            : dateString.split('-');
        return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
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
                    const dateA = parseDate(a.scraped_date);
                    const dateB = parseDate(b.scraped_date);
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


    const isLatestScrapedDate = (row, data) => {
        // Filter out rows with null or undefined scraped_date and invalid formats
        const validDates = data.filter(item => {
            const dateParts = item.scraped_date && item.scraped_date.trim().split(/[/\-]/);
            // Check if dateParts has the correct length and format
            return dateParts && dateParts.length === 3 && /^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(item.scraped_date.trim());
        });

        // If there are no valid dates, return false
        if (validDates.length === 0) return false;

        // Convert scraped_date to Date objects for comparison
        const scrapedDates = validDates.map(item => parseDate(item.scraped_date));

        // Find the maximum date among valid dates
        const maxDate = new Date(Math.max(...scrapedDates.map(date => date.getTime())));

        // Parse the row's scraped_date to Date and compare with maxDate
        const dateParts = row.scraped_date && row.scraped_date.trim().split(/[/\-]/);
        if (dateParts && dateParts.length === 3 && /^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(row.scraped_date.trim())) {
            const rowDate = parseDate(row.scraped_date);

            // Return true if the row's date matches the maxDate
            return rowDate.getTime() === maxDate.getTime();
        }

        return false;
    };



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

    const saveProprietorInputs = async (proprietorName, phoneNumber, lead, notes) => {
        try {
            const requestBody = {
                proprietorName,
                phoneNumber,
                lead,
                notes
            };

            console.log('Request Body:', requestBody); // Log the request body

            const response = await fetch('/api/saveProprietorInputs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            if (response.ok) {
                console.log('Proprietor inputs saved successfully.');
                toast.success("Inputs added!");
            } else {
                console.error('Failed to save proprietor inputs.');
            }
        } catch (error) {
            console.error('Error saving agent inputs:', error.message);
        }
    };


    const downloadCSV = () => {
        const csvContent = Papa.unparse(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'proprietors.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <main>
            <Toaster />
            <Navbar />
            <div class="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <div className="container mx-auto mt-12 p-4">
                <div className='flex mb-4 justify-center'>
                    <h1 className={`${inter.className}  font-bold text-center text-xl px-4 text-black mt-2 -300 rounded-md p-1 w-fit`}>Proprietor Data ({data.length})</h1>
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
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">

                        <thead className="">
                            <tr className="bg-black -800 text-white">
                                <th className="py-1 text-sm px-4  font-semibold text-left">Sr.no</th>

                                {Object.keys(data[0] || {}).map((header, index) => (
                                    <th
                                        key={index}
                                        className="py-1 text-sm px-4  font-semibold text-left cursor-pointer"
                                        onClick={() => requestSort(header)}
                                    >
                                        {header}
                                        {sortConfig && sortConfig.key === header && (
                                            <span>{sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽'}</span>
                                        )}
                                    </th>

                                ))}
                                <>
                                    <th className='text-sm'>Save</th>
                                </>
                            </tr>
                        </thead>
                        <tbody className=''>
                            {currentItems.map((row, rowIndex) => (
                                <tr key={rowIndex} className={`text-black border border-gray-300  ${isLatestScrapedDate(row, data) ? 'bg-yellow-200' : 'bg-[#FFFEFE]'}`}>
                                    {/* Render Agent Name and Address */}
                                    <td className={`${inter.className}  py-1  text-xs border border-slate-400`}>{indexOfFirstItem + rowIndex + 1}</td>
                                    <td className='py-1 px-4 text-xs border border-slate-400'>{row["ProprietorCode"]}</td>
                                    <td className='py-1 px-4 text-xs border border-slate-400'>{row["ProprietorName"]}</td>
                                    <td className='py-1 px-4 text-xs border border-slate-400'>{row["ProprietorAddress"]}</td>
                                    <td className='py-1 px-4 text-xs border border-slate-400'>
                                        <input
                                            type="text"
                                            placeholder="Phone Number"
                                            value={row['PhoneNumber'] || ''}
                                            onChange={(e) => handleInputChange(row["ProprietorName"], 'PhoneNumber', e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                        />

                                    </td>
                                    <td className='py-1 px-4 text-xs border border-slate-400'>
                                        <input
                                            type="text"
                                            placeholder="Lead"
                                            value={row['Lead'] || ''}
                                            onChange={(e) => handleInputChange(row["ProprietorName"], 'Lead', e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                        />
                                    </td>
                                    <td className='py-1 px-4 text-xs border border-slate-400'>
                                        <input
                                            type="text"
                                            placeholder="Notes"
                                            value={row['Notes'] || ''}
                                            onChange={(e) => handleInputChange(row["ProprietorName"], 'Notes', e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                        />
                                    </td>
                                    <td className='py-1 px-4 text-xs border border-slate-400'>{row["scraped_date"]}</td>
                                    {/* Render input fields for PhoneNumber, Lead, and Notes */}

                                    {/* Render Save button */}
                                    <td className='py-1 px-4 text-xs border border-slate-400'>
                                        <Button className='bg-black hover:shadow-black hover:shadow-md hover:text-black  rounded text-sm px-4 py-1 text-white' onClick={() => saveProprietorInputs(row["ProprietorName"], row['PhoneNumber'], row['Lead'], row['Notes'])}>Save</Button>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
                    <Button className='bg-slate-950 hover:bg-slate-700 text-white rounded ' onClick={downloadCSV}  >Download CSV</Button>
                </div>
            </div>
        </main>
    );
}
