const express = require('express');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const app = express();
app.use(morgan('tiny'));
app.use(express.json());

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);

module.exports = app;
