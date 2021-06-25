
const Model = require('../../models')
const Otp = require("./otp")
const Utility = require("../../utility/Utility")
const mongoose = require('mongoose')
const messages = require('../../messages').messages.MESSAGES
const STATIC_PATHS = require("../../utility/constant")

async function createUser(data) {

    let qry = {
        isDeleted: false
    }

    let or = []
    if (data.email) {
        or.push({
            email: data.email.toLowerCase(),
        })
    }
    if (data.phone) {
        or.push({
            phone: data.phone,
        })
    }
    if (data.userName) {
        or.push({
            userName: data.userName,
        })
    }
    qry.$or = or
    if (or.length > 0) {
        let user = await Model.user.findOne(qry, {
            email: 1,
            phone: 1,
            userName: 1
        })

        if (user) {
            if (user.email == data.email.toLowerCase()) {
                throw messages.DUPLICATE_EMAIL
            }
            if (user.phone == data.phone) {
                throw messages.DUPLICATE_PHONE;
            }
            if (user.userName == data.userName) {
                throw messages.DUPLICATE_USERNAME;
            }

        }
    }


    data.password = await Utility.hashPasswordUsingBcrypt(data.password)

    user = await Model.user.create(data);

    if (!user) {
        throw responseCode.BAD_REQUEST;
    }

    if (data.email && data.verificationType == 1) {
        //    let code = String(Math.floor(Math.random() * 1000000000))
        //    let opt = await Services.links.Create({code: code, email: data.email, expiredAt: moment().add(30, 'minutes') })
        //    if (opt.status != 200) {
        //        sendObj = { ...sendObj, ...opt }
        //        return await Universal.sendResponse(sendObj)
        //    }
        // let link = `https://www.appgrowthcompany.com:4019/api/v1/verifyEmail/${code}`
        //    let link = `http://appgrowthcompany.com/baron_web/verifyEmail/${code}`
        //     EmailService.sendEmailVerification(data.email, link);
    }

    if (data.phone && data.verificationType == 0) {
        await Otp.generatePhoneOtp(data.countryCode, data.phone, "1234")
    }
    return {
        email: user.email,
        phone: user.phone,
        _id: user._id
    };
}

async function verifyOtp(data) {
    if (data.code != 1234) {
        throw messages.INVALID_OTP
    }
    let qry = {

        phone: data.phone
    }

    if (data.countryCode) {
        qry.countryCode = data.countryCode
    }
    let user = await Model.user.findOneAndUpdate(qry, {
        isPhoneVerify: true
    });
    return {
        token: await Utility.jwtSign({ _id: user._id, forResetPassword : true }),
        type: "Bearer",
    }
}

async function resendOtp(data) {
    let user = await Model.user.findById(mongoose.Types.ObjectId(data.id));
    if (user.verificationType == 0) {
        let otp = await Otp.generatePhoneOtp(user.countryCode, user.phone, "1234")
        if (!otp) {
            throw messages.REQUIRED_FILED_IS_MISSING
        }
    }

    return true;
}

async function login(data) {
    let setObj = {
        deviceType: data.deviceType,
        deviceToken: data.deviceToken
    }
    let planPassword = data.password
    delete data.deviceType
    delete data.deviceToken
    delete data.password
    let qry = {}

    if(Utility.isEmail(data.username)){
        qry.email = data.username;
    }else{
        qry.phone = data.username;
    }

    let user = await Model.user.findOne(qry, {
        password: 1
    })
    if (!user) {
        throw messages.INVALID_CREDENTAILS
    }
    let match = await Utility.comparePasswordUsingBcrypt(planPassword, user.password);
    if (!match) {
        throw messages.INVALID_CREDENTAILS
    }
    user = await Model.user.findOneAndUpdate({ _id: mongoose.Types.ObjectId(user._id) }, setObj).lean();
    // if (user.isEmailVerify && user.isPhoneVerify) {
    if ((user.verificationType == 0 && user.isPhoneVerify) || (user.verificationType == 1 && user.isEmailVerify)) {
        user.token = await Utility.jwtSign({ _id: user._id })
        user.type = "Bearer";
        user.expire = await Utility.getJwtExpireTime();
        user.refreshToken = await Utility.jwtRefreshSign({ _id: user._id })

    }
    return user;
}

async function updateProfile(req, user) {
    let data = req.body;
    if (req.file) {
        data.image = STATIC_PATHS.User.profileImage + req.file.filename
        let oldImage = await Model.user.findOne({ _id: mongoose.Types.ObjectId(user._id) }, {
            image: 1
        });
        if (oldImage && oldImage.image) {
            let parts = oldImage.image.split("/");
            await Utility.deleteFile(STATIC_PATHS.User.profileImageDir + parts[parts.length - 1])
        }
    }

    let qry = {
        _id: {
            $ne: user._id
        },
        isDeleted: false
    }

    let or = []
    if (data.email) {
        or.push({
            email: data.email.toLowerCase(),
        })
    }
    if (data.phone) {
        or.push({
            phone: data.phone,
        })
    }
    if (data.userName) {
        or.push({
            userName: data.userName,
        })
    }
    qry.$or = or
    if (or.length > 0) {
        let duplicateUser = await Model.user.findOne(qry, {
            email: 1,
            phone: 1,
            userName: 1
        })

        if (duplicateUser) {
            if (duplicateUser.email == data.email.toLowerCase()) {
                throw messages.DUPLICATE_EMAIL
            }
            if (duplicateUser.phone == data.phone) {
                throw messages.DUPLICATE_PHONE;
            }
            if (duplicateUser.userName == data.userName) {
                throw messages.DUPLICATE_USERNAME;
            }

        }
    }

    data.isProfileComplete = true
    let updatedUser = await Model.user.findOneAndUpdate({ _id: mongoose.Types.ObjectId(user._id) }, data, { new: true }).lean();

    return updatedUser;
}

async function getProfile(userId) {
    return await Model.user.findById(mongoose.Types.ObjectId(userId)).lean(); ß
}

async function resetPassword(data){
    if((data.key && Utility.isEmail(data.key)) || data.email ){

    }else if((data.key && Utility.isPhone(data.key)) || data.phone ){
      let user = await Model.user.findOne({ phone : data.key } );
      let otp = await Otp.generatePhoneOtp(user.countryCode, user.phone, "1234")
            if (!otp) {
                throw messages.REQUIRED_FILED_IS_MISSING
            }
        return otp;
    }else{
        throw message.REQUIRED_FILED_IS_MISSING;
    }
}

async function changePassword(data, user){
    if(!user.forResetPassword){
        let findUser = await Model.user.findOne({_id : user._id}, {
            password: 1
        })
        if (!findUser) {
            throw messages.INVALID_CREDENTAILS
        }
        let match = await Utility.comparePasswordUsingBcrypt(data.oldPassword, findUser.password);
        if (!match) {
            throw messages.OLD_PASS_NOT_MATCH
        }
    }

    await Model.user.findByIdAndUpdate(user._id,  {
        $set : {
            password : await Utility.hashPasswordUsingBcrypt(data.password)
        }
    })

    return true;


}

module.exports = {
    createUser,
    verifyOtp,
    resendOtp,
    login,
    updateProfile,
    getProfile,
    resetPassword,
    changePassword
}