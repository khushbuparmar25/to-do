const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/database');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');

mongoose.connect(config.database, { useNewUrlParser: true , useUnifiedTopology: true  });
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
const user = require('./models/user');


app.use(express.json());
app.use(express.urlencoded({extended:false}))

// view engine setup
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized:true
}))

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res)=>{
    res.render('login');
});

app.get('/register', (req, res)=>{
    res.render('register');
});

app.get('/login', (req, res)=>{
    res.render('login');
});

app.get('*', (req,res,next)=>{
    res.locals.user = req.user || null;
    next();
});

app.get('/home', (req, res)=>{
    Task.find({}, (err, tasks, user)=>{
        if(err){
            console.log(err);

        } else{
            res.render('home', {
            tasks: tasks,
            username: req.user.username
        });   
        } 
    });
});



app.get('/task-form',ensureAuthenticated, (req, res)=>{
    res.render('task-form');
});


app.post('/task-form', (req, res)=>{


    let task = new Task();
    task.title = req.body.title;
    task.task = req.body.task;
    task.author = req.user.username;
    task.save(res.redirect('/home'));


});



app.post('/register', async (req, res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if(password === cpassword){
            const passwordHash = await bcrypt.hash(password, 10);

            const registerEmployee = new User({
                email: req.body.email,
                username: req.body.username,
                password: passwordHash,
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

 // Login Process
 app.post('/login', async (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/home',
      failureRedirect: '/'
    })(req, res, next);
  });
  

// app.post('/login', async(req,res) => {
//     try{
//         const email= req.body.email;
//         const password= req.body.password;
//         const useremail= await User.findOne({email:email});
//         const passwordMatch = await bcrypt.compare(password, useremail.password);
 
//         if(passwordMatch){
//             res.status(201).redirect("/home");
//         }
//         else{
//             res.send("Invalid login details");
//         }
//     }catch(error){
//         res.status(400).send("Not a valid Email Id")
//     }
// });



app.get('/edit-task/:id',ensureAuthenticated, (req,res)=>{
    Task.findById(req.params.id, (err, task)=>{

        res.render('edit-task', {
            task:task
           
        });
    });
});

app.post('/edit-task/:id', (req,res)=>{
    let task = {};
    task.title=req.body.title;
    task.task=req.body.task;

    let query = {_id:req.params.id}

    Task.updateOne(query, task, (err)=>{
        if(err){
            console.log(err);
            return;
        }else{
            res.redirect('/home');
        }
    });
});



function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();

    } else {
        res.redirect('/');
    }
}

app.listen(3000, ()=>{
console.log('server started on port 3000');
});