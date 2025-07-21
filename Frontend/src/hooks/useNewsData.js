// custom hook for fetching the data from the api and returning it to the NewsList component

import { useEffect, useState } from 'react';

// In-memory cache with expiration
const cache = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const useNewsData = (category, searchTerm) => {
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchNewsData() {
            try {
                setLoading(true);
                setError(null);

                const apiKey = process.env.REACT_APP_NEWS_API_KEY;
                if (!apiKey) {
                    throw new Error('API key is missing');
                }

                let apiUrl = `https://gnews.io/api/v4/top-headlines?token=${apiKey}&lang=en`;

                if (category) {
                    apiUrl += `&topic=${category}`;
                }

                if (searchTerm) {
                    apiUrl += `&q=${searchTerm}`;
                }

                const cacheKey = `${category || "none"}|${searchTerm || "none"}`;
                const cached = cache[cacheKey];

                if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                    setNewsData(cached.data);
                    setLoading(false);
                    return;
                }

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                const articles = data.articles || [];

                // Save to cache
                cache[cacheKey] = {
                    data: articles,
                    timestamp: Date.now()
                };

                setNewsData(articles);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        fetchNewsData();
    }, [category, searchTerm]);

    return { newsData, loading, error };
};

export default useNewsData;
