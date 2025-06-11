// import { createServer } from 'node:http';
 
// const server = createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Hello hello World!\n');
// });
 
import express from 'express';
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Your existing routes...

// Endpoint to receive user selections and fetch data
app.post('/fetch-data', async (req, res) => {
  const { selections } = req.body; // e.g., { orders: true, products: false, customers: true }

  try {
    // Based on selections, call Shopify API to get data
    const results = {};

    if (selections.orders) {
      // Fetch orders from Shopify
      results.orders = await fetchShopifyOrders();
    }
    if (selections.products) {
      // Fetch products from Shopify
      results.products = await fetchShopifyProducts();
    }
    if (selections.customers) {
      // Fetch customers from Shopify
      results.customers = await fetchShopifyCustomers();
    }

    // Send back the collected data
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// Functions to fetch data from Shopify (simplified example)
async function fetchShopifyOrders() {
  // Your logic to call Shopify API orders endpoint
  return []; // Return fetched orders array
}
async function fetchShopifyProducts() {
  // Your logic to call Shopify API products endpoint
  return []; // Return fetched products array
}
async function fetchShopifyCustomers() {
  // Your logic to call Shopify API customers endpoint
  return []; // Return fetched customers array
}

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
