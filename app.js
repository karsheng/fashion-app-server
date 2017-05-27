// Main starting point of the app
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// DB Setup
if (process.env.NODE_ENV !== 'test') {
	mongoose.connect('mongodb://localhost:peach/peach');	
}

// App Setup
app.use(morgan('combined')); // morgan is a middleware logging framework 
app.use(bodyParser.json({ type: '*/*' })); // parse all request to json
router(app);


app.use((err, req, res, next) => {
	res.status(422).send({ error: err.message });
});

module.exports = app;