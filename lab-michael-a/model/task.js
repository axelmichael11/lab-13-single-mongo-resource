'use strict';

const mongoose = require('mongoose');
const Bars = require('./bars.js');

const taskSchema = mongoose.Schema({
  description: {type:String, required:true},
  bars: {type: mongoose.Schema.Types.ObjectId, required:true, ref:'bars'},
});

taskSchema.pre('save', function(next) {
  console.log('pre save doc', this);
  Bars.findById(this.bars)
  .then(bar=> {
    // let taskIdSet = new Set(bar.task);
    // taskIdSet.add(this._id);
    // bar.task = Array.from(taskIdSet);
    if (!bar.tasks.includes(this._id))
      bar.tasks.push(this);
    return bar.save();
  })
  .then(()=>next())
  .catch((err)=>{ console.log(err);
    next(new Error('validation failed to create task because list doesnt exist!!!'));
  });
});

taskSchema.post('remove', function(document, next){
  console.log('post remove doc',document);
  Bars.findById(document.tasks)
  .then(bar => {
    bar.tasks = bar.tasks.filter(task=> task._id !== document._id);
    return bar.save();
  })
  .then(()=> next())
  .catch(next);
});




module.exports = mongoose.model('task', taskSchema);
