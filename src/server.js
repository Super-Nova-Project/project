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

const io = socket(http, {
  cors: {
      origin: "*",
      methods: ['GET', 'POST']
  }
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
const taskRoute = require('./routes/to-do-list-rout')
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



// create sio connection 

const users = {};
const socketToRoom = {};
io.on('connection', socket => {
    socket.on("join room", roomID => {
        socket.join(roomID)
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);


        socket.emit("all users", usersInThisRoom);

        socket.on('startShare', () => {
            socket.emit("all myUsers", users);

        })

        socket.on("sending signal", payload => {
            io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
        });

        socket.on("returning signal", payload => {
            io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
        });

        socket.on('disconnect', () => {
            console.log('socket.id', socket.id);
            const roomID = socketToRoom[socket.id];
            let room = users[roomID];
            if (room) {
                room = room.filter(id => id !== socket.id);
                users[roomID] = room;
            }
            socket.broadcast.emit('userLeft', socket.id)

        });
    })
    socket.on('chatRoom', roomID => {
        socket.join(roomID);
        socket.emit('userId-Joined');
        socket.on('message', ({ name, message }) => {
            console.log(message);
            io.to(roomID).emit('message', { name, message })
        })
    })

});





app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})
app.post('/signup', async(req, res) => {
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
app.get('/auth/google/success', async(req, res) => {
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