import { useEffect, useState } from "react";
import "../App.css";
import useNewsData from "../hooks/useNewsData";
import CustomPagination from "./CustomPagination";
import SummaryCard from "./SummaryCard";

const NewsList = (props) => {
  const { category, searchTerm } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [activeSummaryUrl, setActiveSummaryUrl] = useState(null);

  const pageSize = 6;
  const onPageChange = (pageNumber) => setCurrentPage(pageNumber);

  const { newsData, loading, error } = useNewsData(category, searchTerm);

  const totalArticles = newsData.length;
  const totalPages = Math.ceil(totalArticles / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentArticle = newsData.slice(startIndex, endIndex);

  // Reusable image with fallback only
  const NewsImage = ({ src, title }) => {
    const [imgSrc, setImgSrc] = useState(src || "");

    return (
      <img
        src={imgSrc}
        alt={title}
        className="w-full h-40 sm:h-48 object-cover"
        referrerPolicy="no-referrer"
        onError={() => {
          setImgSrc("/no-image.jpeg");
        }}
      />
    );
  };

  const handleSummarize = async (url, image, title, content, description) => {
    try {
      setActiveSummaryUrl(url);
      setLoadingSummary(true);

      // API call to Flask
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, content, description }),
      });

      const data = await response.json();

      if (data.summary) {
        setSummaryData({
          summary: data.summary,
          title: data.title || title,
          image: image,
        });
      } else {
        alert("Error: " + (data.error || "Could not summarize"));
      }
    } catch (error) {
      alert("Server error. Is Flask running?");
      console.error(error);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Auto-scroll to summary card
  useEffect(() => {
    if (summaryData) {
      const element = document.getElementById("summaryCard");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  }, [summaryData]);

  useEffect(() => {
    setSummaryData(null);
    setActiveSummaryUrl(null);
  }, [category, searchTerm]);

  if (loading) {
    return <div className="text-center mt-5 loading-animation">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 text-center">Error: {error.message}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Summary Card */}
      <SummaryCard
        summaryData={summaryData}
        onClose={() => setSummaryData(null)}
      />

      {/* News Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentArticle?.map((article) => (
          <div key={article.url} className="flex">
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg shadow-md overflow-hidden flex flex-col w-full transform transition duration-200 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer p-3 sm:p-4 text-sm sm:text-base">
              
              {/* Image with fallback */}
              <NewsImage src={article.image} title={article.title} />

              <div className="flex flex-col flex-grow">
                <h2 className="text-base sm:text-lg font-semibold mb-2">
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow text-sm sm:text-base">
                  {article.description}
                </p>

                <div className="mt-auto w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-900 w-full sm:w-auto text-center"
                  >
                    Read More
                  </a>

                  <button
                    onClick={() =>
                      handleSummarize(
                        article.url,
                        article.image,
                        article.title,
                        article.content || "",
                        article.description || ""
                      )
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 w-full sm:w-auto text-center"
                    disabled={
                      loadingSummary && activeSummaryUrl === article.url
                    }
                  >
                    {loadingSummary && activeSummaryUrl === article.url
                      ? "Summarizing..."
                      : "Summarize"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default NewsList;
