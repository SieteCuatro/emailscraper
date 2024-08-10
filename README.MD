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

## Example Configuration

const config = {
    baseURL: 'Leads.csv',
    delayTime: 3000,
    emailFilter: ['@sentry-next.wixpress.com', '.png', 'sentry.io', '@sentry.wixpress.com', '@wix.com'],
    excludedDomains: ['facebook.com', 'instagram.com', 'genealog.cl'],
    excludedExtensions: ['.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg'],
    excludedPatterns: ['privacy', 'terms', 'faq', 'wp-json', 'feed', 'wp-includes', 'xmlrpc', 'feed'],
    maxDepth: 1,
    concurrency: 5,
    useRateLimiting: true,
    useUserAgents: true,
    useProxies: true,
    userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0',
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
    ],
    proxies: [
        'http://proxy1.example.com:8080',
        'http://proxy2.example.com:8080',
    ],
};

**Output**
The script will generate a CSV file named Leads_emails.csv containing the scraped emails along with the original data from the input CSV file.

**Troubleshooting**
Too Many Requests: If you encounter "Too Many Requests" errors, consider reducing the concurrency or enabling rate limiting.

IP Ban: If you get banned by a website, try using a different set of proxies or reduce the scraping frequency.

**License**
This project is licensed under the MIT License. See the LICENSE file for details.

**Contributing**
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

**Contact**
For any questions or support, please open an issue on GitHub.
