// server.js
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createRequestHandler } from '@remix-run/express';
import crypto from 'crypto';
import querystring from 'querystring';

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

const appUrl = process.env.APP_URL || process.env.SHOPIFY_APP_URL;
if (!appUrl) {
  throw new Error("APP_URL or SHOPIFY_APP_URL is not set.");
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ✅ Health check route for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Shopify Data Fetching API
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

// OAuth: Redirect
app.get('/auth', (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing shop parameter');

  const state = crypto.randomBytes(8).toString('hex');
  const redirectUri = `${appUrl}/auth/callback`;
  const queryParams = querystring.stringify({
    client_id: process.env.SHOPIFY_API_KEY,
    scope: process.env.SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  res.redirect(`https://${shop}/admin/oauth/authorize?${queryParams}`);
});

// OAuth: Callback
app.get('/auth/callback', async (req, res) => {
  const { shop, code } = req.query;

  if (!shop || !code) {
    return res.status(400).send('Missing shop or code');
  }

  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    const tokenData = await response.json();
    const accessToken = tokenData.access_token;

    // Store token in DB (optional)
    res.redirect(`/?shop=${shop}&token=${accessToken}`);
  } catch (err) {
    console.error('Error fetching access token:', err);
    res.status(500).send('Error retrieving access token');
  }
});

// All other routes handled by Remix
app.all('*', createRequestHandler({ mode: process.env.NODE_ENV }));

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
