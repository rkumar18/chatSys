const responseCode = require("./responseCode");
const appMessages = require("../lang");
const constant = require("./constant")

function sendSuccessResponse(req, res, data, httpCode = responseCode.OK, message) {
    if (!data && message) {
        data = {
            message: getMessage(req, message)
        }
    } else {
        data.message = getMessage(req, message)
    }
    res.status(httpCode).send(data);
}

function sendFailResponse(req, res, httpCode = responseCode.BAD_REQUEST, message, data) {
    if (!data && message) {
        data = {
            status : httpCode,
            message: getMessage(req, message)
        }
    } else {
        data.message =  getMessage(req, message)
    }
    res.status(httpCode).send(data);
}

function getMessage(req, message) {
    const lang =
        req.headers["content-language"] || constant.LANGUAGE_TYPE.ENGLISH;
    return appMessages[lang]["APP_MESSAGES"][message] || message;
}

module.exports = {
    sendSuccessResponse,
    sendFailResponse,
    getMessage
}