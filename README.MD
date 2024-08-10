# Web Scraper for Email Extraction

This script is designed to scrape emails from websites listed in a CSV file. It uses Playwright for browser automation and supports various configuration options to customize its behavior.

## Features

- Scrapes emails from websites listed in a CSV file.
- Supports rate limiting to avoid hitting the server too frequently.
- Option to rotate user-agents to mimic different browsers.
- Option to use a pool of proxies to rotate IP addresses.
- Configurable concurrency level to control the number of concurrent scraping processes.
- Excludes specific domains, file extensions, and URL patterns.

## Configuration

The script can be configured using the following options:

- `baseURL`: The path to the input CSV file containing website URLs.
- `delayTime`: The timeout for page navigation in milliseconds.
- `emailFilter`: An array of strings to filter out unwanted emails.
- `excludedDomains`: An array of domains to be ignored during scraping.
- `excludedExtensions`: An array of file extensions to be excluded.
- `excludedPatterns`: An array of URL patterns to be excluded.
- `maxDepth`: The maximum depth to scrape within the same domain.
- `concurrency`: The number of concurrent scraping processes.
- `useRateLimiting`: Enable or disable rate limiting.
- `useUserAgents`: Enable or disable user-agent rotation.
- `useProxies`: Enable or disable proxy rotation.
- `userAgents`: An array of user-agents to rotate.
- `proxies`: An array of proxies to rotate.

## Usage

1. **Install Dependencies**:
   npm install playwright csv-parser csv-writer async-mutex limiter

2. **Configure the Script**:
Edit the config object at the top of the script to set your desired configuration options.

3. **Run the Script**:
node your-script-file.js

## Example
Suppose you have a CSV file named `Leads.csv` with the following structure:

| Name      |  Website             | Contact     |
|-----------|---------------------|-------------|
| Company A |  https://www.companyA.com | 123-456-789 |
| Company B |  https://www.companyB.com | 987-654-321 |


Running the script will scrape emails from `https://www.companyA.com` and `https://www.companyB.com` and add them as new columns to the right of the existing columns:

| Name      |  Website             | Contact     | Email1                    | Email2                    |
|-----------|---------------------|-------------|---------------------------|---------------------------|
| Company A | https://www.companyA.com | 123-456-789 | john.doe@example.com     |                           |
| Company B | https://www.companyB.com | 987-654-321 | jane.smith@example.com                          |  john.notdoe@example.com   |


The modified data will be written to a new CSV file named `Leads_emails.csv`.

**Troubleshooting**
Too Many Requests: If you encounter "Too Many Requests" errors, consider reducing the concurrency or enabling rate limiting.

IP Ban: If you get banned by a website, try using a different set of proxies or reduce the scraping frequency.

**License**
This project is licensed under the MIT License. See the LICENSE file for details.

**Contributing**
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

**Contact**
For any questions or support, please open an issue on GitHub.
