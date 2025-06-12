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

import crypto from 'crypto';
import querystring from 'querystring';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SCOPES = process.env.SCOPES;
const APP_URL = process.env.APP_URL || process.env.HOST;

// Step 1: Redirect to Shopify for OAuth
app.get('/auth', (req, res) => {
  const { shop } = req.query;

  if (!shop) return res.status(400).send('Missing shop parameter');

  const redirectUri = `${APP_URL}/auth/callback`;
  const state = crypto.randomBytes(8).toString('hex');

  const queryParams = querystring.stringify({
    client_id: SHOPIFY_API_KEY,
    scope: SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  res.redirect(`https://${shop}/admin/oauth/authorize?${queryParams}`);
});

// Step 2: Handle callback and exchange code for token
app.get('/auth/callback', async (req, res) => {
  const { shop, code } = req.query;

  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // ⚠️ Store token securely (DB or temporary in-memory store for demo)
  // Redirect to app with access token
  res.redirect(`/?shop=${shop}&token=${accessToken}`);
});

