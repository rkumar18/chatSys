
const multer = require('multer')
const path = require('path')
const fs = require('fs');



const profilePicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let paths = path.resolve(__dirname, '../../public/images/users');
        // fs.mkdirSync(paths, { recursive: true })
        cb(null, paths)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
    }
});
const ProfilePicUpload = multer({
    storage: profilePicStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(new Error('Invalid File Format: Only .png, .jpg and .jpeg format allowed!'));
        }
      }
})



module.exports = {
    ProfilePicUpload: ProfilePicUpload,
    
}