const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create schema for Ticker
const TickerSchema = new Schema({
  ticker: String,
  price: String,
  selection: String,
  user: String,
});

// Create model for Ticker
const Ticker = mongoose.model('ticker', TickerSchema);

module.exports = Ticker;
