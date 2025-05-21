import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date        
    }
})

const Workspace = mongoose.model('Workspace', workspaceSchema)

export default Workspace