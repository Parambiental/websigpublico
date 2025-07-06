const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory.
// This is where your HTML, CSS, and client-side JavaScript will go.
app.use(express.static(path.join(__dirname, 'public')));

// Define the root route.
// When a user visits the base URL, send them the 'index.html' file.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Basic error handling for undefined routes.
// This should be placed after all other routes.
app.use((req, res, next) => {
    res.status(404).send("Sorry, that route doesn't exist.");
});

// Start the server and listen for incoming requests.
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Access the application at http://localhost:${port}`);
});
