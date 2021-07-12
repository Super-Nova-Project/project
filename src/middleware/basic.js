'use strict';

const base64 = require('base-64');
const User = require('../model/users-model.js');

module.exports = async (req, res, next) => {

  if (!req.headers.authorization) { return res.status(401).send('not found user'); }
  console.log('---basic handler ---', req.headers.authorization);
  let basic = req.headers.authorization.split(' ').pop();
  console.log('---basic ---', basic);
  let [email, pass] = base64.decode(basic).split(':');
  console.log('---email ---', email);
  console.log('---pass ---', pass);

  try {
    req.user = await User.authenticateBasic(email, pass)
    next();
  } catch (e) {
    console.log('ERROR : ' , e.message);
    res.status(403).send('Basic : Invalid Login');
  }

}