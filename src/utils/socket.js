const socket = require("socket.io");

function initializeSocket(server){
    const io = socket(server,{
        cors:{
            origin:"http://localhost:5173"
        }
    });
    
    io.on("connection",()=>{
    
        socket.on("joinChat",()=>{

        });

        socket.on("message",()=>{

        });

        socket.on("disconnect",()=>{

        });
    });
}

module.exports = initializeSocket;