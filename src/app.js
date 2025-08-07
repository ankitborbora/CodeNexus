const express=require("express");
const app= express();//INSTANCE OF EXPRESS
const connectDB=require("./config/database");


connectDB().then(()=>{ 
    console.log("Connected to database");
    
    app.listen(3000,()=>{ //when the db is connected, only then connect the server
        console.log("server is running");
    });
}).catch((err)=>{
    console.error("Database could not be connected");
});

