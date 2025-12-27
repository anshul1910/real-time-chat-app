const mongoose = require("mongoose");

const GroupMessageSchema = new mongoose.Schema({
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender_name: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GroupMessage", GroupMessageSchema);