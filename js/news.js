// news.js - News functionality for Yakinton 46 application

// Configuration for news feed
const newsConfig = {
  feedProxyPath: '/rss-proxy',
  fallbackFeedUrl: 'https://rss.walla.co.il/feed/2686',
  feedSheet: {
    baseUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRm_3aSAL3tnmyOHuAXMIc0IF6V3MlR-CmB3rmebHON0V_V3r3ido3hdq2qr_ByTbIayW1AKZjp45IL/pub?gid=349609406&single=true&output=csv',
    tabName: 'rssFeedUrl'
  },
  maxItems: 20, // Maximum items to fetch
  displayItems: 3, // Number of items to display at once
  cycleIntervalMs: 10000 // Rotation interval (10 seconds)
};

// Global variables for news handling
let allNewsItems = [];
let currentIndex = 0;
let newsInterval = null;
let isNewsStale = false;
let lastNewsUpdatedDisplay = '';

const NEWS_CACHE_KEY = 'yakinton46.newsCache';
const NEWS_FEED_URL_STORAGE_KEY = 'yakinton46.newsFeedUrl';
const FEED_URL_CACHE_TTL_MS = 5 * 60 * 1000; // Cache feed URL for 5 minutes

let activeFeedSourceUrl = null;
let feedSourceUrlTimestamp = 0;
let feedSourceUrlPromise = null;

// Fetch news from RSS feed
function fetchNewsBreaks() {

  console.log("Fetching news at", new Date().toLocaleTimeString());
  // Show loading state
  document.getElementById('newsContainer').innerHTML = '<div class="loading-indicator">Loading news...</div>';

  return ensureFeedSourceUrl()
    .then(feedSourceUrl => {
      if (!feedSourceUrl) {
        throw new Error('No RSS feed URL resolved from Google Sheets configuration.');
      }

      const requestUrl = buildFeedRequestUrl(feedSourceUrl);
      if (!requestUrl) {
        console.error('Unable to construct RSS request URL from resolved feed source.', {
          feedSourceUrl
        });
        throw new Error('Unable to construct RSS request URL.');
      }

      return fetch(requestUrl);
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`News feed responded with status ${response.status}`);
      }
      return response.text();
    })
    .then(str => new DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
      // Process RSS feed data
      const items = data.querySelectorAll("item");
      const topItems = Array.from(items).slice(0, newsConfig.maxItems);

      // Parse and format each news item
      allNewsItems = topItems.map(item => {
        const title = item.querySelector("title")?.textContent || "No title";
        const link = item.querySelector("link")?.textContent || "#";
        const description = item.querySelector("description")?.textContent || "-";
        const pubDateText = item.querySelector("pubDate")?.textContent;

        // Format the date
        let pubDateDisplay = "";
        if (pubDateText) {
          const dateObj = new Date(pubDateText);
          const hours = String(dateObj.getHours()).padStart(2, '0');
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          pubDateDisplay = `${day}/${month}, ${hours}:${minutes}`;
        }

        return {
          title: title,
          link: link,
          description: description,
          pubDate: pubDateDisplay
        };
      });

      if (allNewsItems.length === 0) {
        console.warn('No news items found in feed response. Attempting to use cached items.');
        if (!loadNewsFromCache({ showNotice: true })) {
          showError('newsContainer', 'No news items available');
        }
        return;
      }

      isNewsStale = false;
      lastNewsUpdatedDisplay = new Date().toLocaleString();
      saveNewsCache({ items: allNewsItems, timestamp: Date.now() });

      // Reset and start the news cycling
      startCyclingNews();
    })
    .catch(error => {
      console.error('Error fetching RSS feed.', {
        message: error?.message,
        feedSourceUrl: activeFeedSourceUrl,
        stack: error?.stack
      });
      const usedCache = loadNewsFromCache({ showNotice: true });
      if (!usedCache) {
        showError('newsContainer', 'News feed temporarily unavailable');
      }
    });
}

// Start cycling through news items
function startCyclingNews() {
  // Clear any existing interval
  if (newsInterval) {
    clearInterval(newsInterval);
  }
  
  // Reset index
  currentIndex = 0;
  
  // Show first batch immediately
  renderNewsBatch();

  // Set up interval for cycling
  newsInterval = setInterval(() => {
    currentIndex = (currentIndex + newsConfig.displayItems) % allNewsItems.length;
    renderNewsBatch();
  }, newsConfig.cycleIntervalMs);
}

// Render a batch of news items
function renderNewsBatch() {
  // If no news items, show error
  if (allNewsItems.length === 0) {
    document.getElementById('newsContainer').innerHTML = '<div class="error-state">No news items available</div>';
    return;
  }

  // Get container and create list
  const container = document.getElementById("newsContainer");
  container.innerHTML = "";

  if (isNewsStale && lastNewsUpdatedDisplay) {
    const notice = document.createElement('div');
    notice.classList.add('news-stale-notice');
    notice.textContent = `Showing cached news from ${lastNewsUpdatedDisplay}`;
    container.appendChild(notice);
  }

  const ul = document.createElement("ul");
  ul.classList.add("horizontal-list");

  // Calculate how many items to show (handle case when fewer items than display count)
  const itemsToShow = Math.min(newsConfig.displayItems, allNewsItems.length);

  // Create and append list items
  for (let i = 0; i < itemsToShow; i++) {
    const itemIndex = (currentIndex + i) % allNewsItems.length;
    const newsItem = allNewsItems[itemIndex];
    const li = document.createElement("li");
    
    li.innerHTML = `
      <small class="date-span">${newsItem.pubDate}</small><br>
      <span class="title-span">${newsItem.title}</span><br>
      `;
    ul.appendChild(li);
    // <span class="desc-span">${newsItem.description}</span><br>
  }

  // Append to container
  container.appendChild(ul);
}

function saveNewsCache(cachePayload) {
  try {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(cachePayload));
  } catch (error) {
    console.warn('Unable to persist news cache', error);
  }
}

function loadNewsFromCache({ showNotice = false } = {}) {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const rawCache = localStorage.getItem(NEWS_CACHE_KEY);
    if (!rawCache) {
      return false;
    }

    const parsedCache = JSON.parse(rawCache);
    if (!parsedCache.items || !Array.isArray(parsedCache.items) || parsedCache.items.length === 0) {
      return false;
    }

    allNewsItems = parsedCache.items;
    isNewsStale = true;
    lastNewsUpdatedDisplay = parsedCache.timestamp ? new Date(parsedCache.timestamp).toLocaleString() : '';

    if (showNotice) {
      console.info('Displaying cached news items from local storage.');
    }

    startCyclingNews();
    return true;
  } catch (error) {
    console.warn('Unable to load news cache', error);
    return false;
  }
}

function ensureFeedSourceUrl({ forceRefresh = false } = {}) {
  const now = Date.now();

  if (!forceRefresh && activeFeedSourceUrl && (now - feedSourceUrlTimestamp) < FEED_URL_CACHE_TTL_MS) {
    return Promise.resolve(activeFeedSourceUrl);
  }

  if (feedSourceUrlPromise) {
    return feedSourceUrlPromise;
  }

  feedSourceUrlPromise = fetchFeedSourceUrlFromSheet()
    .then(sheetFeedUrl => {
      const normalizedSheetUrl = (sheetFeedUrl || '').trim();

      if (normalizedSheetUrl) {
        activeFeedSourceUrl = normalizedSheetUrl;
        feedSourceUrlTimestamp = Date.now();
        saveFeedUrlToStorage(normalizedSheetUrl);
        return normalizedSheetUrl;
      }

      const cachedFeedUrl = loadFeedUrlFromStorage();
      if (cachedFeedUrl) {
        console.warn('Sheet RSS feed URL was empty. Falling back to cached feed URL.', {
          cachedFeedUrl
        });
        activeFeedSourceUrl = cachedFeedUrl;
        feedSourceUrlTimestamp = Date.now();
        return cachedFeedUrl;
      }

      if (newsConfig.fallbackFeedUrl) {
        console.warn('Sheet RSS feed URL unavailable. Falling back to configured default.', {
          fallbackFeedUrl: newsConfig.fallbackFeedUrl
        });
        activeFeedSourceUrl = newsConfig.fallbackFeedUrl;
        feedSourceUrlTimestamp = Date.now();
        return newsConfig.fallbackFeedUrl;
      }

      throw new Error('No RSS feed URL available after reading Google Sheet.');
    })
    .catch(error => {
      console.error('Unable to retrieve RSS feed URL from Google Sheet.', {
        message: error?.message,
        stack: error?.stack
      });

      const cachedFeedUrl = loadFeedUrlFromStorage();
      if (cachedFeedUrl) {
        activeFeedSourceUrl = cachedFeedUrl;
        feedSourceUrlTimestamp = Date.now();
        return cachedFeedUrl;
      }

      if (activeFeedSourceUrl) {
        return activeFeedSourceUrl;
      }

      if (newsConfig.fallbackFeedUrl) {
        activeFeedSourceUrl = newsConfig.fallbackFeedUrl;
        feedSourceUrlTimestamp = Date.now();
        return newsConfig.fallbackFeedUrl;
      }

      throw error;
    })
    .finally(() => {
      feedSourceUrlPromise = null;
    });

  return feedSourceUrlPromise;
}

function fetchFeedSourceUrlFromSheet() {
  if (!newsConfig.feedSheet || !newsConfig.feedSheet.baseUrl || !newsConfig.feedSheet.tabName) {
    console.debug('Feed sheet configuration incomplete. Skipping sheet fetch.', {
      feedSheetConfig: newsConfig.feedSheet
    });
    return Promise.resolve(null);
  }

  return resolveFeedSheetCsvUrl()
    .then(csvUrl => {
      if (!csvUrl) {
        console.error('Google Sheet CSV URL could not be resolved. Sheet may be unavailable.', {
          feedSheetConfig: newsConfig.feedSheet
        });
        return null;
      }

      return fetch(csvUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`RSS feed sheet responded with status ${response.status}`);
          }
          return response.text();
        })
        .then(rawCsv => {
          if (!rawCsv) {
            console.error('RSS feed sheet returned empty CSV payload.');
            return null;
          }

          const sanitizedCsv = rawCsv.replace(/^﻿/, '');
          const lines = sanitizedCsv.split(/\r?\n/);

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line || !line.trim()) {
              continue;
            }

            const cellValue = extractFirstCellFromCsvLine(line);
            if (cellValue) {
              try {
                const parsedUrl = new URL(cellValue);
                if (!parsedUrl.protocol || !/^https?:$/i.test(parsedUrl.protocol)) {
                  console.error('RSS feed URL in Google Sheet must use HTTP(S).', {
                    cellValue
                  });
                  continue;
                }
              } catch (urlError) {
                console.error('Invalid RSS feed URL format encountered in Google Sheet.', {
                  cellValue,
                  message: urlError?.message
                });
                continue;
              }

              return cellValue;
            }
          }

          console.error('No usable RSS feed URL found in Google Sheet.', {
            sanitizedCsvSnippet: sanitizedCsv.slice(0, 200)
          });
          return null;
        });
    });
}

function resolveFeedSheetCsvUrl() {
  if (!newsConfig.feedSheet || !newsConfig.feedSheet.baseUrl || !newsConfig.feedSheet.tabName) {
    console.debug('Feed sheet configuration incomplete while resolving CSV URL.', {
      feedSheetConfig: newsConfig.feedSheet
    });
    return Promise.resolve(null);
  }

  if (newsConfig.feedSheet.csvUrl) {
    return Promise.resolve(newsConfig.feedSheet.csvUrl);
  }

  if (newsConfig.feedSheet._resolvingPromise) {
    return newsConfig.feedSheet._resolvingPromise;
  }

  const pubHtmlUrl = `${newsConfig.feedSheet.baseUrl}/pubhtml`;
  const sheetNamePattern = newsConfig.feedSheet.tabName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  newsConfig.feedSheet._resolvingPromise = fetch(pubHtmlUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to resolve RSS feed sheet GID. Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      const regex = new RegExp(`name:\\s*"${sheetNamePattern}"[^}]*gid:\\s*"(-?\\d+)"`);
      const match = regex.exec(html);

      if (match && match[1]) {
        const gid = match[1];
        const csvUrl = `${newsConfig.feedSheet.baseUrl}/pub?gid=${gid}&single=true&output=csv`;
        newsConfig.feedSheet.csvUrl = csvUrl;
        return csvUrl;
      }

      console.error(`Unable to find Google Sheet tab "${newsConfig.feedSheet.tabName}" while resolving CSV URL.`, {
        htmlSnippet: html.slice(0, 200)
      });
      return null;
    })
    .finally(() => {
      newsConfig.feedSheet._resolvingPromise = null;
    });

  return newsConfig.feedSheet._resolvingPromise;
}

function extractFirstCellFromCsvLine(line) {
  let inQuotes = false;
  let value = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        value += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      break;
    }

    value += char;
  }

  return value.trim();
}

function loadFeedUrlFromStorage() {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const stored = localStorage.getItem(NEWS_FEED_URL_STORAGE_KEY);
    return stored ? stored.trim() : null;
  } catch (error) {
    console.warn('Unable to read stored RSS feed URL.', error);
    return null;
  }
}

function saveFeedUrlToStorage(feedUrl) {
  try {
    if (typeof localStorage === 'undefined' || !feedUrl) {
      return;
    }
    localStorage.setItem(NEWS_FEED_URL_STORAGE_KEY, feedUrl);
  } catch (error) {
    console.warn('Unable to persist RSS feed URL cache.', error);
  }
}

function buildFeedRequestUrl(feedSourceUrl) {
  if (!feedSourceUrl) {
    return null;
  }

  const proxyPath = newsConfig.feedProxyPath;
  if (!proxyPath || !proxyPath.trim()) {
    return feedSourceUrl;
  }

  const trimmedProxy = proxyPath.trim();
  const separator = trimmedProxy.includes('?') ? '&' : '?';
  return `${trimmedProxy}${separator}url=${encodeURIComponent(feedSourceUrl)}`;
}
