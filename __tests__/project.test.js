'use strict'

const supertest = require('@code-fellows/supergoose');
const app = require('../src/server').app;
const mockServer = supertest(app);
const jwt = require('jsonwebtoken')
const base64 = require('base-64')
describe('CRUD Operation', ()=> {
    let token;
    let user;
    let id;
    let asID ;
    let quId;

    let data = {
        name : "testCourse",
        description : "Just For Testing"
    }
    
    it('Should Create A New User', async() => {
        const b = await mockServer.post('/signup').send({
            email : 'aaa',
            password : 'bbb',
            firstName : 'ccc',
            lastName : 'ddd'
        })
            token = b.body.token;
            user = b.body.user;
            expect(b.body.user.gender).toEqual('Not Specify');
            expect(b.body.user.email).toEqual('aaa');
            expect(b.body.user.firstName).toEqual('ccc');
            expect(b.body.user.lastName).toEqual('ddd');
        
    });

    it('should sign in with basic authentication' , async ()=>{
        const basic = `hamneh@gmail.co:111111`; 
        const encoded = base64.encode(basic);
        const userSignin = await mockServer.post('/signin').set(
            'authorization','Basic ' + encoded );
        expect(userSignin.body).toEqual({});
    });
    it('Should Create A New Course', async () => {
        const response = await mockServer.post('/create-course').set('authorization' , `Bearer ${token}`).send(data);
        
        id = response.body._id;
        expect(response.body.name).toEqual(data.name);
        expect(response.body.description).toEqual(data.description);
        expect(response.body.owner).toEqual('aaa');
        expect(response.body.members).toEqual(['aaa']);
    })
    it('Should See My Courses', async () => {
        const response = await mockServer.get('/my-courses').set('authorization' , `Bearer ${token}`);
        
        expect(response.body).toEqual([`${id}`]);
    })
    it('Not Found Handler', async () => {
        const response = await mockServer.get('/no-route');
        // console.log('-----------------response-----------------',response);
        expect(response.body.error).toEqual('Resource Not Found');
    })
    it('I Should See My Course\'s Info', async () => {
        const response = await mockServer.get(`/course/${id}`).set('authorization' , `Bearer ${token}`);
        
        expect(response.body._id).toEqual(`${id}`);
        expect(response.body.owner).toEqual(`aaa`);
    })
    it('Should See My Tasks', async () => {
        const response = await mockServer.get('/task').set('authorization' , `Bearer ${token}`);
        
        expect(response.body).toEqual([]);
    })
    it('I Can Create An Assignment', async () => {
        const response = await mockServer.post(`/course/${id}/create-assignment`).set('authorization' , `Bearer ${token}`).send({
            due_date : '2021-08-08',
            assignmentText :'test create assignment',
            assignmentTitle : 'test1'
        });
        // console.log(response.body);
        asID = response.body[0]._id;
        expect(response.body[0].assignmentTitle).toEqual(`test1`);
        expect(response.body[0].assignmentText).toEqual(`test create assignment`);
    })
    it('I Can Create A Quiz', async () => {
        const response = await mockServer.post(`/course/${id}/create-quiz`).set('authorization' , `Bearer ${token}`).send({
            timer : '2021-08-08',
            quizText :'test create quiz',
            quizTitle : 'test2'
        });
        quId = response.body[0]._id;
        // console.log(response.body);
        expect(response.body[0].quizTitle).toEqual(`test2`);
        expect(response.body[0].quizText).toEqual(`test create quiz`);
    })

    it('I Can See The Grades', async () => {
        const response = await mockServer.get(`/course/${id}/grades`).set('authorization' , `Bearer ${token}`);
        // console.log(response.body);
        expect(response.body).toEqual([]);
    })

    it('I Can Delete an assignment', async () => {
        const response = await mockServer.delete(`/course/${id}/delete-as/${asID}`).set('authorization' , `Bearer ${token}`);
        console.log('--------',response.body);
        expect(response.body).toEqual([]);
    })

    it('Internal Server Error', async () => {
        const response = await mockServer.delete(`/course/${id}/delete-as/${asID}`);
        console.log('--------',response.body);
        expect(response.body.error.statusMessage).toEqual('Bearer : Invalid Login');
    })
    // it('Should join New Course', async () => {
    //     console.log('--------------token-------------', token);
    //     const response = await mockServer.post('/join-course').set('authorization' , `Bearer ${token}`).send(id);
    //     console.log('-----------------response-----------------',response);
    //     expect(1).toEqual(1);
    //     // expect(()=>{
    //     //     response
    //     // }).toThrow();
    // });


});
// describe('CRUD Operation', ()=> {
//     it('')
// })