const express=require("express");
const app= express();//INSTANCE OF EXPRESS
const connectDB=require("./config/database");
const cookieParser= require("cookie-parser");
const authRouter= require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const connectionRouter = require("./routes/connections.js");
const userRouter = require("./routes/user.js");
const cors = require ("cors");
const cron = require("./utils/cron");
const dotenv = require("dotenv");
const http = require("http");
const initializeSocket = require("./utils/socket");

dotenv.config();
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}))
app.use(cookieParser());
app.use(express.json());

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",connectionRouter);
app.use("/",userRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB().then(()=>{ 
    console.log("Connected to database");
    
    server.listen(3000,()=>{ //when the db is connected, only then connect the server
        console.log("server is running");
    });
}).catch((err)=>{
    console.error("Database could not be connected");
});

