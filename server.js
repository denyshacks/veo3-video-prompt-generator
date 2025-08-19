import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import generateRoute from './api/routes/generate.js';
import generateContinuationRoute from './api/routes/generateContinuation.js';
import generatePlusRoute from './api/routes/generate.plus.js';
import generateNewContRoute from './api/routes/generate.newcont.js';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Add request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes (before static files)
app.use('/api', generateRoute);
app.use('/api', generateContinuationRoute);
app.use('/api', generatePlusRoute);
app.use('/api', generateNewContRoute);

// Serve static files from React build (check both possible locations)
const buildPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'client/build')  // Digital Ocean heroku-postbuild location
  : path.join(__dirname, 'build');        // Local development location
app.use(express.static(buildPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Catch all handler - send React app for any route not handled above
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  console.log(`Serving React app from: ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Build directory: ${buildPath}`);
  console.log(`Static files serving from: ${buildPath}`);
});