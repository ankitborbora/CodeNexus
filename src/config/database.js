const mongoose = require("mongoose");

async function connectDB(){
    await mongoose.connect("mongodb+srv://ankitborbora01:jL4Mpjzlam62KSoj@codenexus.mz1tqme.mongodb.net/CodeNexus");
}

module.exports=connectDB;
