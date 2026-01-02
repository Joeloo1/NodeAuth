const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./config/logger')
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController')

const app = express();
app.use(morgan('tiny'));
app.use(express.json());

// Request Limiting from the same IP
const Limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "To many request from this IP, Please try again in an hour",
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      path: req.path,
    });
  },
});

app.use("/api", Limiter);

// Log all Request
app.use((req, res, next) =>{
  logger.http("Incoming request...", {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);

// HANDLING unhandled routes 
app.use( (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`,404))
})

app.use(globalErrorHandler)

module.exports = app;
