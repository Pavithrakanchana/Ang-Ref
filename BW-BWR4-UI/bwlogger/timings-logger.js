/*
 * This file reads the env file for the environment and log file name and
 * writes the Elapsed times for all the outbound calls from App to timing file
 * Creates a stream.Writable to a file which is rotated.
 * Rotation behavior can be deeply customized; classical UNIX logrotate behavior can be used.
 * Author: Sri Hari Rao Nadella
 * Version: 2.0
 * Note: Please contact the Author for any changes to this file
*/

// Firstly we'll need to import the fs library
const fs = require('fs');
const rfs    = require('rotating-file-stream');

const logs_time_file = process.env.LOG_TIMING_FILE_NAME;

// Create File Generator Functions
const pad = (num) => {
  return (num > 9 ? "" : "0") + num;
}

const generator = (time, index) => {
  if(! time)
      return logs_time_file;

  var month  = time.getFullYear() + "" + pad(time.getMonth() + 1);
  var day    = pad(time.getDate());
  var hour   = pad(time.getHours());
  var minute = pad(time.getMinutes());

  return `${month}/${month}${day}-${hour}${minute}-${index}-${logs_time_file}`;
}

const environment = process.env.NODE_ENV;
const logs_path = process.env[`LOGS_PATH_${environment}`];

const timingfilepath = `${logs_path}/timing`;


// File Rotation
const timing_rstream = rfs.createStream(generator, {
  path: timingfilepath,
  size:     '100M',
  interval: '1d',
  compress: 'gzip',
  encoding: 'utf-8'
});

/*
compress: function (source, dest) { // Modified compress function, add extension .gz
    // Also removes logs older than 30 days
    return 'cat ' + source + ' | gzip -c9 > ' + dest + '.gz; rm -f ' + dest + '; find ./logs/*server.log.gz -mtime +30 -delete';// test: -mmin +3
  }
*/

timing_rstream.on('error', function(err) {
  console.log('TimingLogger => Something wrong with writting the log timing file', err);
});

// next we'll want make our Logger object available to whatever file references it.
var Logger = exports.Logger = {};

Logger.time = (msg) => {
  var message = `${new Date().toISOString()}:${msg}\r\n\n`;
  timing_rstream.write(message);
};


