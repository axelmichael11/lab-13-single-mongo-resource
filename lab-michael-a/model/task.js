'use strict';

const mongoose = require('mongoose');
const Bars = require('./bars.js');

const taskSchema = mongoose.Schema({
  description: {type:String, required:true},
  list: {type: mongoose.Schema.Types.ObjectId, required:true, ref:'bars'},
});

taskSchema.pre('save', function(next) {
  console.log('pre save doc', this);
  Bars.findById(this.list)
  .then(bar=> {
    let taskIdSet = new Set(bar.task);
    taskIdSet.add(this._id);
    bar.task = Array.from(taskIdSet);
    return bar.save();
  })
  .then(()=>next())
  .catch(()=> next(new Error('validation failed to create task because list doesnt exist!!!')));
});

taskSchema.post('remove', function(document, next){
  console.log('post remove doc',document);
  Bars.findById(document.list)
  .then(bar => {
    bar.task = bar.task.filter(task=> task._id !== document._id);
    return bar.save();
  })
  .then(()=> next())
  .catch(next);
});


module.exports = mongoose.model('task', taskSchema);
