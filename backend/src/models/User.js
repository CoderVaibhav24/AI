import mongoose from 'mongoose'

const userScehma = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        uppercase: false
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
},
{
    timestamps: true,
});
