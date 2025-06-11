import { createServer } from 'node:http';
 
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello hello World!\n');
});
 
// starts a simple http server locally on port 3000
