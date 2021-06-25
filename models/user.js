const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        default: "",
        trim: true
    },
    userName: {
        type: String,
        default: "",
        trim: true
    },
    lastName: {
        type: String,
        default: "",
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    countryCode: {
        type: String,
        trim: true,
    },
    isProfileComplete : {
        type: Boolean,
        default: false
    },
    isEmailVerify: {
        type: Boolean,
        default: false
    },
    isPhoneVerify: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        default: '',
        select: false
    },
    image: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deviceType: {
        type: String,
        enum: ['IOS', 'ANDROID', 'WEB']
    },
    verificationType: {
        type: Number,
        enum: [0, 1] //0 For Phone, 1 For email
    },
    deviceToken: {
        type: String,
        default: '',
        select: false
    },

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const User = mongoose.model('User', UserSchema);
module.exports = User;
