'use strict';

const supergoose = require('@code-fellows/supergoose');
const server = require('../src/server.js').app;
const mockRequest = supergoose(server);
let token, token2;
let newCourse, newAss, newQuiz, users;
let assID, quizID;
beforeAll(() => {
  users = {
    user1: {
      email: 'malak@gmail.com',
      password: '1111',
      firstName: 'Malak',
      lastName: 'Al-Momani',
      bithDate: '1996-04-10',
      gender: 'female'
    },
    user2: {
      email: 'ali@gmail.com',
      password: '1111',
      firstName: 'Ali',
      lastName: 'Al-Zoubi',
      bithDate: '1989-01-24',
      gender: 'male'
    }
  }
  newCourse = {
    name: 'Code401',
    description: 'Midterm Project'
  }

  newAss = {
    assignmentTitle: 'first',
    assignmentText: 'welcome to 401 medterm project',
    due_date: '2021-09-09'
  }

  newQuiz = {
    timer: 30,
    quizText: 'test create quiz',
    quizTitle: 'test2'
  }
});


describe('Authentication Routes', () => {

  it('can Sign up', async () => {
    const response = await mockRequest.post('/signup').send(users.user1);
    const userObject = response.body;
    const response2 = await mockRequest.post('/signup').send(users.user2);
    const userObject2 = response2.body;

    expect(response.status).toBe(201);
    expect(userObject.token).toBeDefined();
    expect(userObject.user._id).toBeDefined();
    expect(userObject.user.email).toEqual(users.user1.email);

    expect(response2.status).toBe(201);
    expect(userObject2.token).toBeDefined();
    expect(userObject2.user._id).toBeDefined();
    expect(userObject2.user.email).toEqual(users.user2.email);
  });

  it('can signin with basic', async () => {

    const response = await mockRequest.post('/signin')
      .auth(users.user1.email, users.user1.password);

    const userObject = response.body;

    const response2 = await mockRequest.post('/signin')
      .auth(users.user2.email, users.user2.password);

    const userObject2 = response2.body;


    // console.log(userObject);
    expect(response.status).toBe(200);
    expect(userObject.token).toBeDefined();
    expect(userObject.user._id).toBeDefined();
    expect(userObject.user.email).toEqual(users.user1.email);
    token = userObject.token;

    expect(response2.status).toBe(200);
    expect(userObject2.token).toBeDefined();
    expect(userObject2.user._id).toBeDefined();
    expect(userObject2.user.email).toEqual(users.user2.email);
    token2 = userObject2.token;

  });

  it('basic auth fails with known user and wrong password ', async () => {

    const response = await mockRequest.post('/signin')
      .auth('malak.gmail.com', 'xyz')
    const userObject = response.body;

    expect(response.status).toBe(403);
    expect(userObject.user).not.toBeDefined();
    expect(userObject.token).not.toBeDefined();

  });
  it('basic auth fails with unknown user', async () => {

    const response = await mockRequest.post('/signin')
      .auth('malaak@gmail.com', '1111')
    const userObject = response.body;

    expect(response.status).toBe(403);
    expect(userObject.user).not.toBeDefined();
    expect(userObject.token).not.toBeDefined()

  });

  it('bearer auth fails with an invalid token', async () => {

    // First, use basic to login to get a token
    const bearerResponse = await mockRequest
      .get('/users')
      .set('Authorization', `Bearer invalid`)
    expect(bearerResponse.status).toBe(404);

  });
});

describe('Course Routes', () => {
  let id;
  it('can create new course', async () => {
    const response = await mockRequest.post('/create-course')
      .set('authorization', `Bearer ${token}`)
      .send(newCourse);

    id = response.body._id;
    expect(response.body.name).toEqual(newCourse.name);
    expect(response.body.description).toEqual(newCourse.description);
    expect(response.body.owner).toEqual('malak@gmail.com');
    expect(response.body.members).toEqual(['malak@gmail.com']);
  });

  // it('can join new course', async () => {

  //   const response2 = await mockRequest.post('/signin')
  //     .auth(users.user2.email, users.user2.password);

  //   await mockRequest.post('/join-course')
  //     .set('authorization', `Bearer ${response2.token}`)
  //     .send(id).then(response => {

  //       expect(response.body.name).toEqual(newCourse.name);
  //       expect(response.body.description).toEqual(newCourse.description);
  //       expect(response.body.owner).toEqual('malak@gmail.com');
  //       expect(response.body.members).toEqual(['malak@gmail.com', 'ali@gmail.com']);
  //     });

  // });

  it('Should See My Courses', async () => {
    const response = await mockRequest.get('/my-courses').set('authorization', `Bearer ${token}`);

    expect(response.body).toEqual([`${id}`]);
  });

  it('Not Found Handler', async () => {
    const response = await mockRequest.get('/no-route');
    expect(response.body.error).toEqual('Resource Not Found');
  });

  it('I Should See My Course\'s Info', async () => {
    const response = await mockRequest.get(`/course/${id}`).set('authorization', `Bearer ${token}`);

    expect(response.body._id).toEqual(`${id}`);
    expect(response.body.owner).toEqual(`malak@gmail.com`);
  });

  it('the owner can create new assignment', async () => {
    const response = await mockRequest.post(`/course/${id}/create-assignment`)
      .set('authorization', `Bearer ${token}`)
      .send(newAss);

    assID = response.body[0]._id;
    expect(response.body[0].assignmentText).toEqual(newAss.assignmentText);
    expect(response.body[0].assignmentTitle).toEqual(newAss.assignmentTitle);
    expect(response.body[0].solutionInfo).toEqual([]);

  });

  it('the owner can create new Quiz', async () => {
    const response = await mockRequest.post(`/course/${id}/create-quiz`)
      .set('authorization', `Bearer ${token}`)
      .send(newQuiz);

    quizID = response.body[0]._id;
    expect(response.body[0].quizText).toEqual(newQuiz.quizText);
    expect(response.body[0].quizTitle).toEqual(newQuiz.quizTitle);
    expect(response.body[0].timer).toEqual(newQuiz.timer);
    expect(response.body[0].solutionInfo).toEqual([]);

  });

  it('Can See The Grades', async () => {
    const response = await mockRequest.get(`/course/${id}/grades`).set('authorization', `Bearer ${token}`);
    expect(response.body).toEqual([]);
  });


  it('Should See My Tasks', async () => {
    const response = await mockRequest.get('/task').set('authorization', `Bearer ${token}`);
    expect(response.body).toEqual([]);
  });

  it('the owner Can Delete an assignment', async () => {
    const response = await mockRequest.delete(`/course/${id}/delete-as/${assID}`).set('authorization', `Bearer ${token}`);
    expect(response.body).toEqual([]);
  });

  it('the owner Can Delete a quiz', async () => {
    const response = await mockRequest.delete(`/course/${id}/${quizID}/delete-qu`).set('authorization', `Bearer ${token}`);
    expect(response.body).toEqual([]);
  });

  it('the owner can delete the course', async () => {
    const response = await mockRequest.delete(`/course/${id}/delete`).set('authorization', `Bearer ${token}`);

    expect(response.body.name).toEqual(newCourse.name);
    expect(response.body.description).toEqual(newCourse.description);
    expect(response.body.owner).toEqual('malak@gmail.com');
    expect(response.body.members).toEqual(['malak@gmail.com']);
  })
  it('Internal Server Error', async () => {
    const response = await mockRequest.delete(`/course/${id}/delete-as/${assID}`);
    expect(response.body.error.statusMessage).toEqual('Bearer : Invalid Login');
  })


});

module.exports = mockRequest;