const mongoose = require('mongoose');
const validator = require('validator');
const jwt=require('jsonwebtoken');
const config=require('config');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('You have entered invalid email');
            }
        }
    },
    forgotPasswordCode: {
        type: String,
        maxlength: 4,
        minlength: 4,
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]
});

userSchema.methods.generateToken=async function(){
    const user=this;
    const token= await jwt.sign({_id:user._id.toString()},config.get('CodeToken'));
    user.tokens=user.tokens.concat({token});
    await user.save();
    console.log(token);
    return token;
}

const User = mongoose.model('User', userSchema);

module.exports = User;