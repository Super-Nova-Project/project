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
    // beforeEach(()=> {
    //     // mockServer.set('authorization' , `Bearer ${a}`)
    //     mockServer.post('/signup').send({
    //         email : 'aaa',
    //         password : 'bbb',
    //         firstName : 'ccc',
    //         lastName : 'ddd'
    //     }).then( x => {
    //         console.log('signup ----------', x);
    //         token = x
    //         console.log('token ----------', token);
    //     })
    // })

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
            console.log('signup ----------', b.body);
            token = b.body.token;
            user = b.body.user;
            // console.log('token ----------', b.body.token);
            expect(b.body.user.gender).toEqual('Not Specify');
            expect(b.body.user.email).toEqual('aaa');
            expect(b.body.user.firstName).toEqual('ccc');
            expect(b.body.user.lastName).toEqual('ddd');
        
    });

    it('should sign in with basic authentication' , async ()=>{
        console.log('user: *****', user);
        const basic = `hamneh@gmail.co:111111`; 
        const encoded = base64.encode(basic);
        const userSignin = await mockServer.post('/signin').set(
            'authorization','Basic ' + encoded );
        console.log('user : *********' , userSignin);
        expect(userSignin.body).toEqual({});
    });
    it('Should Create A New Course', async () => {
        // console.log('--------------token-------------', token);
        const response = await mockServer.post('/create-course').set('authorization' , `Bearer ${token}`).send(data);
        // console.log('-----------------response-----------------',response);
        id = response.body._id;
        expect(response.body.name).toEqual(data.name);
        expect(response.body.description).toEqual(data.description);
        expect(response.body.owner).toEqual('aaa');
        expect(response.body.members).toEqual(['aaa']);
    })
    it('Should See My Courses', async () => {
        console.log('--------------id-------------', id);
        const response = await mockServer.get('/my-courses').set('authorization' , `Bearer ${token}`);
        // console.log('-----------------response-----------------',response);
        expect(response.body).toEqual([`${id}`]);
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