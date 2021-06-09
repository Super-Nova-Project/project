'use strict';

require('../__tests__/auth.test.js');

const bearer = require('../src/middleware/bearer.js');
const jwt = require('jsonwebtoken');

describe('Bearer Auth Middleware', () => {

  // Mock the express req/res/next that we need for each middleware call
  const req = {};
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(() => res)
  }
  const next = jest.fn();



  it('logs in a user with a proper token', () => {

    const user = { email: 'malak@gmail.com' };
    const token = jwt.sign(user, process.env.SECRET);

    req.headers = {
      authorization: `Bearer ${token}`,
    };

    return bearer(req, res, next)
      .then(() => {
        expect(next).toHaveBeenCalledWith();
      });

  });

});