'use strict';

// npm modules
const faker = require('faker');

// app modules
const mockBar = require('./mock-bar.js');
const Task = require('../../model/task.js');

const mockTask = module.exports = {};

mockTask.createOne = () => {
  let result = {};
  return mockBar.createOne()
  .then(bar => {
    result.bar = bar;
    return new Task({
      content: faker.random.words(10),
      bar: bar._id.toString(),
    })
    .save();
  })
  .then(task => {
    result.task = task;
    return result;
  });
};

mockTask.createMany = (n) => {
  let result = {};
  return mockBar.createOne()
  .then(bar => {
    result.bar = bar;
    let taskSavePromises = new Array(n).fill(0)
      .map(() => new Task({
        content: faker.random.words(10),
        bar: bar._id.toString(),
      }).save());
    return Promise.all(taskSavePromises);
  })
  .then(tasks => {
    result.tasks = tasks;
    return result;
  });
};
