const mongoose = require("mongoose");

const connectionRequestSchema=mongoose.Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    status:{
        type:String,
        required:true,
        enum:{
            values:["accepted","ignore","rejected","interested"],
            message:`{VALUE} is not a correct status type`
        }
    }
}, { timeStamps:true});

connectionRequestSchema.pre("save",function(next){
    //checking if user is trying to send a request to himself
    if(this.fromUserId.equals(this.toUserId)) throw new Error("Cannot send request to yourself");

    next();
});

const ConnectionRequestModel = mongoose.model("ConnectionRequest",connectionRequestSchema);

module.exports=ConnectionRequestModel ;