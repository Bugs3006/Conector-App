import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // or use native fetch in Node 18+

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8081;

// Serve static files from 'public' folder (for your HTML, CSS, etc.)
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to receive user-selected data types and fetch Shopify data
app.post('/fetch-and-send', async (req, res) => {
  const { selectedDataTypes } = req.body;
  const shop = req.query.shop;       // Usually from OAuth/session
  const accessToken = req.query.token;  // Usually securely stored, simplified here

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

// Helper function to fetch data from Shopify Admin API
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

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

import dotenv from 'dotenv';
dotenv.config();

const appUrl = process.env.APP_URL || process.env.HOST;

if (!appUrl) {
  throw new Error("APP_URL or HOST is not set. Please check your environment variables.");
}

