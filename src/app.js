const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/error.middleware.js')

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json('app is working')
})

app.use(errorHandler);


module.exports = app



