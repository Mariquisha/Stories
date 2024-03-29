const GoogleStrategy = require('passport-google-oauth20').Strategy
const { errorMonitor } = require('connect-mongo')
const mongoose = require('mongoose')
const passport = require('passport')
const User = require('../models/User')



module.exports = function(passort){
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }
        try {
            let user = await User.findOne({ googleId: profile.id })
            if(user){
                done(null, user)
            }else{
                user = await User.create(newUser)
                done(null,user)
            }
        } catch (err) {
            console.error(err)
        }
    }))
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })
    /*passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user){
            done(err, user);
        });        
    });*/
    passport.deserializeUser(async (id, done) => {

        done(null, await User.findById(id))

    });
    
}
// Receive the callback from Google's OAuth 2.0 server.

  