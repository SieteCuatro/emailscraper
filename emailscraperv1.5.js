const playwright = require('playwright');
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const baseURL = 'Leads.csv';
const delayTime = 3000;
const emailFilter = ['@sentry-next.wixpress.com', '.png', 'sentry.io', '@sentry.wixpress.com', '@wix.com'];
const excludedDomains = ['facebook.com', 'instagram.com', 'genealog.cl']; // Domains to be ignored
const excludedExtensions = ['.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg']; // Add more file extensions as needed
const excludedPatterns = ['privacy', 'terms', 'faq', 'wp-json', 'feed', 'wp-includes', 'xmlrpc', 'feed']; // Add more patterns to exclude specific URLs

const maxDepth = 1; // Maximum depth to scrape within the same domain
const concurrency = 5; // Number of concurrent scraping processes

async function scrapeEmails(url, depth, visitedUrls) {
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    try {
        console.log(`Navigating to: ${url}`);
        await page.goto(url, { timeout: delayTime });
        await page.waitForLoadState('networkidle');
        const content = await page.content();
        const emailRegex = /\b(?:mailto:)?([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g;
        let emailMatches = content.match(emailRegex);
        if (emailMatches) {
            emailMatches = emailMatches.map(email => email.replace('mailto:', '')); // Remove "mailto:" prefix
            emailMatches = emailMatches.filter(email => !emailFilter.some(filterItem => email.includes(filterItem)));
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
                           !excludedExtensions.some(ext => urlObj.pathname.endsWith(ext)) &&
                           !excludedPatterns.some(pattern => normalizedUrl.includes(pattern)) &&
                           !visitedUrls.has(normalizedUrl) &&
                           !excludedDomains.some(domain => urlObj.hostname.includes(domain));
                }
                return false;
            });

            console.log(`Found URLs within the same domain: ${sameDomainUrls}`);
            // You can further process these URLs as needed
            if (depth < maxDepth) {
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
    }
}

async function processCsv() {
    const rows = [];
    const headersSet = new Set();
    const readStream = fs.createReadStream(baseURL).pipe(csv());
    
    console.log(`Reading CSV file: ${baseURL}`);
    
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
    
    const outputFileName = baseURL.replace('.csv', '_emails.csv');
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
