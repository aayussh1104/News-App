function CustomPagination(props) {
  const { currentPage, totalPages, onPageChange } = props;

  const handleNextPrev = (pageNumber) => {
    onPageChange(pageNumber);
  };

  const renderPageItems = () => {
    const pageItems = [];
    for (let i = 1; i <= totalPages; i++) {
      pageItems.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 border rounded mx-1 ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    return pageItems;
  };

  return (
    <div className="flex justify-center items-center mt-6 mb-6 space-x-2">
      <button
        onClick={() => handleNextPrev(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded bg-white text-gray-800 border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      {renderPageItems()}

      <button
        onClick={() => handleNextPrev(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded bg-white text-gray-800 border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

export default CustomPagination;