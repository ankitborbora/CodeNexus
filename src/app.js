const express=require("express");
const app= express();//INSTANCE OF EXPRESS
const connectDB=require("./config/database");
const cookieParser= require("cookie-parser");
const authRouter= require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");

app.use(cookieParser());
app.use(express.json());

app.use("/",authRouter);
app.use("/",profileRouter);


connectDB().then(()=>{ 
    console.log("Connected to database");
    
    app.listen(3000,()=>{ //when the db is connected, only then connect the server
        console.log("server is running");
    });
}).catch((err)=>{
    console.error("Database could not be connected");
});

