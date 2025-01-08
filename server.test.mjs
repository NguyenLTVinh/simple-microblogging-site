import * as chaiModule from 'chai';
import chaiHttp from 'chai-http';
const chai = chaiModule.use(chaiHttp);
import supertest from 'supertest';
import server from './server.js';

const request = supertest(server);
const { expect } = chai;

describe('Server API Endpoints', () => {
    after(() => {
        server.close(() => {
            console.log('Server closed');
        });
    });

    let sessionCookie;

    it('should render the registration page', async () => {
        const res = await request.get('/register');
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Register');
    });
    
    it('should render the login page', async () => {
        const res = await request.get('/login');
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Login');
    });
    
    it('should redirect to login when accessing create-post page while logged out', async () => {
        const res = await request.get('/create-post');
        expect(res.status).to.equal(302);
        expect(res.header.location).to.include('/login');
    });
    
    it('should return 403 when accessing my-posts while logged out', async () => {
        const res = await request.get('/my-posts');
        expect(res.status).to.equal(403);
        expect(res.text).to.include('You need to be logged in to view this page');
    });
    
    it('should return 403 when accessing my-profile while logged out', async () => {
        const res = await request.get('/my-profile');
        expect(res.status).to.equal(403);
        expect(res.text).to.include('You need to be logged in to view this page');
    });

    it('should display the login page', async function () {
        const res = await request.get('/login');
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Login');
    });

    const loginUser = async (credential, password) => {
        const res = await request.post('/api/login').send({ credential, password });
        sessionCookie = res.headers['set-cookie'][0];
        return res;
    };

    it('should log in the user', async () => {
        const res = await loginUser('testuser', 'password123');
        expect(res.status).to.equal(302);
    });

    it('should fetch the homepage with posts', async () => {
        const res = await request.get('/').set('Cookie', sessionCookie);
        expect(res.status).to.equal(200);
        expect(res.text).to.include('All Posts');
    });

    it('should fetch the logged-in user\'s posts', async () => {
        const res = await request.get('/my-posts').set('Cookie', sessionCookie);
        expect(res.status).to.equal(200);
        expect(res.text).to.include('My Posts');
    });

    it('should fetch the user\'s profile', async () => {
        const res = await request.get('/my-profile').set('Cookie', sessionCookie);
        expect(res.status).to.equal(200);
        expect(res.text).to.include('My Profile');
    });

    it('should log out the user', async () => {
        const res = await request.get('/api/logout').set('Cookie', sessionCookie);
        expect(res.status).to.equal(302);
    });
});
