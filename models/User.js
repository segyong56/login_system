const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwt_secret = 'slkdkdkekdksflddsfsfdd';
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required: [true, 'please enter your name'],
        maxLength: [30, 'your name cannot exceed 30']
    },
    email : {
        type : String,
        required: [true, 'please enter your email'],
        unique: 1
    },
    password : {
        type: String,
        required: [true, 'please enter your password'],
        minLength: [6, 'you munt enter over 6']
    },
    profile: 
        {
            profileName: {
                type: String,
                maxLength: 50,
                default: `user${Date.now()}`
            },
            profileImg: {
                type: String,
                default: 'https://i.pinimg.com/564x/3a/6d/da/3a6ddaa0d5b75b30fc8b67fc0f0bcb29.jpg'
            }
        },
    myFollowing_list : {
        type: Array,
        default: []
    },
    resetPasswordToken : String,
    resetPasswordExpire: Date
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, jwt_secret, {
        expiresIn: '7d'
    });
}

userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken;
}

module.exports = mongoose.model('User', userSchema)