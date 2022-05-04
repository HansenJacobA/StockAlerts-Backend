/* eslint-disable no-loop-func */
const axios = require('axios');

require('dotenv').config();

const { TOKEN } = process.env;

let options = {
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

let intervals = [];
let tickers = [];
let pulse = {
  alert: false,
  message: '',
};

const resetPulse = () => {
  pulse.alert = false;
  pulse.message = '';
};

const getTickers = () => {
  axios.get('http://localhost:3000/api/tickers')
    .then((res) => {
      if (res.data) {
        tickers = res.data;
      }
    })
    .catch((err) => console.log(err));
};

const deleteTicker = (id) => {
  axios.delete(`http://localhost:3000/api/tickers/${id}`)
    .then((res) => {
      if (res.data) {
        getTickers();
      }
    })
    .catch((err) => console.log(err));
};

const checkForMatches = (data, ticker) => {
  const targetPrice = parseInt(ticker.price, 10);
  const aboveOrBelow = ticker.selection;
  const tickerName = ticker.ticker;
  const pkg = data['Time Series (5min)'];
  const prices = Object.values(pkg);

  for (let i = 0; i < prices.length; i += 1) {
    const currPrice = prices[i];
    let high = currPrice['2. high'];
    let low = currPrice['3. low'];
    high = parseInt(high, 10);
    low = parseInt(low, 10);
    if (aboveOrBelow === 'below') {
      if (low <= targetPrice) {
        pulse.alert = true;
        pulse.message = `${tickerName} is at or below ${targetPrice}`;
        deleteTicker(ticker._id);
      }
    } else if (high >= targetPrice) {
      pulse.alert = true;
      pulse.message = `${tickerName} is at or above ${targetPrice}`;
      deleteTicker(ticker._id);
    }
  }
};

const clearIntervals = () => {
  for (let i = 0; i < intervals.length; i += 1) {
    clearInterval(intervals[i]);
  }
  intervals = [];
};

const startIntervals = (alerts) => {
  tickers = alerts;
  clearIntervals();
  if (tickers.length > 0) {
    for (let i = 0; i < tickers.length; i += 1) {
      const id = setInterval(() => {
        const alert = tickers[i];
        options.params.symbol = alert.ticker;
        axios.request(options)
          .then((res) => {
            checkForMatches(res.data, alert);
          })
          .catch((err) => { console.log(err); });
      }, (20000));
      intervals.push(id);
    }
  }
};

module.exports = { startIntervals, pulse, resetPulse };
