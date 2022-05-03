const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const routes = require('./routes/api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/dist')));

app.use('/', routes);

app.use((err, req, res, next) => {
  console.log(err);
  next();
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
