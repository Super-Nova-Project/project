'use strict';

const passport = require('passport')
const express = require('express');
const app = express();
const base64 = require('base-64')
const jwt = require('jsonwebtoken')
const cors = require('cors');
const morgan = require('morgan');
const uuid = require('uuid').v4;
const http = require('http').createServer(app);
const socket = require("socket.io");
app.use(cors());
const io = socket(http, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST','DELETE','PUT'],
    credentials: true,
  }
});
let rooms = []
io.on('connection', (socket) => {
  console.log('connect')
  socket.on('createCourse', (room) => {

    rooms.push(room)
  })

  socket.on('give me the rooms', (dd) => {

    io.emit('rooms', rooms)
  })

  socket.on('deleteTheRooms', (id) => {
    console.log(id);
    console.log(rooms);
    rooms= rooms.filter(obj=>obj.course!==id)
    console.log(rooms);
    io.emit('rooms', rooms)
  })


});


const User = require('./model/users-model');
const notFoundHandler = require('./error/not-found');
const errorHandler = require('./error/error-server');
const superagent = require('superagent')
// const routs = require('./auth/router')
const basicAuth = require('./middleware/basic')
const bearerAuth = require('./middleware/bearer')
const cookieSession = require('cookie-session')
const courseRouter = require('./routes/course_routes.js');
const taskRoute = require('./routes/to-do-list-rout.js')
require('./middleware/passport')
// const courseData = require('./middleware/getCourseData');
// const isApproved = require('./middleware/permission');
const mongooseCourse = require('./model/cours-model');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(cors());
app.use(morgan('dev'));
// Process JSON input and put the data on req.body
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieSession({
  name: 'ishaqSession',
  keys: ['btata1', 'btata2']
}))
// Process FORM intput and put the data on req.body
app.use(express.urlencoded({ extended: true }));
app.use(courseRouter);
app.use(taskRoute)









app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})
app.post('/signup', async (req, res) => {
  console.log('Body--------->', req.body);
  let user = new User(req.body);
  const userRecord = await user.save();
  const output = {
    user: userRecord,
    token: userRecord.token
  };
  res.status(201).json(output);
})



app.post('/signin', basicAuth, (req, res, next) => {
  console.log('---signin---', req.btata);
  // console.log('---signin---', req.user);
  const user = {
    user: req.user,
    token: req.user.token
  };
  res.cookie('user', `Bearer ${user.token}`)
  res.status(200).json(user);
});
// app.get('/signin', (req, res) => {
//     res.sendFile(__dirname + '/login.html')
// })
// app.get('/users', bearerAuth, async (req, res, next) => {
//     const users = await User.find({});
//     const list = users.map(user => user.email);
//     res.status(200).json(list);
// });

// app.get('/secret', bearerAuth, async (req, res, next) => {
//     res.status(200).send("Welcome to the secret area!")
// });

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile']
  }));

app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/auth/google/success',
  failureRedirect: '/auth/google/failure'
}));


app.get('/auth/google/failure', (req, res) => {
  res.send('failed login')
})
app.get('/auth/google/success', async (req, res) => {
  try {
    console.log(req.session.passport);

    let token = base64.encode(`${req.session.passport.user.email}:${req.session.passport.user.password}`)
    let tokenObject = {
      email: req.session.passport.user.email,
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    }
    let a = jwt.sign(tokenObject, process.env.SECRET)
    const validUser = await User.authenticateWithToken(a);
    let myObj = {
      user: validUser,
      token: validUser.token
    }
    res.status(200).send(myObj)
  } catch (err) {
    console.log(err);
  }
})

function start() {
  const PORT = process.env.PORT;
  http.listen(PORT, () => {
    console.log(`I'm in port ${PORT}`)
  })
}
app.use('*', notFoundHandler);
app.use(errorHandler);
module.exports = {
  app,
  start
}