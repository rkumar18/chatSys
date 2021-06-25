
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const fs = require("fs");
const path = require('path')

module.exports = {
    hashPasswordUsingBcrypt: async (plainTextPassword) => {
        return bcrypt.hashSync(plainTextPassword, 10);
    },

    comparePasswordUsingBcrypt: async (pass, hash) => {
        return bcrypt.compareSync(pass, hash)
    },

    jwtSign: async (payload) => {
        try {
            return jwt.sign(payload, config.get("jwtOption.jwtSecretKey"), { expiresIn: config.get("jwtOption.expiresIn") });
        } catch (error) {
            throw error;
        }
    },

    jwtRefreshSign: async (payload) => {
        try {
            return jwt.sign(payload, config.get("jwtOption.jwtRefreshSecretKey"), {});
        } catch (error) {
            throw error;
        }
    },

    jwtVerify: async (token) => {
        return jwt.verify(token,  config.get("jwtOption.jwtSecretKey"));
    },
    
    deleteFile: async (filePath) => {
        let paths = path.resolve(__dirname, filePath);
        fs.unlinkSync(paths)
        return
    },

    getJwtExpireTime : async () =>{
        return Math.floor(new Date().getTime() / 1000) + parseInt(config.get("jwtOption.expiresIn").replace("s", ""))
    },

    isEmail : (value) => {
         let  re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(String(value).toLowerCase());
    },

    isPhone : (value) => {
       let intRegex = /[0-9 -()+]+$/;
       return intRegex.test(value)
    }

}
