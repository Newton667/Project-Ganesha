var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var freelancersRouter = require('./routes/freelancerDashboard');
var employersRouter = require('./routes/employerDashboard');
var freelancersOnboardRouter = require('./routes/freelancerSignUp');
var employersersOnboardRouter = require('./routes/employerSignUp');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/freelancerDashboard', freelancersRouter);
app.use('/api/employerDashboard', employersRouter);
app.use('/api/freelancerSignUp', freelancersOnboardRouter);
app.use('/api/employerSignUp', employersersOnboardRouter);

module.exports = app;
