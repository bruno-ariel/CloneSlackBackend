import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    },
    createBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now        
    }
})

const Channel = mongoose.model('Channel', workspaceSchema)

export default Channel