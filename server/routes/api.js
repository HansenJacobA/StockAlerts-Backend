const express = require('express');

const axios = require("axios");
const router = express.Router();

require('dotenv').config();

const { TOKEN } = process.env;

const { Ticker } = require('../../database');

router.get('/api/tickers', (req, res, next) => {
  Ticker.find({})
    .then((data) => res.json(data))
    .catch(next);
});

// CHECK OUT WHERE CLAUSE https://mongoosejs.com/docs/queries.html

router.post('/api/tickers', (req, res, next) => {
  const { ticker, price } = req.body;
  if (ticker.length > 0 && price.length > 0) {
    Ticker.create(req.body)
      .then((data) => res.json(data))
      .catch(next);
  } else {
    res.json({
      error: 'Ticker name and alert price required',
    });
  }
});

router.delete('/api/tickers/:id', (req, res, next) => {
  Ticker.findOneAndDelete({ _id: req.params.id })
    .then((data) => res.json(data))
    .catch(next);
});

const options = {
  method: 'GET',
  url: 'https://alpha-vantage.p.rapidapi.com/query',
  params: {
    interval: '1min',
    function: 'TIME_SERIES_INTRADAY',
    symbol: 'MSFT',
    datatype: 'json',
    output_size: 'compact'
  },
  headers: {
    'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com',
    'X-RapidAPI-Key': TOKEN
  }
};

router.get('/api/ticker', (req, res, next) => {
  const { ticker } = req.body;
  options.params.symbol = ticker;
  axios.request(options)
    .then((result) => {
      res.json(result.data)
    })
    .catch(next);
});

module.exports = router;
