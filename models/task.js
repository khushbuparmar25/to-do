let mongoose = require('mongoose');

let taskSchema = mongoose.Schema({

    title:{
        type:String,
        required: true
    },
    task:{
        type: String,
        required: true
    },
},{ collection: 'tasks'});

let Task = module.exports = mongoose.model('Task', taskSchema);
