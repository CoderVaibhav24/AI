import mongoose from 'mongoose'
import bcrypt from 'bcryptjs';

const userScehma = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    bio:{
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    nativeLanguage: {
        type: String,
        default: ''
    },
    learningLanguage: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    isOnBored: {
        type: Boolean,
        default: false
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
},
{
    timestamps: true,
});



userScehma.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userScehma.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userScehma);

export default User;