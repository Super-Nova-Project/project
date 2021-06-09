'use strict';

require('../__tests__/auth.test.js');
const basic = require('../src/middleware/basic.js');
const base64 = require('base-64');

describe('Basic Auth Middleware', () => {
  // Mock the express req/res/next that we need for each middleware call
  const req = {};
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(() => res)
  }
  const next = jest.fn();


  it('logs in a user with the right credentials', () => {

    let basicHeader = 'malak@gmail.com:1111';
    let encoded = base64.encode(basicHeader)
    // Change the request to match this test case
    req.headers = {
        authorization: `Basic ${encoded}`,
    };

    return basic(req, res, next)
      .then(() => {
        expect(next).toHaveBeenCalledWith();
      });

  });

});