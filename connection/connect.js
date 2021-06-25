const mongoose = require("mongoose");
const config = require('config');

var mongoDbconnection = async function () {
        var url = config.get("mongo.url")
        console.log(url)
        mongoose.set('debug', true);
            mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false }, (error, result) => {
                if (error) {
                    console.log(error);
                    return reject(error);
                }
                return 'Db successfully connected!';
            });
  
};
module.exports = {
    mongoDbconnection: mongoDbconnection
};