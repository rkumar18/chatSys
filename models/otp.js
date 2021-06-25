const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OtpModel = new Schema({
    code: {
        type: String,
        default: "",
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
    expiredAt: {
        type: Date,
        default: new Date()
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const Otp = mongoose.model('Otp', OtpModel);
module.exports = Otp;