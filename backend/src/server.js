require('reflect-metadata');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const AppDataSource = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const { authenticateToken } = require('./middlewares/auth');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const locationRoutes = require('./routes/locations');
const saleRoutes = require('./routes/sales');
const reportRoutes = require('./routes/reports');
const companyRoutes = require('./routes/companies');
const roleRoutes = require('./routes/roles');
const shopifyRoutes = require('./routes/shopifyRoutes');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const fs = require('fs');
  
  // Try multiple possible locations for the frontend build
  const possiblePaths = [
    path.join(__dirname, '../frontend-build'),
    path.join(__dirname, '../../frontend/build'),
    path.join(__dirname, './frontend-build')
  ];
  
  console.log('🔍 Looking for frontend build files...');
  possiblePaths.forEach(p => {
    console.log(`  Checking: ${p}`);
    try {
      const stats = fs.statSync(p);
      console.log(`  ✅ Found: ${p} (${stats.isDirectory() ? 'directory' : 'file'})`);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(p);
        console.log(`    Contents: ${files.join(', ')}`);
      }
    } catch (err) {
      console.log(`  ❌ Not found: ${p}`);
    }
  });
  
  let buildPath = null;
  for (const possiblePath of possiblePaths) {
    try {
      fs.accessSync(possiblePath);
      buildPath = possiblePath;
      break;
    } catch (err) {
      // Path doesn't exist, try next one
    }
  }
  
  if (buildPath) {
    app.use(express.static(buildPath));
    console.log(`📁 Serving frontend from: ${buildPath}`);
  } else {
    console.log('⚠️  Frontend build not found, serving API only');
  }
} else {
  console.log('🔧 Development mode - not serving static files');
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/locations', authenticateToken, locationRoutes);
app.use('/api/sales', authenticateToken, saleRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/companies', authenticateToken, companyRoutes);
app.use('/api/roles', authenticateToken, roleRoutes);
app.use('/api/shopify', shopifyRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user to their company room for real-time updates
  socket.on('join-company', (companyId) => {
    socket.join(`company-${companyId}`);
    console.log(`Client ${socket.id} joined company room: company-${companyId}`);
  });

  // Join user to their location room for location-specific updates
  socket.on('join-location', (locationId) => {
    socket.join(`location-${locationId}`);
    console.log(`Client ${socket.id} joined location room: location-${locationId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware (must be last)
app.use(errorHandler);

// Catch-all handler: Send back React's index.html file for client-side routing
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Only return 404 for API routes that don't exist
    if (req.path.startsWith('/api/')) {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    } else {
      // Serve React app for all non-API routes
      const path = require('path');
      const fs = require('fs');
      
      // Try multiple possible locations for index.html
      const possiblePaths = [
        path.join(__dirname, '../frontend-build', 'index.html'),
        path.join(__dirname, '../../frontend/build', 'index.html'),
        path.join(__dirname, './frontend-build', 'index.html')
      ];
      
      let indexPath = null;
      for (const possiblePath of possiblePaths) {
        try {
          fs.accessSync(possiblePath);
          indexPath = possiblePath;
          break;
        } catch (err) {
          // Path doesn't exist, try next one
        }
      }
      
      if (indexPath) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({
          success: false,
          message: 'Frontend not found',
          path: req.originalUrl
        });
      }
    }
  });
} else {
  // 404 handler for API routes only in development
  app.get('*', (req, res) => {
    // Only return 404 for API routes that don't exist
    if (req.path.startsWith('/api/')) {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    } else {
      // For non-API routes, let the frontend handle them
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    }
  });
}

// Initialize database and start server
async function startServer() {
  try {
    // Skip database initialization for demo
    console.log('⚠️  Running without database connection (demo mode)');

    // Set production environment if running on Railway
    if (process.env.RAILWAY_ENVIRONMENT || process.env.PORT) {
      process.env.NODE_ENV = 'production';
    }
    
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`⚠️  Note: Database features disabled in demo mode`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  try {
    if (AppDataSource && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  } catch (error) {
    console.log('Database already disconnected');
  }
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  try {
    if (AppDataSource && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  } catch (error) {
    console.log('Database already disconnected');
  }
  server.close(() => {
    console.log('Process terminated');
  });
});

startServer();

module.exports = app;
