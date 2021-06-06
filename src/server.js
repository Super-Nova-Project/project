'use strict';
const passport = require('passport')
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const User = require('./model/users-model');
const notFoundHandler = require('./error/not-found');
const errorHandler = require('./error/error-server');
// const routs = require('./auth/router')
const basicAuth = require('./middleware/basic')
const bearerAuth = require('./middleware/bearer')
const cookieSession = require('cookie-session')
require('./middleware/passport')
const courseData = require('./middleware/getCourseData');
const isApproved = require('./middleware/permission');
const mongooseCourse = require('./model/cours-model');
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
// app.use(routs)

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

app.get('/course/:courseID/grades', bearerAuth, courseData, isApproved, (req, res) => {
    // let courseID = req.params.courseID;
    console.log('------------hi------------', req.course);
    res.status(200).json(req.course.grades)
})
app.post('/course/:courseID/grades', (req, res) => {
    try {
        const id = req.params.courseID;
        const email = req.user.email;
        const myCourse = await mongooseCourse.findById(id);
        if (!myCourse.members.includes(email)) next('you are not enrolled in this course')
        if (myCourse) {
            
            myCourse.grades.forEach(element => {
                if(element.email == email) element = req.body;
            });
            await myCourse.save()
            res.status(201).json(myCourse);
        } else {
            next('course not found')
        }
    } catch (err) {
        res.status(401).json(err)
    }
})
app.post('/create-course', bearerAuth, async (req, res) => {
    req.body.owner = req.user.email
    req.body.members = [];
    req.body.members.push(req.user.email)
    let course = new mongooseCourse(req.body);
    const newCourse = await course.save();
    res.status(201).json(newCourse);
})
app.post('/join-course', bearerAuth, async (req, res, next) => {
    let id = req.body.id;
    const email = req.user.email;
    const myCourse = await mongooseCourse.findById(id);
    if (myCourse.members.includes(email)) next('you are already enrolled')
    if (myCourse) {
        let obj = {
            email: email,
            midExam: 0,
            firstExam: 0,
            secondExam: 0,
            quizOne: 0,
            quizTwo: 0,
            quizThree: 0,
            finalExam: 0,
            overAll: 0
        }
        myCourse.members.push(email);
        myCourse.grades.push(obj);
        await myCourse.save()
        res.status(201).json(myCourse);
    } else {
        next('course not found')
    }
})

app.post('/signin', basicAuth, (req, res, next) => {
    console.log('---signin---', req.body);
    console.log('---signin---', req.user);
    const user = {
        user: req.user,
        token: req.user.token
    };
    res.cookie('user', `Bearer ${user.token}`)
    res.status(200).json(user);
});
app.get('/signin', (req, res) => {
    res.sendFile(__dirname + '/login.html')
})
app.get('/users', bearerAuth, async (req, res, next) => {
    const users = await User.find({});
    const list = users.map(user => user.email);
    res.status(200).json(list);
});

app.get('/secret', bearerAuth, async (req, res, next) => {
    res.status(200).send("Welcome to the secret area!")
});

app.get('/auth/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    }
    ));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
    }));

app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['public_profile', 'email'] }
    ));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/auth/facebook/success',
        failureRedirect: '/auth/facebook/failure'
    }));
app.get('/auth/facebook/success', (req, res) => {
    console.log('inside -----------------------------/auth/facebook/callback', req.body);
    res.send('facebook done')
});
app.get('/auth/facebook/failure', (req, res) => {
    res.send('failed login')
})
app.get('/auth/google/failure', (req, res) => {
    res.send('failed login')
})
app.get('/auth/google/success', (req, res) => {
    console.log(' in /auth/google/success route--------------', req.body);
    res.send('success login')
})
function start() {
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`I'm in port ${PORT}`)
    })
}
app.use('*', notFoundHandler);
app.use(errorHandler);
module.exports = {
    app,
    start
}