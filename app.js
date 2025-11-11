const express = require('express');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const AppError = require('./utils/appError');
const app = express();
app.use(morgan('tiny'));
app.use(express.json());

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);

// HANDLING unhandled routes 
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`,404))
})

module.exports = app;
