# Web Scraper for Email Extraction

This project is a web scraper tool developed in Node.js that extracts emails from websites listed in a CSV file. It utilizes the Playwright library for browser automation and CSV-parser for reading the input CSV file.

## Features
- Email Extraction: Scrapes emails from the websites listed in a CSV file.
- Concurrent Processing: Supports concurrent scraping processes to improve efficiency.
- Exclusion Filters: Filters out emails based on predefined exclusion patterns and domains.
- Customizable Configuration: Allows customization of various parameters such as delay time, exclusion filters, and maximum depth of scraping.

## Setup
1. Install Dependencies: Run `npm install` to install the required dependencies specified in `package.json`.
2. Configuration: Customize the configuration variables in the script (`index.js`) according to your requirements.
3. Input CSV File: Prepare a CSV file containing a column named "Website" with the list of URLs to scrape emails from.
4. Run: Execute the script by running `node index.js`.

## Configuration
- **baseURL:** Path to the input CSV file containing website URLs.
- **delayTime:** Delay time for page load and network idle (in milliseconds).
- **emailFilter:** Array of email patterns to be filtered out.
- **excludedDomains:** Array of domains to be excluded from scraping.
- **excludedExtensions:** Array of file extensions to be excluded from scraping.
- **excludedPatterns:** Array of URL patterns to be excluded from scraping.
- **maxDepth:** Maximum depth to scrape within the same domain.
- **concurrency:** Number of concurrent scraping processes.

## Usage
node emailscraperv1.5.js

## Example
Suppose you have a CSV file named `Leads.csv` with the following structure:

| Name      | Email             | Website             | Contact     |
|-----------|-------------------|---------------------|-------------|
| Company A | john@example.com  | https://www.companyA.com | 123-456-789 |
| Company B | jane@example.com  | https://www.companyB.com | 987-654-321 |


Running the script will scrape emails from `https://www.companyA.com` and `https://www.companyB.com` and add them as new columns to the right of the existing columns:

| Name      | Email             | Website             | Contact     | Email1                    | Email2                    |
|-----------|-------------------|---------------------|-------------|---------------------------|---------------------------|
| Company A | john@example.com  | https://www.companyA.com | 123-456-789 | john.doe@example.com     |                           |
| Company B | jane@example.com  | https://www.companyB.com | 987-654-321 | jane.smith@example.com                          |     |


The modified data will be written to a new CSV file named `Leads_emails.csv`.

## Dependencies
- playwright: Library for browser automation.
- csv-parser: Streaming CSV parser that aims for maximum speed.
- csv-writer: Library for writing CSV files.

## License
This project is licensed under the MIT License.
