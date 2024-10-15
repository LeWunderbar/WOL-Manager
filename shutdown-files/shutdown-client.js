const http = require('http');

// Define the hostname and port
const hostname = '0.0.0.0'; // Allows access from any IP
const port = 3000;

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.statusCode = 200; // HTTP status code for success
  res.setHeader('Content-Type', 'text/plain'); // Response type
  res.end('Hello, your server is working!\n'); // Response message
});

// Start the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});