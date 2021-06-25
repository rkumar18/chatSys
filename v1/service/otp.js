const Model = require('../../models')
const moment =require('moment')

async function generatePhoneOtp(countryCode, phone, otpCode = generateRandom(6), expiredAt= moment().add(10, 'minutes').toDate()){
   await Model.otp.deleteMany( {
     phone : phone, 
     countryCode: countryCode
   }); //Clear Old Send otp message
  let otp = await Model.otp.create({
    phone : phone, 
    countryCode: countryCode,
    code: otpCode,
    expiredAt: expiredAt
   });
   return otp;
}

async function verifyPhoneOtp(countryCode, phone, otpCode){
    let qry = {
        phone : phone, 
        code: otpCode,
        expiredAt: {
            $gte: new Date()
        }
        }
    if(countryCode){
        qry.countryCode = countryCode
     }
   let otp = await Model.otp.findOne(qry, {
        _id : 1
    })
    if(otp){
       otp.remove()
    }
    return otp;
}

async function generateRandom(n){
    var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

    if ( n > max ) {
            return generate(max) + generate(n - max);
    }

    max        = Math.pow(10, n+add);
    var min    = max/10; // Math.pow(10, n) basically
    var number = Math.floor( Math.random() * (max - min + 1) ) + min;

    return ("" + number).substring(add); 
}

module.exports = {
    generatePhoneOtp,
    generateRandom,
    verifyPhoneOtp
}