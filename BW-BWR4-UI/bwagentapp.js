  var fallback = require('express-history-api-fallback')
  const express = require('express');
  const http = require('http');
  const path = require('path');
  
  const app = express();
  
  const port = process.env.PORT || 8080;
  
  const applicationRoot = __dirname + '/bwagentautoquote';
  
  
  app.use(express.static(applicationRoot));
  app.use(fallback('index.html', { root: applicationRoot }))
  
  app.get('/*', (req,res) => {
      res.sendFile(path.join(__dirname))
  });
  
  const server = http.createServer(app);
  server.listen(port, () => {
    console.log('Select 4.0 Auto Quote Application Running in NodeJs using ExpressJs....', applicationRoot) ;
  
  });
  