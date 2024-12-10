/*
 * This file reads the env file for the environment and log file name and
 * writes the INFO and ERROR logs to the file
 * Creates a stream.Writable to a file which is rotated.
 * Rotation behavior can be deeply customized; classical UNIX logrotate behavior can be used.
 * Author: Sri Hari Rao Nadella
 * Version: 2.0
 * Note: Please contact the Author for any changes to this file
*/
// Firstly we'll need to import the fs library
const fs = require('fs');
const rfs = require('rotating-file-stream');
const dotenv = require('dotenv');

const environment = process.env.NODE_ENV;
const logs_path = process.env[`LOGS_PATH_${environment}`];
const logs_file = process.env.LOG_FILE_NAME;

// Create File Generator Functions
const pad = (num) => {
  return (num > 9 ? "" : "0") + num;
}

/**
 * Generates the file name using the time and index
 * @param {*} time
 * @param {*} index
 * @returns
 */
const generator = (time, index) => {
  if(! time)
      return logs_file;

  var month  = time.getFullYear() + "" + pad(time.getMonth() + 1);
  var day    = pad(time.getDate());
  var hour   = pad(time.getHours());
  var minute = pad(time.getMinutes());

  return `${month}/${month}/${day}-${hour}${minute}-${index}-${logs_file}`;
}



// Logs File Rotation
const logs_rstream = rfs.createStream(generator, {
  path: logs_path,
  size:     '100M',
  interval: '1d',
  compress: 'gzip',
  encoding: 'utf-8'
});


logs_rstream.on('error', function(err) {
  console.log('LogsLogger => Something wrong with writting the log file', err);
});

// next we'll want make our Logger object available to whatever file references it.
var Logger = exports.Logger = {};

Logger.log = (msg) => {
  var msgStr = msg.replace
  var message = `${new Date().toISOString()}:${msg}\r\n\n`;
  logs_rstream.write(message);
};

