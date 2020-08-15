const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');

const app = express();

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

app.use(logger);

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/jobs', require('./routes/api/jobs'));
app.use('/api/sitters', require('./routes/api/sitters'));

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`),
);
