# React News App with Bootstrap

This project is a React-based web application that fetches news data from an API to display on a webpage. It includes features such as category selection, search functionality, and custom pagination for better user experience.

## Features

    Fetch News API: The app fetches news articles from a third-party API to display on the webpage.
    Category Selection: Users can choose from different categories (e.g., business, entertainment, health, science, sports, technology) to filter the displayed news articles.
    Search Functionality: The app includes a search feature that allows users to search for news articles containing specific keywords.
    Custom Pagination: Pagination controls are implemented to navigate through multiple pages of news articles.

## Technologies Used

    React: Frontend JavaScript library for building user interfaces.
    Bootstrap: Frontend framework for designing responsive and mobile-first websites.
    Fetch API: Used to make HTTP requests to fetch news data from the API.
    React Router: Used for handling navigation and routing within the single-page application.

## Code Structure:

            news-app/
            ├── public/
            │   └── index.html
            ├── src/
            │   ├── components/
            │   │   ├── CustomPagination.js
            │   │   └── NewsList.js
            │   ├── hooks/
            │   │   └── useNewsData.js
            │   ├── App.js
            │   ├── index.js
            │   └── styles/
            │       └── NewsList.css
            ├── package.json
            └── README.md

    
## Usage

    Upon launching the app, you will see a list of recent news articles fetched from the API.
    Use the category selection dropdown to filter news articles by category.
    Enter keywords into the search bar to filter news articles based on the search query.
    Navigate through different pages of news articles using the pagination controls at the bottom of the page.

## Acknowledgments

    This project was built as a demonstration of integrating React with Bootstrap for building responsive web applications.
    Special thanks to https://gnews.io for providing the news API used in this project.


## Hosted link

    https://newsssportal.netlify.app/
