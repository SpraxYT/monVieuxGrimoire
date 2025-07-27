const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

// MongoDB connection string - replace with your own connection string in .env file
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mon-vieux-grimoire', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB!'))
  .catch(() => console.log('MongoDB connection failed!'));

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));

// Rate limiter to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', limiter); // Apply rate limiting to authentication endpoints

//DDOS
const limiterGlobal = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiterGlobal); // Apply rate limiting to authentication endpoints

// CORS configuration
// Configuration CORS détaillée pour résoudre les problèmes d'images
app.use(cors({
  origin: '*',  // En production, spécifiez l'origine exacte
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Configuration spécifique pour les images statiques
app.use('/images', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Parse request bodies
app.use(express.json());

// Configure image directory for static files
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
