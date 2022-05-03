const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', () => {
  console.log('mongoose connection error');
});

db.once('open', () => {
  console.log('mongoose connected successfully');
});

module.exports = {
  Ticker: require('./models/ticker.model'),
};
