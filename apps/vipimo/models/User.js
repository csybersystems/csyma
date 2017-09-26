/*
 * file: User.js
 * Required to read users
 */
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    _id:{ 
        type: ObjectId, 
        unique: true 
    },
    isActive: Boolean,
    email: { 
        type: String, 
        unique: true 
    },
    username: String,
    password: String,
    name:{
        first: String, 
        middle:String,  
        last: String, 
        other:String
    },
    locale: String, 
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    facebook: String,
    twitter: String,
    google: String,
    github: String,
    instagram: String,
    linkedin: String,
    steam: String,
    tokens: Array,

    profile: {
      name: String,
      gender: String,
      location: String,
      website: String,
      picture: String
    },/*
    apps:[{
        _id: { 
            type: String, 
            unique: false 
        },
        groups:[{
            _id:{ 
                type: String, 
                unique: false 
            },
            name: { 
                type: String, 
                unique: false 
            },
        }]
    }],
    groups:[{
        _id: { 
            type: ObjectId
        },
        name: { 
            type: String
        },
    }],
    */
    tokens: Array,
timeCreated: String,
}, { timestamps: true });
/*
const AppSchema = new Schema({
    _id: { 
        type: String, 
        unique: true 
    },
    name: String,
    permissions:{
        groups: [{
            group: { 
                type: String, 
                unique: false 
            },
            permissions:{
                read: Boolean,       
                write: Boolean,
                execute: Boolean
            }
        }]
    },
timeCreated: String,
}, { timestamps: true });

const GroupSchema = new Schema({ 
    _id: { 
        type: String, 
        unique: true 
    },
    name: String,
timeCreated: String,
}, { timestamps: true });
*/

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});
/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};
/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `httpss://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `httpss://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;