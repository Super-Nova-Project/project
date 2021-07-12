'use strict';

const users = require('../model/users-model')

module.exports = async (req, res, next) => {

  try {
    // console.log(req.headers);
    if (!req.headers.authorization) { next({statusMessage : 'Bearer : Invalid Login',
    status : 500}) }

    const token = req.headers.authorization.split(' ').pop();
    const validUser = await users.authenticateWithToken(token);

    req.user = validUser;
    req.token = validUser.token;
    next();
  } catch (e) {
    next({statusMessage : 'Bearer : Invalid Login',
    status : 500});
  }
}