require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDatabase } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api', apiRoutes);

// Simple healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Handle 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'An unexpected internal error occurred on the server.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Initialize database then start server
async function startServer() {
  try {
    console.log('Initializing SQLite Database...');
    await getDatabase();
    console.log('Database initialized successfully.');
    
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  AI Employee Management Server is running!`);
      console.log(`  Port: http://localhost:${PORT}`);
      console.log(`  Status: ACTIVE`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server due to database initialization error:', error);
    process.exit(1);
  }
}

startServer();
