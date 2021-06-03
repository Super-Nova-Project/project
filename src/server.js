'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const notFoundHandler = require('./middleware/404');
const errorHandler = require('./middleware/500');
const routs = require('./auth/router')

app.use(cors());
app.use(morgan('dev'));
// Process JSON input and put the data on req.body
app.use(express.json());

// Process FORM intput and put the data on req.body
app.use(express.urlencoded({ extended: true }));
app.use(routs)



function start(){
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`I'm in port ${PORT}`)
    })
}
app.use('*', notFoundHandler);
app.use(errorHandler);
module.exports = {
    app,
    start
}