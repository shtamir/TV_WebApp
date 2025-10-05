const http = require('http');
const { URL } = require('url');

const DEFAULT_FEED_URL = process.env.FEED_URL || 'https://rss.walla.co.il/feed/2686';
const PORT = process.env.PORT || 8787;

async function handleRequest(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  if (requestUrl.pathname !== '/rss-proxy') {
    res.writeHead(404, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Not Found' }));
    return;
  }

  const targetFeed = requestUrl.searchParams.get('url') || DEFAULT_FEED_URL;

  try {
    const upstreamResponse = await fetch(targetFeed, {
      headers: {
        'User-Agent': 'TV-WebApp RSS Proxy/1.0 (+https://github.com)'
      }
    });

    const body = await upstreamResponse.text();

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=120'
    };

    const contentType = upstreamResponse.headers.get('content-type');
    headers['Content-Type'] = contentType || 'application/rss+xml; charset=utf-8';

    res.writeHead(upstreamResponse.status, headers);
    res.end(body);
  } catch (error) {
    console.error('Error fetching RSS feed through proxy:', error);
    res.writeHead(502, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to fetch RSS feed' }));
  }
}

const server = http.createServer((req, res) => {
  handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`RSS proxy listening on port ${PORT}`);
});
