'use strict';

// load env
require('dotenv').config({path: `${__dirname}/.test.env`});

// npm modules
const expect = require('expect');
const superagent = require('superagent');

// app modules
const clearDB = require('./lib/clear-db.js');
const server = require('../lib/server.js');
const Bar = require('../model/bars.js');
const mockBar = require('./lib/mock-bar.js');
const mockTask = require('./lib/mock-task.js');

// module logic
const API_URL = `http://localhost:${process.env.PORT}`;

describe('testing /api/tasks', () => {
  before(server.start);
  after(server.stop);
  afterEach(clearDB);

  describe('testing POST /api/tasks', () => {
    it('should create a task', () => {
      let tempBar;
      let tempTask;
      return mockBar.createOne()
      .then(bar => {
        tempBar = bar;
        console.log('this is tempBar in post request..^^^^',tempBar);
        return superagent.post(`${API_URL}/api/tasks`)
        .send({
          description: 'hello world',
          list: bar._id.toString(),
        });
      })
      .then(res => {
        // console.log('this is the response!',res);
        expect(res.status).toEqual(200);
        expect(res.status).toEqual(200);
        expect(res.body._id).toExist();
        expect(res.body.description).toEqual('hello world');
        console.log('tempBar._id.toString()^^^',tempBar._id.toString());
        expect(res.body.list).toEqual(tempBar._id.toString());
        tempTask = res.body;
        return Bar.findById(tempBar._id);//not sure about this one!?
      });
    });
    it('should respond with a 400 for having a bad list id ', () => {
      return superagent.post(`${API_URL}/api/tasks`)
    .send({
      content: 'hello world',
      list: 'nahhhhhdude',
    })
    .then(res => {throw res})
    .catch(res => {
      expect(res.status).toEqual(400);
    });
    });
    it('should respond with a 400... because it has no body', () => {
      return superagent.post(`${API_URL}/api/tasks`)
      .send({
        content: 'hello world',
        list:'345345nahhhhdude',
      })
      .then(res => {throw res})
      .catch(res => {
        expect(res.status).toEqual(400);
      });
    });


    it('should be a 409 becuase it has the same name property twice..', ()=>{
      let tempBar;
      let tempTask;
      return mockBar.createOne()
      .then(bar => {
        tempBar = bar;
        // console.log('this is tempBar in post request..^^^^',tempBar);
        return superagent.post(`${API_URL}/api/tasks`)
        .send({
          description: 'hello world',
          list: bar._id.toString(),
        });
      })
      .then(res => {throw res})
      .catch(res => {
        expect(res.status).toEqual(409);
      });
    });

  });

  //POST REQUEST Tests
  describe('testing PUT /api/tasks/:id', () => {
    it('should respond with the updated task', () => {
      let tempBar, tempTask;
      return mockTask.createOne()
      .then(({list, task}) => {
        tempTask = task;
        tempBar = list;
        return superagent.put(`${API_URL}/api/tasks/${tempTask._id.toString()}`)
        .send({
          description: 'Updated',
        });
      })
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.body.content).toEqual('hello world');
        expect(res.body._id).toEqual(tempTask._id);
        expect(res.body.list).toEqual(tempBar._id);
        return Bar.findById(tempBar._id);
      })
      .then(bar => {
        expect(bar.tasks.length).toEqual(1);
        expect(bar.tasks[0].toString()).toEqual(tempBar._id.toString());
      });
    });
  });





});
