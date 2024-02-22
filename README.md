# Web Scraper for Email Extraction

This project is a web scraper tool developed in Node.js that extracts emails from websites listed in a CSV file. It utilizes the Playwright library for browser automation and CSV-parser for reading the input CSV file.

## Features

- **Email Extraction**: Scrapes emails from the websites listed in a CSV file.
- **Concurrent Processing**: Supports concurrent scraping processes to improve efficiency.
- **Exclusion Filters**: Filters out emails based on predefined exclusion patterns and domains.
- **Customizable Configuration**: Allows customization of various parameters such as delay time, exclusion filters, and maximum depth of scraping.

## Setup

1. **Install Dependencies**: Run `npm install` to install the required dependencies specified in `package.json`.
2. **Configuration**: Customize the configuration variables in the script (`index.js`) according to your requirements.
3. **Input CSV File**: Prepare a CSV file containing a column named "Website" with the list of URLs to scrape emails from.
4. **Run**: Execute the script by running `node index.js`.
5. **Output**: The scraped emails will be written to a new CSV file with "_emails" appended to the original filename.

## Configuration

- `baseURL`: Path to the input CSV file containing website URLs.
- `delayTime`: Delay time for page load and network idle (in milliseconds).
- `emailFilter`: Array of email patterns to be filtered out.
- `excludedDomains`: Array of domains to be excluded from scraping.
- `excludedExtensions`: Array of file extensions to be excluded from scraping.
- `excludedPatterns`: Array of URL patterns to be excluded from scraping.
- `maxDepth`: Maximum depth to scrape within the same domain.
- `concurrency`: Number of concurrent scraping processes.

## Usage

```bash
node index.js
