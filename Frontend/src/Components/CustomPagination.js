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
          className={`px-3 py-2 min-w-[36px] border rounded text-sm mx-1 ${
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
    <div className="flex flex-wrap justify-center items-center mt-6 mb-6 gap-2 px-2">
      <button
        onClick={() => handleNextPrev(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border rounded bg-white text-gray-800 border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        Prev
      </button>

      <div className="flex flex-wrap justify-center">{renderPageItems()}</div>

      <button
        onClick={() => handleNextPrev(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded bg-white text-gray-800 border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        Next
      </button>
    </div>
  );
}

export default CustomPagination;
