require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect DB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Routes
app.use('/api/payment', require('./routes/payment'));
app.use('/api/webhook', require('./routes/webhook'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
