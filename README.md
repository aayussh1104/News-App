📰 AI News Summarizer App
    An intelligent, full-stack news web app that fetches real-time news using the GNews API, and summarizes long articles into concise versions using Hugging Face Transformers.
Built with:

    🧠 React frontend with Tailwind CSS

    🐍 Flask backend with Hugging Face summarization models

    ⚡ Real-time scraping + fallback summarization

    🧠 Caching, CORS proxying, and clean architecture


🚀 Features

    ✅ View live news in categories (Tech, Sports, etc.)

    ✅ Search news articles with real-time filters

    ✅ Summarize long news into short, readable text

    ✅ Auto-scroll to summary

    ✅ Fast image proxying to avoid CORS issues

    ✅ Fully responsive and mobile-friendly

    ✅ Environment variables used for security

    ✅ Hosted backend support (Render/localhost)


🗂️ Folder Structure

    project-root/
    │
    ├── backend/                  # Flask backend
    │   ├── app.py                
    │   ├── requirements.txt      
    │   └── .env                  
    │
    ├── frontend/                 # React frontend
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── NewsList.jsx
    │   │   │   ├── SummaryCard.jsx
    │   │   │   └── CustomPagination.jsx
    │   │   ├── hooks/
    │   │   │   └── useNewsData.js
    │   │   ├── App.js
    │   │   └── index.js
    │   ├── public/
    │   │   └── no-image.jpeg
    │   ├── .env
    │   ├── package.json
    │   └── tailwind.config.js
    │
    └── README.md


🧠 Technologies Used

    Frontend
    
        - React
        - Tailwind CSS
        - Fetch API

    Backend

        - Flask
        - Transformers (AutoModel, pipeline)
        - Newspaper3k (for scraping)
        - Flask-CORS
        - Flask-Caching
        - dotenv
    
