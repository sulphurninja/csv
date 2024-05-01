export default function Pagination({ currentPage, totalPages, paginate }) {
    const pageNumbers = [];

    // Calculate start and end page numbers based on current page
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // Adjust start and end page numbers if needed to display 4-5 pages
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }


    return (
        <ul className="flex gap-2">
      <li>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
        >
          First
        </button>
      </li>
      <li>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
      </li>
      {pageNumbers.map((number) => (
        <li key={number}>
          <button
            className={`px-3 py-1 rounded ${
              currentPage === number ? 'bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => paginate(number)}
          >
            {number}
          </button>
        </li>
      ))}
      <li>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </li>
      <li>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </button>
      </li>
    </ul>
    );
};
