const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const multer = require('multer');

module.exports = function getExpressApp(handler) {
  const app = express();
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(multer().none());
  app.use((req, res) => {
    handler.processRequest(req, res);
  });
  return app;
};
