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
var jobApplicationsRouter = require('./routes/jobApplications');
var jobsRouter = require('./routes/jobs');
var accountInfoRouter = require('./routes/accountInfo');
var projectRouter = require('./routes/project');

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
app.use('/api/job-applications', jobApplicationsRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/jobs', jobApplicationsRouter); // handles /api/jobs/:id/apply
app.use('/api/account-info', accountInfoRouter);
app.use('/api/project', projectRouter);

module.exports = app;
