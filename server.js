import express from 'express';
const app = express();

// Serve files in 'public' folder at root URL
app.use(express.static('public'));

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
