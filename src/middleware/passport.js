const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const id = process.env.GOOGLE_CLIENT_ID;
const secret = process.env.GOOGLE_CLIENT_SECRET
const id_fb = process.env.FB_CLIENT_ID;
const secret_fb = process.env.FB_CLIENT_SECRET
const User = require('../model/users-model')
passport.serializeUser(function (user, done) {
  console.log(' in serializeUser ---------', user);
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  // console.log(' in deserializeUser ---------', user);
  // User.findById(id, function(err, user) {
  done(null, user);
  // });
});

passport.use(new GoogleStrategy({
  clientID: id,
  clientSecret: secret,
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback: true
},
  async function (request, accessToken, refreshToken, profile, done) {
    // console.log(' passport profile -----', request);
    const { email } = profile;
    const firstName = profile.given_name;
    const lastName = profile.family_name;
    const password = profile.id;
    const obj = {
      email,
      firstName,
      lastName,
      password
    }
    
    // const googleUser = await User.findOne({ email });
    // if (googleUser) {

    // }


    return done(null, obj);

  }
));

// passport.use(new FacebookStrategy({
//     clientID: id_fb,
//     clientSecret: secret_fb,
//     callbackURL: "http://localhost:3000/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//       console.log('in facebook fun', profile);
//     // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(null, profile);
//     // });
//   }
// ));