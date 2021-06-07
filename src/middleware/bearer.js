'use strict';

const users = require('../model/users-model')

module.exports = async (req, res, next) => {

  try {
    console.log(req.headers);
    if (!req.headers.authorization) { next('Bearer : Invalid Login') }

    const token = req.headers.authorization.split(' ').pop();
    const validUser = await users.authenticateWithToken(token);

    req.user = validUser;
    req.token = validUser.token;
    next();
  } catch (e) {
    res.status(403).send('Bearer : Invalid Login');;
  }
}