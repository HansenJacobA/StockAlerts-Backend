const express = require('express');

const axios = require('axios');

const router = express.Router();

require('dotenv').config();

const { TOKEN } = process.env;

const { Ticker } = require('../../database');

const {
  startIntervals,
  pulse,
  resetPulse,
} = require('../intervolometer/intervals');

router.post('/api/resetpulse', (req, res) => {
  resetPulse();
  res.json('RESET');
});

router.get('/api/pulse', (req, res) => {
  res.json(pulse);
});

router.get('/api/tickers', (req, res, next) => {
  Ticker.find({})
    .then((data) => {
      startIntervals(data);
      res.json(data);
    })
    .catch(next);
});

const options = {
  method: 'GET',
  url: 'https://alpha-vantage.p.rapidapi.com/query',
  params: {
    interval: '5min',
    function: 'TIME_SERIES_INTRADAY',
    symbol: 'MSFT',
    datatype: 'json',
    output_size: 'compact',
  },
  headers: {
    'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com',
    'X-RapidAPI-Key': TOKEN,
  },
};

router.post('/api/tickers', (req, res, next) => {
  const { ticker, price } = req.body;
  if (ticker.length > 0 && !isNaN(price)) {
    options.params.symbol = ticker;
    axios.request(options)
      .then((result) => {
        if (result.data['Error Message']) {
          res.json({
            error: 'Invalid ticker name',
          });
        } else if (result.data.message) {
          res.json({
            error: 'You have exceeded the rate limit per minute for your plan, BASIC, by the API provider',
          });
        } else {
          Ticker.create(req.body)
            .then((response) => res.json(response.data))
            .catch(next);
        }
      })
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

module.exports = router;
