# NSE Shareholding Pattern Analyzer



https://github.com/user-attachments/assets/a2ce0af6-e2fa-4da1-b436-4a54955ed95e



## Overview

The **NSE Shareholding Pattern Analyzer** is a web application built with **Next.js** that provides real-time shareholding data for companies listed on the **National Stock Exchange (NSE)** of India. It integrates a **web scraper** to extract shareholding patterns from the NSE website and leverages the **Alpha Vantage API** for additional financial data, such as stock prices and technical indicators. The application uses **Tailwind CSS** for responsive styling and **Chart.js** for interactive data visualizations.

## Features

- **Real-Time Shareholding Data**: Fetches and displays shareholding patterns for NSE-listed companies using a custom web scraper.
- **Alpha Vantage Integration**: Retrieves real-time and historical stock market data, including OHLCV (Open, High, Low, Close, Volume) and technical indicators like SMA, RSI, and Bollinger Bands.
- **Interactive Visualizations**: Renders shareholding patterns and stock data using interactive pie charts and line graphs via **Chart.js**.
- **Responsive Design**: Features a modern, dark-themed UI styled with **Tailwind CSS**, optimized for both desktop and mobile devices.
- **Popular Stocks & Recent Searches**: Displays trending NSE stocks and caches recent user searches for quick access.
- **Client-Side Caching**: Implements caching to reduce API calls and improve performance.
- **Web Scraping**: Extracts shareholding data directly from the NSE website, adhering to ethical scraping practices.

## Getting Started

### Prerequisites

- **Node.js** and **npm** installed on your machine.
- A free **Alpha Vantage API key** (obtainable from [https://www.alphavantage.co](https://www.alphavantage.co)).
- Basic understanding of web scraping and NSE's terms of service (note: web scraping NSE may require permission, as it is deemed illegal without consent per NSE's terms).

File Structure
d:\Nimrobo\temp-project\
│
├── app\
│   ├── api\
│   │   └── shareholding\
│   │       └── route.ts
│   │
│   ├── components\
│   │   └── Loading.tsx
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── types.ts (Gemini LLM)
│
├── public\
│   └── (your static assets)
│
├── .gitignore
├── package.json
├── README.md
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
