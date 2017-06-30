'use strict';



const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);


const app = express();


app.use(cors());
app.use(morgan('dev'));


app.use(require('../route/bar-routes.js'));
app.use(require('../route/task-routes.js'));

app.all('/api/*', (req,res,next)=> {
  res.sendStatus(404);
});

app.use(require('./error-middleware.js'));


const server = module.exports = {};

server.isON = false;


server.start = () => {
  return new Promise((resolve, reject) => {
    if(!server.isOn){
      server.http = app.listen(process.env.PORT, () => {
        server.isOn = true;
        console.log('server up', process.env.PORT);
        resolve();
      });
      return;
    }
    reject(new Error('server is running!!!'));
  });
};

server.stop = () => {
  return new Promise((resolve, reject) => {
    if(server.http && server.isOn){
      return server.http.close(() => {
        server.isOn = false;
        console.log('server down');
        resolve();
      });
    }
    reject(new Error('the server is not running!!!'));
  });
};
