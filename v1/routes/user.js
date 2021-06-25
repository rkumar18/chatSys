const router = require("express").Router();
const Controllers = require("~/v1/controllers")
const Service = require("../service")
const ExpressBrute = require('express-brute');
const store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
const bruteforce = new ExpressBrute(store);
var upload = require("../../utility/multer");
/*
onBoarding
*/
router.post("/signup", Controllers.user.signup);
router.post("/verifyOtp", bruteforce.prevent, Controllers.user.verifyOtp);
router.post("/resendOtp", Controllers.user.resendOtp);
router.post("/updateProfile", Service.authService.userAuth, Service.fileUpload.ProfilePicUpload.single('profilePic'), Controllers.user.updateProfile);
router.get("/profile", Service.authService.userAuth,  Controllers.user.getProfile);
router.post("/login", bruteforce.prevent, Controllers.user.login);
router.post("/forgotPassword", bruteforce.prevent, Controllers.user.forgotPassword);
router.post("/changePassword", bruteforce.prevent, Service.authService.userAuth, Controllers.user.changePassword);

//chat
router.post("/uploadImage", Service.authService.userAuth, upload.single('uploadPic'), Controllers.user.imgUpload);
module.exports = router;