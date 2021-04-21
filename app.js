const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/database');
const swig = require('swig');
const bcrypt = require('bcryptjs');

mongoose.connect(config.database);
let db = mongoose.connection;
//check connection
db.once('open', ()=>{
    console.log('Connected to mongodb');
});
//check for db errors

db.on('error', (err)=>{
    console.log(err);
});

const User = require('./models/user');
const Task = require('./models/task');

const { json } = require("express");

app.use(express.json());
app.use(express.urlencoded({extended:false}))

var cons = require('consolidate');
// view engine setup
app.engine('html', cons.swig)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res)=>{
    res.render('login');
});

app.get('/register', (req, res)=>{
    res.render('register');
});

app.get('/login', (req, res)=>{
    res.render('login');
});

app.get('/home', (req, res)=>{
    res.render('home');
});

app.get('/task-form', (req, res)=>{
    res.render('task-form');
});

app.get('/home', (req, res)=>{
    res.redirect('home');
});

app.get('/', (req, res) =>{
    Task.find({}, (err, tasks)=>{
        if(err){
            console.log(err);
        } else{
            res.render('home', {
            title: 'Task',
            tasks: tasks
            });   
        } 
    });
});

app.post('/register', async (req, res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if(password === cpassword){
            const registerEmployee = new User({
                email: req.body.email,
                username: req.body.username,
                password:req.body.password,
                confirmpassword:req.body.cpassword,
            })
            const registered = await registerEmployee.save();
            res.status(201).redirect('/');
        }else{
            res.send("Invalid login details");
        }
    } catch(error){
        res.status(400).send(error);
    }
});

app.post('/login', async(req,res) => {
    try{
        const email= req.body.email;
        const password= req.body.password;
        const useremail= await User.findOne({email:email});
        if(useremail.password === password){
            res.status(201).redirect("/home");
        }
        else{
            res.send("Invalid login details");
        }
    }catch(error){
        res.status(400).send("Not a valid Email Id")
    }
});

// const securePassword = async (password) =>{
//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);
//     const passwordMatch = await bcrypt.compare(password, passwordHash);
//     console.log(passwordMatch);
// }

// securePassword("123")


app.listen(3000, ()=>{
console.log('server started on port 3000');
});