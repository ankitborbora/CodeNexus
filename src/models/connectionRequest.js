const mongoose = require("mongoose");

const connectionRequestSchema=mongoose.Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
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

connectionRequestSchema.index({ fromUserId:1, toUserId:1 });//creating a compound index for both the fields as we will be using them together for querying out the requests

connectionRequestSchema.pre("save",function(next){
    //checking if user is trying to send a request to himself
    if(this.fromUserId.equals(this.toUserId)) throw new Error("Cannot send request to yourself");

    next();
});

const ConnectionRequestModel = mongoose.model("ConnectionRequest",connectionRequestSchema);

module.exports=ConnectionRequestModel ;