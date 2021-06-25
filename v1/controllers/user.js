
const validations = require('../validator')
const services = require('../service')
const response = require('../../utility/response')
const responseCode = require('../../utility/responseCode')
const messages = require('../../messages').messages.MESSAGES
const Utility = require("../../utility/Utility")
const STATIC_PATHS = require("../../utility/constant");
const config = require("config")
const Model = require("../../models")
const aws = require("aws-sdk");
const s3 = new aws.S3();
const fs = require("fs");


async function signup(req, res, next) {
    try {
        await validations.user.validateSignUp(req)
        if (!req.body.email && !req.body.phone) {
            return response.sendFailResponse(req, res, responseCode.BAD_REQUEST, messages.REQUIRED_FILED_IS_MISSING);
        }

        let user = await services.user.createUser(req.body)

        return response.sendSuccessResponse(req, res, user, responseCode.CREATED)
    } catch (error) {
        next(error)
    }
}

async function verifyOtp(req, res, next) {
    try {
        await validations.user.validateOtpVerify(req)
        let data = await services.user.verifyOtp(req.body)
        return response.sendSuccessResponse(req, res, data, responseCode.OK)
    } catch (error) {
        next(error)
    }
}

async function resendOtp(req, res, next) {
    try {
        await validations.user.validateResendOtp(req)
        let data = await services.user.resendOtp(req.body)
        if (data) {
            return response.sendSuccessResponse(req, res, null, responseCode.OK, messages.OTP_RESEND_SUCCESS)
        }
    } catch (error) {
        next(error)
    }
}

async function login(req, res, next) {
    try {
        await validations.user.validateLogIn(req)
        let data = await services.user.login(req.body)

        return response.sendSuccessResponse(req, res, data, responseCode.OK)

    } catch (error) {
        next(error)
    }
}

async function updateProfile(req, res, next) {
    try {
        await validations.user.validateProfileUpdate(req)
        let data = await services.user.updateProfile(req, req.user)
        if (data) {
            return response.sendSuccessResponse(req, res, data, responseCode.OK)
        } else {
            return response.sendFailResponse(req, res, responseCode.INTERNAL_SERVER_ERROR, messages.SOMETHING_WENT_WRONG);
        }
    } catch (error) {
        if (req.file) {
            await Utility.deleteFile(STATIC_PATHS.User.profileImageDir + req.file.filename)
        }
        next(error)
    }
}

async function getProfile(req, res, next) {
    try {
        let data = await services.user.getProfile(req.user._id)
        return response.sendSuccessResponse(req, res, data, responseCode.OK)
    } catch (error) {
        next(error)
    }
}

async function forgotPassword(req, res, next){
    try {
        await validations.user.validateResetPassword(req)
        let data = await services.user.resetPassword(req.body)
        return response.sendSuccessResponse(req, res, null, responseCode.OK, messages.OTP_RESEND_SUCCESS)
    } catch (error) {
        next(error)
    }
}

async function changePassword(req, res, next){
    try {
        await validations.user.validateChangePassword(req, "body", req.user.forResetPassword)
        let data = await services.user.changePassword(req.body, req.user)
        return response.sendSuccessResponse(req, res, null, responseCode.OK, messages.PASSWORD_CHANGE_SUCCESS)
    } catch (error) {
        next(error)
    }
}



async function imgUpload (req, res, next) {
    try {
    //   aws.config.setPromisesDependency();
    //   aws.config.update({
    //     region: "US East(Ohio)",
    //     endpoint: "http://localhost:1406",
    //     accessKeyId: config.get("ACCESSKEYID"),
    //     secretAccessKey: config.get("SECRETACCESSKEY"),
    //   });
    //   var params = {
    //     ACL: "public-read",
    //     Bucket: config.get("AWS_BUCKET_NAME"),
    //     Body: fs.createReadStream(req.file.path),
    //     Key: `fb-posts/${req.file.originalname}`,
    //   };
    //   s3.upload(params, (err, data) => {
    //     if (err) {
    //       console.log("Error occured while trying to upload to S3 bucket", err);
    //     }
    //     console.log(data);
    //   });
      console.log(req.file);
      const { filename } = req.file;
      req.body.messageType = "IMAGE";
      req.body.senderId = req.user._id;
      req.body.message  = filename;
      let msg = await Model.chat.create(req.body);
      console.log(req.file.filename);
      process.emit("sendImageMsg", {
        to: req.body.chatId,
        emit: "sendImageMsg",
        data: msg
    })
     


      return response.sendSuccessResponse(req, res, msg, responseCode.OK, messages.IMAGE_UPLOAD_SUCCESSFULLY);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

module.exports = {
    signup,
    verifyOtp,
    resendOtp,
    login,
    updateProfile,
    getProfile,
    forgotPassword,
    changePassword,
    imgUpload
}
