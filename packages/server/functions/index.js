const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'TPPO Whiteboard API on Firebase'
  });
});

// API Status
app.get('/api/status', (req, res) => {
  res.json({
    message: 'TPPO Whiteboard API is running on Firebase',
    version: '0.0.1'
  });
});

// API Routes (will be added when Firestore integration is done)
app.get('/api/auth/me', (req, res) => {
  res.json({ message: 'Auth endpoint - coming soon' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Export as Cloud Function
exports.api = functions
  .region('asia-southeast1')
  .https.onRequest(app);
