require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');

const securityHeaders = require('./middleware/securityHeaders');

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers & middleware
app.use(securityHeaders);
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logging (sanitized: only method, path, status - NEVER raw document text)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log basic operational metrics only
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

const documentRoutes = require('./routes/documents');

// Routes (supports both /api/* and direct prefix for local and serverless environments)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/documents', documentRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler for unmatched API routes
app.use(['/api/*', '/documents/*', '/health/*'], (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler (ensures consistent { error: string } response shape)
app.use((err, req, res, next) => {
  console.error('[Error]', err.message || 'Internal server error');
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`NyayMitra server listening on port ${PORT}`);
  });
}

module.exports = app;
