// netlify/functions/status.js

export async function handler(event, context) {
  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/iphone_present`, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
    }
  });

  const json = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({
      iphone_present: json.result === 'true'
    })
  };
}
