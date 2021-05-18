const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/database');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash')
const Sequelize = require('sequelize');
const Op = Sequelize.Op

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



//middleware of express
app.use(express.json());
app.use(express.urlencoded({extended:false}))

// view engine setup
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

//middleware for sessions
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized:true
}))

//Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res)=>{
    const errors = req.flash().error || [];

    res.render('login', {errors});
});

app.get('/register', (req, res)=>{
    res.render('register');
});

app.get('/login', (req, res)=>{
    res.render('login');
});

app.get('/home', (req, res)=>{
    Task.find({}, (err, tasks)=>{
        
        if(!req.user){
            req.flash('danger', 'Not authorized');
            res.redirect('/');
        }else{
            if(err){
                console.log(err);
    
            } else{
                res.render('home', {
                tasks: tasks,
                username: req.user.username                
            });   
            }} 
        });
    });


app.get('/task-form',(req, res)=>{
    res.render('task-form');
});

app.post('/task-form', (req, res)=>{
    let task = new Task();
    task.title = req.body.title;
    task.task = req.body.task;
    task.author = req.user.username;
    task.save(res.redirect('/home'));
});

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
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
            if(await User.findOne({email: req.body.email}) || await User.findOne({username: req.body.username}) ){
                req.flash('success', 'User already exists');
                res.locals.message = req.flash();
                res.render('register');
            }else{
            await registerEmployee.save();
            res.status(201).redirect('/');
            }
        }else{
            req.flash('danger', 'Invalid login credentials');
            res.locals.message = req.flash();
            res.render('register');            
        }
    } catch(error){
        res.status(400).send(error);
    }
});

 // Login Process
 app.post('/login', async (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/home',
      failureRedirect: '/',
      failureFlash: true
    })(req, res, next);
  });

app.get('/edit-task/:id',(req,res)=>{
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

app.post('/delete', (req, res) => {
    const check = req.body.delete;
    Task.findByIdAndRemove(check, (err)=>{
        if(!err){
            res.redirect('/home');
        }
    })
});

app.get('/home', (res,req) => {
    const {search} = req.query;

    Task.findAll({title: {title: { [Op.like]: '%' + search + '%' }}})
    .then(tasks => res.render('home', {tasks}))
    .catch(err => comsole.log(err));
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });


app.listen(8000, ()=>{
console.log('server started on port 8000');
});