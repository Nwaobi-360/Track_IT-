// Importing database configuration to establish connection
require('./Configuration/DatabaseConfig');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
// const router = require('./router/userRouter');
const RiderRouter = require('./router/RidersRouters');


// Load environment variables from .env file
require('dotenv').config();

const port = process.env.port || 3000; // Default port is 3000 if not specified in .env file

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());

// Routes
// app.use('/api/v1', router, );
app.use('/api/v1/', RiderRouter)

// Root endpoint
app.get('/api/v1', (req, res) => {
    res.send("Welcome to Track-IT");
});

// Start the server
app.listen(port, () => {
    console.log(`Server is up and running on port: ${port}`);
});
