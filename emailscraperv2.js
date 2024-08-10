const playwright = require('playwright');
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { URL } = require('url');
const { Semaphore } = require('async-mutex');
const { RateLimiter } = require('limiter');

// Configuration Section
const config = {
    baseURL: 'Leads.csv',
    delayTime: 3000,
    emailFilter: ['@sentry-next.wixpress.com', '.png', 'sentry.io', '@sentry.wixpress.com', '@wix.com'],
    excludedDomains: ['facebook.com', 'instagram.com', 'genealog.cl'],
    excludedExtensions: ['.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg'],
    excludedPatterns: ['privacy', 'terms', 'faq', 'wp-json', 'feed', 'wp-includes', 'xmlrpc', 'feed'],
    maxDepth: 1,
    concurrency: 5,
    useRateLimiting: true, // Enable or disable rate limiting
    useUserAgents: true, // Enable or disable user-agent rotation
    useProxies: true, // Enable or disable proxy rotation
    userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0',
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
    ],
    proxies: [
        'http://proxy1.example.com:8080',
        'http://proxy2.example.com:8080',
        // Add more proxies as needed
    ],
};

const semaphore = new Semaphore(config.concurrency);
const rateLimiter = config.useRateLimiting ? new RateLimiter({ tokensPerInterval: config.concurrency, interval: 'second' }) : null;

async function scrapeEmails(url, depth, visitedUrls) {
    const release = await semaphore.acquire();
    const browser = await playwright.chromium.launch();
    const contextOptions = {};
    if (config.useUserAgents) {
        contextOptions.userAgent = config.userAgents[Math.floor(Math.random() * config.userAgents.length)];
    }
    if (config.useProxies) {
        contextOptions.proxy = { server: config.proxies[Math.floor(Math.random() * config.proxies.length)] };
    }
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    try {
        console.log(`Navigating to: ${url}`);
        if (config.useRateLimiting) {
            await rateLimiter.removeTokens(1);
        }
        await page.goto(url, { timeout: config.delayTime });
        await page.waitForLoadState('networkidle');
        const content = await page.content();
        const emailRegex = /\b(?:mailto:)?([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g;
        let emailMatches = content.match(emailRegex);
        if (emailMatches) {
            emailMatches = emailMatches.map(email => email.replace('mailto:', '')); // Remove "mailto:" prefix
            emailMatches = emailMatches.filter(email => !config.emailFilter.some(filterItem => email.includes(filterItem)));
            emailMatches = Array.from(new Set(emailMatches.map(email => email.toLowerCase()))); // Convert to lowercase and remove duplicates
        }

        // Extract URLs from the page
        const urlRegex = /href=["'](.*?)["']/g;
        let urlMatches = content.match(urlRegex);
        if (urlMatches) {
            urlMatches = urlMatches.map(url => {
                const match = url.match(/href=["'](.*?)["']/);
                return match ? match[1] : '';
            });

            // Filter URLs to keep only those within the same domain, not excluded, and not in excluded domains list
            const baseUrlObj = new URL(url);
            const sameDomainUrls = urlMatches.filter(url => {
                if (url.startsWith('http')) {
                    const urlObj = new URL(url);
                    const normalizedUrl = urlObj.toString(); // Normalize URL
                    return urlObj.hostname === baseUrlObj.hostname &&
                           !config.excludedExtensions.some(ext => urlObj.pathname.endsWith(ext)) &&
                           !config.excludedPatterns.some(pattern => normalizedUrl.includes(pattern)) &&
                           !visitedUrls.has(normalizedUrl) &&
                           !config.excludedDomains.some(domain => urlObj.hostname.includes(domain));
                }
                return false;
            });

            console.log(`Found URLs within the same domain: ${sameDomainUrls}`);
            // You can further process these URLs as needed
            if (depth < config.maxDepth) {
                // Recursively scrape URLs within the same domain
                await Promise.all(sameDomainUrls.map(async newUrl => {
                    const normalizedNewUrl = (new URL(newUrl)).toString(); // Normalize new URL
                    if (!visitedUrls.has(normalizedNewUrl)) {
                        visitedUrls.add(normalizedNewUrl); // Add the URL to visitedUrls before recursive call
                        await scrapeEmails(newUrl, depth + 1, visitedUrls);
                    }
                }));
            }
        }

        console.log(`Found emails: ${emailMatches}`);
        return emailMatches ? emailMatches : [];
    } catch (error) {
        console.error(`Error while scraping ${url}: ${error.message}`);
        return [];
    } finally {
        await browser.close();
        console.log(`Browser closed for ${url}`);
        release();
    }
}

async function processCsv() {
    const rows = [];
    const headersSet = new Set();
    const readStream = fs.createReadStream(config.baseURL).pipe(csv());
    
    console.log(`Reading CSV file: ${config.baseURL}`);
    
    const existingEmails = new Set(); // Set to store existing emails
    const visitedUrls = new Set(); // Set to track visited URLs
    
    for await (const row of readStream) {
        const newRow = { ...row };
        const website = row.Website || '';
        
        if (website) {
            console.log(`Scraping: ${website}`);
            const emails = await scrapeEmails(website, 0, visitedUrls);
            const uniqueEmails = emails.filter(email => !existingEmails.has(email));
            
            if (uniqueEmails.length > 0) {
                uniqueEmails.forEach((email, index) => {
                    const emailHeader = `Email${index + 1}`;
                    newRow[emailHeader] = email;
                    headersSet.add(emailHeader);
                });
                
                rows.push(newRow);
                uniqueEmails.forEach(email => existingEmails.add(email));
            }
        }
    }
    
    const headers = Object.keys(rows[0]).concat(Array.from(headersSet));
    
    const outputFileName = config.baseURL.replace('.csv', '_emails.csv');
    const csvWriter = createCsvWriter({
        path: outputFileName,
        header: headers.map(header => ({ id: header, title: header }))
    });
    
    await csvWriter.writeRecords(rows);
    console.log(`CSV file written successfully to ${outputFileName}`);
}

processCsv().catch(error => {
    console.error('An error occurred during the processing: ', error.message);
});
