/*
 * This file reads the env file for the port and environment and
 * starts the Express Server.
 * This opens the endpoints for capturing log information, errors, and timing.
 * Author: Sri Hari Rao Nadella
 * Version: 2.0
 * Note: Please contact the Author for any changes to this file
*/
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const ESAPI = require('node-esapi');

// Set the env path
dotenv.config({ path: '../.env' });

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const environment = process.env.NODE_ENV;

const port = process.env[`PORT_${environment}`] || 3000;

console.log('Environment: ', environment, ' Port:', port);

// Here we import our Logger file and instantiate a logger object
var logger = require('./logs-logger').Logger;
var timelogger = require('./timings-logger').Logger;

 // CORS FOR EXPRESS JS
 app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  next();
});

app.post('/log/info', function(req, res) {
  // const req_body_sanitized = ESAPI.encoder().encodeForJavaScript(req.body);
  const log = JSON.stringify(req.body).replace(/:/g, "=").replace(/"/g, "").replace(/{/g,"").replace(/}/g,"");
  logger.log(log);
  res.send({"status": "logged"});
});

app.post('/log/error', function(req, res) {
  const log = JSON.stringify(req.body).replace(/:/g, "=").replace(/"/g, "").replace(/{/g,"").replace(/}/g,"");
  // logger.log(ESAPI.encoder().encodeForHTML(log));
  logger.log(log);
  res.send({"status": "logged"});
});

app.post('/log/time', function(req, res) {
  const timelog = JSON.stringify(req.body).replace(/:/g, "=").replace(/"/g, "").replace(/{/g,"").replace(/}/g,"");
  // timelogger.time(ESAPI.encoder().encodeForHTML(timelog));
  timelogger.time(timelog);
  res.send({"status": "logged"});
});

const server = http.createServer(app);
server.listen(port, () => console.log('Logger Application Running in NodeJs using ExpressJs on port ' + port));
