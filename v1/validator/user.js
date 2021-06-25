const joi = require('joi');

const validateSchema = async (inputs, schema) => {
    try {
        const { error, value } = schema.validate(inputs);
        if (error) throw error.details ? error.details[0].message.replace(/['"]+/g, '') : "";
        else return false;
    } catch (error) { throw error; }
};

const validateSignUp = async (req, property = 'body') => {
    let schema = {}
    schema = joi.object().keys({
        phone: joi.string().optional(),
        email: joi.string().optional(),
        countryCode: joi.string().allow("", null).optional(),
        password: joi.string().required(),
        verificationType: joi.number().allow(0, 1).required()
    });

    return await validateSchema(req[property], schema);
}

const validateOtpVerify = async (req, property = 'body') => {
    let schema = joi.object().keys({
        phone: joi.string().required(),
        code: joi.string().required(),
        countryCode: joi.string().allow("", null).optional()
    });
    return await validateSchema(req[property], schema);
}

const validateResendOtp = async (req, property = 'body') => {
    let schema = joi.object().keys({
       id :  joi.string().length(24).required(),
    });
    return await validateSchema(req[property], schema);
}

const validateLogIn = async (req, property = 'body') => {
    let schema = {}
        schema = joi.object().keys({
        countryCode: joi.string().allow('', null).optional(),
        username: joi.string().required(),
        password: joi.string().required(),
        deviceType: joi.string().required().valid("ANDROID", "IOS", "WEB"),
        deviceToken: joi.string()
            .when('deviceType', { is: "ANDROID", then: joi.string().required() })
            .concat(joi.string().when('deviceType', { is: "IOS", then: joi.string().required() })
                .concat(joi.string().when('deviceType', { is: "WEB", then: joi.string().allow('', null).optional() })))
    });
    return await validateSchema(req[property], schema);
};

const validateProfileUpdate = async (req, property = 'body') => {
    let schema = joi.object().keys({
        email: joi.string().optional(),
        userName : joi.string().optional(),
        phone: joi.string().optional(),
        firstName: joi.string().optional(),
        lastName: joi.string().optional(),
        countryCode: joi.string().optional(),
        deviceType: joi.string().optional().valid("ANDROID", "IOS", "WEB"),
        deviceToken: joi.string().optional(),
        address : joi.string().optional(),
        latitude : joi.number().optional(),
        longitude: joi.number().optional(),
    });
    return await validateSchema(req[property], schema);
};

const validateResetPassword = async (req, property = 'body') => {
    let schema = joi.object().keys({
       key: joi.string().optional(),
       phone: joi.string().optional(),
       email: joi.string().optional()
    });
    return await validateSchema(req[property], schema);
}


const validateChangePassword = async (req, property = 'body', forReset) => {
    let schema = {}
    if(forReset){
        schema  = joi.object().keys({
            password: joi.string().required()
        });
    }else{
        schema  = joi.object().keys({
            oldPassword:  joi.string().required(),
            password: joi.string().required()
        });
    }
    return await validateSchema(req[property], schema);
}

module.exports = {
    validateSignUp,
    validateOtpVerify,
    validateProfileUpdate,
    validateResendOtp,
    validateLogIn,
    validateResetPassword,
    validateChangePassword

}