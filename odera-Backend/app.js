var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Routers
var indexRouter = require('./routes/index');
var freelancersRouter = require('./routes/freelancerDashboard');
var employersRouter = require('./routes/employerDashboard');
var freelancersOnboardRouter = require('./routes/freelancerSignUp');
var employersOnboardRouter = require('./routes/employerSignUp');
var employerSettingsRouter = require('./routes/employerSettings');
var freelancerSettingsRouter = require('./routes/freelancerSettings');
var jobsRouter = require('./routes/jobs'); // ← NEW

var app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/api/freelancerDashboard', freelancersRouter);
app.use('/api/employerDashboard', employersRouter);
app.use('/api/freelancerSignUp', freelancersOnboardRouter);
app.use('/api/employerSignUp', employersOnboardRouter);
app.use('/api/employer/settings', employerSettingsRouter);
app.use('/api/freelancer/settings', freelancerSettingsRouter);
app.use('/api/jobs', jobsRouter); // ← NEW

module.exports = app;
