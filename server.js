import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // If you're using Node 18+, you can use native fetch

// Load environment variables
dotenv.config();

// ✅ Get environment variables early
const appUrl = process.env.APP_URL || process.env.HOST;
const PORT = process.env.PORT || 8080;

// 🚫 Exit if appUrl is missing
if (!appUrl || appUrl.trim() === '') {
  throw new Error("❌ APP_URL or HOST is not set. Please check your Render environment variables.");
}

// ✅ Initialize Express app
const app = express();

// Serve static files (e.g., your HTML form for selecting data)
app.use(express.static('public'));

// Enable JSON parsing
app.use(express.json());

// ✅ Endpoint to handle data requests
app.post('/fetch-and-send', async (req, res) => {
  const { selectedDataTypes } = req.body;
  const shop = req.query.shop; // Ideally from OAuth/session
  const accessToken = req.query.token; // Simplified for testing

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
    console.error('❌ Error fetching Shopify data:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ✅ Helper function to fetch Shopify resources
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

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at ${appUrl} on port ${PORT}`);
});
