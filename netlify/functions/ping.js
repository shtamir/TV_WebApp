export async function handler(event) {
  const origin = event.headers.origin || '';
  const isNetlifyPreview = origin.includes('--yakinton-46.netlify.app') || origin === 'https://yakinton-46.netlify.app';

  const corsHeaders = {
    'Access-Control-Allow-Origin': isNetlifyPreview ? origin : '',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  const debugInfo = {
    origin,
    isNetlifyPreview,
    allowedOrigin: corsHeaders['Access-Control-Allow-Origin'],
    method: event.httpMethod
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ debug: debugInfo }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed', debug: debugInfo }),
    };
  }

  try {
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/iphone_present/true`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Presence set', debug: debugInfo }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message, debug: debugInfo }),
    };
  }
}

// This function is called when the page loads