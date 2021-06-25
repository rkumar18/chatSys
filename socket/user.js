const server = require("socket.io");
const utils = require("../utility/Utility");
const Model = require("../models");
const io = server();
const mongoose = require("mongoose")
let Users = {};
// let apptunixGroup ={};

io.use(async (socket, next) => {
  if (socket.handshake.query.token) {
    console.log(socket.handshake.query.token);
    let decoded = await utils.jwtVerify(socket.handshake.query.token);
    console.log(decoded);
    if (!decoded) return next(new Error("Authentication error"));
    else {
      Users[String(socket.id)] = decoded._id;
      next();
    }
  } else {
    next(new Error("Authentication error"));
  }
}).on("connection", function (socket) {
  //User Attached

  socket.on("connectUser", async (data) => {
    try {
      let userId = Users[String(socket.id)];
      console.log("************ User Connect **********", socket.id, userId);
      socket.join(userId);
      // socket.join("apptunixGroup");
      io.to(userId).emit("connectOk", { status: 200 });
    } catch (error) {
      console.log(error);
    }
  });

  //send msg 
  socket.on("newMessage", async (data) => {
    try {
      data = JSON.parse(data);
      socket.join(data.chatId);
      let userId = Users[String(socket.id)];
      data.senderId = userId;
      let chat = new Model.chat(data);
      chat.save();
      console.log({chat});
      io.to(data.chatId).emit("newMessage", {
        success: true,
        data: chat,
      });
    } catch (error) {
      console.log("newMessage error **", error);
    }
  });

  //get all chat 
  socket.on("chatHistory", async (data) => {
    try {
      data = JSON.parse(data);
      socket.join(data.chatId);
      let chats = await Model.chat.find({ chatId: data.chatId })
        .sort({ createdAt: -1 })
        .exec();
      // console.log(chats, "chatHistory");
      io.to(data.chatId).emit("chatHistory", {
        success: true,
        data: chats,
      });
    } catch (error) {
      console.log(" Socket error **", error);
      return error;
    }
  });
   //for mark read
  socket.on("readMessage", async (data) => {
    try {
      data = JSON.parse(data);
      await Model.chat.findByIdAndUpdate(data.recieverId,{isRead: true});
      socket.join(data.chatId);
      console.log(data.recieverId);
      io.to(data.chatId).emit("readMessage", {
        success: true,
        data: "",
      });
    } catch (error) {
      console.log("readMessage error **", error);
    }
  })


  //for mark unread
  socket.on("markUnreadMessage", async (data) => {
    try {
      data = JSON.parse(data);
      let chat_ = await Model.chat.findByIdAndUpdate(data.recieverId,{isRead: false});
      socket.join(data.chatId);
      io.to(data.chatId).emit("markUnreadMessage", {
        success: true,
        data: chat_,
      });
    } catch (error) {
      console.log("markUnreadMessage error **", error);
    }
  })

  //delete msg within 10 min
  socket.on("deletemsg", async (data) => {
    try {
      data = JSON.parse(data);
      let canDelete = await Model.chat.findById(data.msgId);

      socket.join(data.chatId);
      function addSomeMinutesToTime(startTime, minutestoAdd) {
        const dateObj = new Date(startTime);
        const newDateInNumber = dateObj.setMinutes(dateObj.getMinutes() + minutestoAdd);
        const processedTime = new Date(newDateInNumber).toISOString();
        console.log(processedTime)
        return processedTime;
      }
      let expireDate = addSomeMinutesToTime((canDelete.createdAt), 10)  //createdAt + 10 min
      function toISOStringLocal(d) {
        function z(n){return (n<10?'0':'') + n}
        return d.getFullYear() + '-' + z(d.getMonth()+1) + '-' +
               z(d.getDate()) + 'T' + z(d.getHours()) + ':' +
               z(d.getMinutes()) + ':' + z(d.getSeconds())
      }
      
      let currentDate = toISOStringLocal(new Date());
      if(expireDate > currentDate){
      await Model.chat.findOneAndDelete({_id: data.msgId});
      io.to(data.chatId).emit("deletemsg", {
        success: true,
        data: "",
      });
    }else{
      
      io.to(data.chatId).emit("deletemsg", {
        success: false,
        data: "10 min up , Unable to delete msg",
      });
    }
    } catch (error) {
      console.log("deletemsg error **", error);
    }
  });



  process.on("sendImageMsg", async (payload) => {
  io.to(payload.to).emit(payload.emit, payload.data);
});







  socket.on("newMessageInGroup", async (data) => {
    try {
      socket.join(data.chatId);
      let chat = new Model.chat(data);
      chat.save();
      io.to(data.chatId).emit("newMessageInGroup", {
        success: true,
        data: chat,
      });
    } catch (error) {
      console.log("newMessageInGroup error **", error);
    }
  });

  socket.on("disConnect", async (data) => {
    try {
      let userId = Users[String(socket.id)];
      socket.leave(userId);
      delete Users[String(socket.id)];
      io.to(userId).emit("disConnect", { status: 200 });
    } catch (error) {}
  });
});

exports.io = io;
