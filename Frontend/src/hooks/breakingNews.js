import { useEffect, useState } from 'react';

// In-memory cache object (shared across hook calls)
const breakingNewsCache = {
    data: null,
    timestamp: null,
};

const useBreakingNews = () => {
    const [breakingNews, setBreakingNews] = useState([]);

    const fetchBreakingNews = async () => {
    const now = Date.now();
    const FIFTEEN_MINUTES = 15 * 60 * 1000;

    // Check if cache is still valid
    if (breakingNewsCache.data && (now - breakingNewsCache.timestamp < FIFTEEN_MINUTES)) {
        console.log("[CACHE HIT] Breaking news");
        setBreakingNews(breakingNewsCache.data);
        return;
    }

    const apiKey = process.env.REACT_APP_NEWS_API_KEY;
    const url = `https://gnews.io/api/v4/top-headlines?lang=en&country=in&max=5&token=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();

      // Update cache
        breakingNewsCache.data = data.articles || [];
        breakingNewsCache.timestamp = now;

        setBreakingNews(data.articles || []);
    } catch (error) {
        console.error("Error fetching breaking news:", error);
    }
    };

    useEffect(() => {
        fetchBreakingNews();
        const interval = setInterval(fetchBreakingNews, 120000); // 120 seconds
        return () => clearInterval(interval);
    }, []);

    return breakingNews;
};

export default useBreakingNews;
