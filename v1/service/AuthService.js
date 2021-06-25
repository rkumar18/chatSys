const response = require("../../utility/response");
const Utility = require("../../utility/Utility");
const responseCode = require('../../utility/responseCode')
const messages = require('../../messages').messages.MESSAGES
const Model = require('../../models')
const mongoose = require('mongoose')

const userAuth = async (req, res, next) => {
    try {
        if (req.user && req.user.guestMode) {
            next();
        } else if (req.headers.authorization) {
            const accessTokenFull = req.headers.authorization;
            const parts = accessTokenFull.split(' ')
            let accessToken = parts[1]
            const decodeData = await Utility.jwtVerify(accessToken);
            if (!decodeData) throw messages.INVALID_TOKEN
            const userData = await Model.user.findOne({ _id: mongoose.Types.ObjectId(decodeData._id) }).lean().exec();
            if (userData) {
                req.user = userData;
                req.user.userType = "USER"
                next();
            } else {
                return response.sendFailResponse(req, res, responseCode.UN_AUTHORIZED, messages.INVALID_CREDENTAILS);
            }
        } else {
            return response.sendFailResponse(req, res, responseCode.UN_AUTHORIZED, messages.AUTH_TOKEN_MISSING);
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    userAuth
}