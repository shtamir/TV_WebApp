const http = require('http');
const { URL } = require('url');

const DEFAULT_FEED_URL = process.env.FEED_URL || 'https://rss.walla.co.il/feed/13438';
const PORT = process.env.PORT || 8787;

async function handleRequest(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  console.log('[RSS Proxy] Incoming request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin
  });

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

  console.log('[RSS Proxy] Resolved target feed:', targetFeed);

  try {
    const upstreamResponse = await fetch(targetFeed, {
      headers: {
        'User-Agent': 'TV-WebApp RSS Proxy/1.0 (+https://github.com)'
      }
    });

    console.log('[RSS Proxy] Upstream response received:', {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      ok: upstreamResponse.ok,
      redirected: upstreamResponse.redirected,
      url: upstreamResponse.url
    });

    const body = await upstreamResponse.text();

    console.log('[RSS Proxy] Upstream response body length:', body.length);

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=120'
    };

    const contentType = upstreamResponse.headers.get('content-type');
    headers['Content-Type'] = contentType || 'application/rss+xml; charset=utf-8';

    res.writeHead(upstreamResponse.status, headers);
    res.end(body);

    console.log('[RSS Proxy] Response forwarded to client with status:', upstreamResponse.status);
  } catch (error) {
    console.error('[RSS Proxy] Error fetching RSS feed through proxy:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.writeHead(502, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to fetch RSS feed' }));

    if (error.cause) {
      console.error('[RSS Proxy] Error cause:', error.cause);
    }
  }
}

const server = http.createServer((req, res) => {
  handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`RSS proxy listening on port ${PORT}`);
});
