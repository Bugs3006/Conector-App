// server.js
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createRequestHandler } from '@remix-run/express';

// Load environment variables
dotenv.config();

// Fallback for SHOPIFY_APP_URL if only HOST is set (for Remix bug workaround)
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL || process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

// Check for required app URL
const appUrl = process.env.APP_URL || process.env.SHOPIFY_APP_URL;
if (!appUrl) {
  throw new Error("APP_URL or HOST/SHOPIFY_APP_URL is not set. Please check your environment variables.");
}

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (optional)
app.use(express.static('public'));

// ✅ Shopify data fetching API (your custom route)
app.post('/fetch-and-send', async (req, res) => {
  const { selectedDataTypes } = req.body;
  const shop = req.query.shop;
  const accessToken = req.query.token;

  if (!shop || !accessToken) {
    return res.status(400).json({ error: 'Missing shop or access token' });
  }

  const results = {};

  try {
    if (selectedDataTypes.includes('products')) {
      results.products = await fetchShopifyData(shop, accessToken, 'products');
    }
    if (selectedDataTypes.includes('orders')) {
      results.orders = await fetchShopifyData(shop, accessToken, 'orders');
    }
    if (selectedDataTypes.includes('customers')) {
      results.customers = await fetchShopifyData(shop, accessToken, 'customers');
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Shopify Admin API fetch helper
async function fetchShopifyData(shop, accessToken, resource) {
  const url = `https://${shop}/admin/api/2023-04/${resource}.json`;
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${resource}`);
  }

  const data = await response.json();
  return data[resource];
}

// ✅ Let Remix handle all other routes
app.all(
  '*',
  createRequestHandler({
    
    mode: process.env.NODE_ENV,
  })
);

// Start Express server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
